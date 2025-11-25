import { Payment, MercadoPagoConfig } from "mercadopago";
import { revalidatePath } from "next/cache";
import { convertReservationToOrder } from "@/lib/reservations";

/**
 * Mercado Pago Webhook Handler
 *
 * Flow:
 * 1. Mercado Pago sends notification when payment status changes
 * 2. Fetch full payment details from MP API
 * 3. If payment approved → convert reservation to order
 * 4. Send ticket emails (TODO: implement email sending)
 *
 * Security:
 * - TODO: Verify webhook signature (MP x-signature header)
 * - Idempotent: safe to call multiple times for same payment
 */

export async function POST(request: Request) {
  try {
    // Parse webhook notification
    const body: { data: { id: string }; type: string } = await request.json();

    console.log("[Webhook] Received notification:", body);

    // Only process payment notifications
    if (body.type !== "payment") {
      console.log("[Webhook] Skipping non-payment notification");
      return new Response(null, { status: 200 });
    }

    // Get payment details from Mercado Pago
    // Note: Using marketplace access token here
    // In production, you may need to use the seller's token stored in payment_processor_account
    const mercadopago = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    const payment = await new Payment(mercadopago).get({
      id: body.data.id,
    });

    console.log("[Webhook] Payment status:", payment.status);
    console.log("[Webhook] Payment metadata:", payment.metadata);

    // Only process approved payments
    if (payment.status !== "approved") {
      console.log("[Webhook] Payment not approved, skipping");
      return new Response(null, { status: 200 });
    }

    // Extract reservation ID and platform from metadata
    const reservationId = payment.metadata?.reservation_id as
      | string
      | undefined;
    const platform = (payment.metadata?.platform as "web" | "app" | "cash") || "web";

    if (!reservationId) {
      console.error("[Webhook] No reservation_id in payment metadata");
      return new Response("Missing reservation_id in metadata", {
        status: 400,
      });
    }

    // Convert reservation to order (idempotent)
    console.log("[Webhook] Converting reservation to order:", reservationId);

    const order = await convertReservationToOrder(
      reservationId,
      payment.id?.toString(), // Use payment ID as idempotency key
      platform
    );

    console.log("[Webhook] Order created:", order.order_id);
    console.log("[Webhook] Tickets generated:", order.ticket_ids.length);

    // TODO: Send ticket emails
    // await sendTicketEmails(order.order_id, order.ticket_ids);
    console.log("[Webhook] TODO: Send ticket emails for order", order.order_id);

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
    console.error("[Webhook] Error processing payment:", error);

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
