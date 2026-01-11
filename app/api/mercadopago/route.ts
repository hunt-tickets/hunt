import { Payment, MercadoPagoConfig } from "mercadopago";
import { revalidatePath } from "next/cache";
import { convertReservationToOrder } from "@/lib/reservations";
import {
  validateMercadoPagoSignature,
  validateMercadoPagoTimestamp,
} from "@/lib/helpers/mercadopago-signature";
import { createClient } from "@/lib/supabase/server";

/**
 * Mercado Pago Webhook Handler
 *
 * Flow:
 * 1. Validate webhook signature (x-signature) to ensure it's from MercadoPago
 * 2. Parse notification and extract payment ID
 * 3. Fetch full payment details from MP API
 * 4. If payment approved → convert reservation to order
 * 5. Send ticket emails (TODO: implement email sending)
 *
 * Security:
 * - ✅ Verifies webhook signature using x-signature header
 * - ✅ Validates timestamp to prevent replay attacks
 * - Idempotent: safe to call multiple times for same payment
 */
export async function POST(request: Request) {
  try {
    console.log("[Webhook] ===== NEW WEBHOOK RECEIVED =====");

    // STEP 1: SECURITY - Validate webhook signature
    // This ensures the webhook is actually from MercadoPago and not an attacker
    const headers = request.headers;
    const url = new URL(request.url);

    // Extract signature-related headers and query params
    const xSignature = headers.get("x-signature");
    const xRequestId = headers.get("x-request-id");
    const dataId = url.searchParams.get("data.id");

    console.log("[Webhook] Params received:", {
      hasSignature: !!xSignature,
      hasRequestId: !!xRequestId,
      hasDataIdInQuery: !!dataId,
      url: url.toString(),
    });

    // Validate the signature
    const isValidSignature = validateMercadoPagoSignature(
      xSignature,
      xRequestId,
      dataId,
      process.env.MP_WEBHOOK_SECRET
    );

    if (!isValidSignature) {
      console.error("[Webhook] ❌ Signature validation FAILED - rejecting");
      return new Response("Unauthorized - Invalid signature", {
        status: 401,
      });
    }

    // OPTIONAL: Validate timestamp to prevent replay attacks
    // This rejects webhooks older than 5 minutes
    const isValidTimestamp = validateMercadoPagoTimestamp(xSignature, 300);

    if (!isValidTimestamp) {
      console.error("[Webhook] ❌ Timestamp validation FAILED - too old");
      return new Response("Unauthorized - Timestamp too old", {
        status: 401,
      });
    }

    console.log("[Webhook] ✅ Security validation passed");

    // STEP 2: Parse webhook notification
    const body: { data: { id: string }; type: string } = await request.json();

    console.log(`[Webhook] Type: ${body.type}, Payment ID: ${body.data?.id}`);

    // Only process payment notifications
    if (body.type !== "payment") {
      console.log("[Webhook] ⏭️  Skipping non-payment notification");
      return new Response(null, { status: 200 });
    }

    // Get payment details from Mercado Pago
    // Note: Using marketplace access token here
    const mercadopago = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    const payment = await new Payment(mercadopago).get({
      id: body.data.id,
    });

    console.log(payment, payment.fee_details);

    // console.log(
    //   `[Webhook] Payment fetched - Status: ${payment.status}, Amount: ${payment.transaction_amount} ${payment.currency_id}`
    // );

    // Only process approved payments
    if (payment.status !== "approved") {
      console.log(
        `[Webhook] ⏭️  Payment status is '${payment.status}' (not approved), skipping`
      );
      return new Response(null, { status: 200 });
    }

    // Extract reservation ID and platform from metadata
    const reservationId = payment.metadata?.reservation_id as
      | string
      | undefined;
    const platform =
      (payment.metadata?.platform as "web" | "app" | "cash") || "web";
    const currency = payment.currency_id || "COP";

    // Extract fees from fee_details
    const feeDetails = payment.fee_details || [];
    const processorFee =
      feeDetails.find((f) => f.type === "mercadopago_fee")?.amount || 0;
    const marketplaceFee =
      feeDetails.find((f) => f.type === "application_fee")?.amount || 0;

    if (!reservationId) {
      console.error("[Webhook] ❌ No reservation_id in payment metadata");
      return new Response("Missing reservation_id in metadata", {
        status: 400,
      });
    }

    console.log(
      `[Webhook] Processing reservation ${reservationId} (platform: ${platform})`
    );

    const order = await convertReservationToOrder(
      reservationId,
      payment.id?.toString(), // Use payment ID as idempotency key
      platform,
      currency,
      marketplaceFee,
      processorFee
    );

    console.log(
      `[Webhook] ✅ SUCCESS - Order ${order.order_id} created with ${order.ticket_ids.length} tickets`
    );

    // Trigger PDF generation (fire-and-forget - don't await!)
    // This runs in the background and won't block the webhook response
    createClient()
      .then((supabase) =>
        supabase.functions.invoke("payment-pdf-gen", {
          body: { order_id: order.order_id },
        })
      )
      .catch((error) => {
        // Log but don't throw - this is non-blocking background work
        console.error(
          "[Webhook] ⚠️ PDF generation failed (non-blocking):",
          error
        );
      });

    // Revalidate relevant pages
    revalidatePath("/");
    revalidatePath("/tickets");

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        order_id: order.order_id,
        tickets_count: order.ticket_ids.length,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[Webhook] ❌ ERROR:", error);

    // Return 200 to prevent MP from retrying
    // (We log the error for debugging)
    return new Response(
      JSON.stringify({
        error: error,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}
