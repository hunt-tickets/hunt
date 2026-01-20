import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders, refunds } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Process refund for an order
 *
 * POST /api/events/[eventId]/refunds
 *
 * Body:
 *   - orderId: string (UUID)
 *   - platform: "web" | "app" | "cash"
 *
 * Flow:
 * 1. Get order details (amount, payment_session_id = MP payment ID)
 * 2. Create refund record in database
 * 3. Call MercadoPago API to process full refund
 * 4. Update refund status
 * 5. Return result
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    const body = await request.json();
    const { orderId, platform } = body as {
      orderId: string;
      platform: string;
    };

    console.log(`[Refunds] Processing refund for order ${orderId}`);

    if (!orderId)
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );

    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión para continuar" },
        { status: 401 }
      );
    }

    // Get the Order given the orderId in body
    const order = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.eventId !== eventId) {
      return NextResponse.json(
        { error: "Order does not belong to this event" },
        { status: 400 }
      );
    }
    if (order.paymentStatus !== "paid") {
      return NextResponse.json({ error: "Order is not paid" }, { status: 400 });
    }

    // Cash orders don't use MercadoPago API
    if (platform === "cash") {
      return NextResponse.json(
        {
          error: "Cash orders should use the mark-completed endpoint",
          shouldUseMarkCompleted: true,
        },
        { status: 400 }
      );
    }

    // Check if refund already exists
    const existingRefund = await db.query.refunds.findFirst({
      where: eq(refunds.orderId, orderId),
    });

    if (existingRefund) {
      // Return existing refund if already completed
      if (existingRefund.status === "completed") {
        console.log(`[Refunds] Refund already completed: ${existingRefund.id}`);
        return NextResponse.json({
          success: true,
          message: "Refund already completed",
          refund: existingRefund,
        });
      }

      // If pending/failed, we can retry
      console.log(
        `[Refunds] Retrying existing refund ${existingRefund.id} (status: ${existingRefund.status})`
      );
    }

    const mpPaymentId = order.paymentSessionId;
    if (!mpPaymentId) {
      return Response.json(
        { error: "No payment session ID found for this order" },
        { status: 400 }
      );
    }

    // Calculate refund amount (Option A: Full refund to customer)
    const refundAmount = parseFloat(order.totalAmount);
    console.log(
      `[Refunds] Full refund: ${refundAmount} ${order.currency} (customer gets full amount back)`
    );
    console.log(
      `[Refunds] Seller loses fees: MP=${order.processorFee}, Marketplace=${order.marketplaceFee}, ICA=${order.taxWithholdingIca}, Fuente=${order.taxWithholdingFuente}`
    );

    let refundRecord;
    if (existingRefund) {
      // Update existing refund for retry
      await db
        .update(refunds)
        .set({
          status: "processing",
          metadata: {
            ...(existingRefund.metadata as object),
            retryAttempt:
              ((existingRefund.metadata as any)?.retryAttempt || 0) + 1,
            retriedAt: new Date().toISOString(),
          },
        })
        .where(eq(refunds.id, existingRefund.id));

      refundRecord = { ...existingRefund, status: "processing" };
    } else {
      // Create new refund record
      const [newRefund] = await db
        .insert(refunds)
        .values({
          orderId: order.id,
          eventId: order.eventId,
          amount: order.totalAmount,
          currency: order.currency,
          reason: "event_cancelled",
          requestedBy: session.user.id
          ,
          mpPaymentId: mpPaymentId,
          status: "processing",
          metadata: {
            originalAmount: order.totalAmount,
            marketplaceFee: order.marketplaceFee,
            processorFee: order.processorFee,
            taxWithholdingIca: order.taxWithholdingIca,
            taxWithholdingFuente: order.taxWithholdingFuente,
          },
        })
        .returning();

      refundRecord = newRefund;
    }

    console.log(`[Refunds] Refund record: ${refundRecord.id}`);

    // Call MercadoPago API to process refund
    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) throw new Error("MP_ACCESS_TOKEN not configured.");

    const idempotencyKey = existingRefund?.id || randomUUID();
    console.log(
      `[Refunds] Calling MercadoPago: POST /v1/payments/${mpPaymentId}/refunds`
    );
    console.log(`[Refunds] Idempotency key: ${idempotencyKey}`);

    const mpResponse = await fetch(
      `https://api.mercadopago.com/v1/payments/${mpPaymentId}/refunds`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          "X-Idempotency-Key": idempotencyKey,
        },
        // Empty body = full refund (Option A)
        body: JSON.stringify({}),
      }
    );

    const mpData = await mpResponse.json();
    console.log(`[Refunds] MercadoPago response:`, {
      status: mpResponse.status,
      refundId: mpData.id,
      refundStatus: mpData.status,
      amount: mpData.amount,
    });

    if (!mpResponse.ok) {
      // Update refund with failure
      await db
        .update(refunds)
        .set({
          status: "failed",
          failureReason:
            mpData.message || mpData.error || "MercadoPago API error",
          metadata: {
            ...(refundRecord.metadata as object),
            mpError: mpData,
            mpErrorAt: new Date().toISOString(),
          },
        })
        .where(eq(refunds.id, refundRecord.id));

      console.error(`[Refunds] ❌ Failed:`, mpData);

      return NextResponse.json(
        {
          error: "Refund failed",
          details: mpData.message || mpData.error,
          mpResponse: mpData,
        },
        { status: mpResponse.status }
      );
    }

    // Update refund with success
    await db
      .update(refunds)
      .set({
        mpRefundId: mpData.id.toString(),
        status: "completed",
        processedAt: new Date(),
        metadata: {
          ...(refundRecord.metadata as object),
          mpRefundData: mpData,
          completedAt: new Date().toISOString(),
        },
      })
      .where(eq(refunds.id, refundRecord.id));

    // Update order status
    await db
      .update(orders)
      .set({
        paymentStatus: "refunded",
      })
      .where(eq(orders.id, orderId));

    console.log(`[Refunds] ✅ Refund completed successfully`);
    return NextResponse.json({
      success: true,
      message: "Refund processed successfully",
      refund: {
        id: refundRecord.id,
        mpRefundId: mpData.id,
        amount: refundAmount,
        status: "completed",
      },
    });
  } catch (error) {
    console.error("[Refunds] Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
