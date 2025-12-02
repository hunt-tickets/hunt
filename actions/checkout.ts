"use server";

/**
 * Checkout Server Actions
 *
 * Handles the complete checkout flow:
 * 1. User clicks "Checkout" with cart items
 * 2. Create reservation (locks inventory atomically)
 * 3. Create Mercado Pago preference
 * 4. Return checkout URL + reservation details
 */

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createReservation, type CartItem } from "@/lib/reservations";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { db } from "@/lib/drizzle";
import { paymentProcessorAccount, events } from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";

// ============================================================================
// Types
// ============================================================================

interface CheckoutResult {
  success: boolean;
  checkoutUrl?: string;
  reservation?: {
    id: string;
    expires_at: string;
    total_amount: number;
  };
  error?: string;
}

// ============================================================================
// Helper: Calculate Marketplace Fee
// ============================================================================

/**
 * Calculate marketplace/platform fee (commission)
 *
 * @param totalAmount - Total order amount
 * @returns Fee amount in cents (for Mercado Pago)
 */
function calculateMarketplaceFee(totalAmount: number): number {
  // Platform commission percentage (configurable via env)
  const feePercentage = parseFloat(
    process.env.MARKETPLACE_FEE_PERCENTAGE || "5"
  );

  // Calculate fee and round to 2 decimals
  const fee = (totalAmount * feePercentage) / 100;

  // Return rounded value
  return Math.round(fee * 100) / 100;
}

// ============================================================================
// Helper: Get Organization's Mercado Pago Credentials
// ============================================================================

async function getOrgMercadoPagoCredentials(organizationId: string) {
  // Find the Event's Organization payment processor account
  const account = await db.query.paymentProcessorAccount.findFirst({
    where: and(
      eq(paymentProcessorAccount.organizationId, organizationId),
      eq(paymentProcessorAccount.processorType, "mercadopago"),
      eq(paymentProcessorAccount.status, "active")
    ),
  });

  if (!account) {
    throw new Error(
      "No active Mercado Pago account found for this organization"
    );
  }

  return {
    accessToken: account.accessToken,
    accountId: account.processorAccountId,
  };
}

// ============================================================================
// Main Checkout Action
// ============================================================================

/**
 * Process checkout: Create reservation + Mercado Pago preference
 *
 * @param eventId - Event UUID
 * @param items - Cart items [{ticket_type_id, quantity}]
 * @returns Checkout URL or error
 */
export async function checkoutAction(
  eventId: string,
  items: CartItem[]
): Promise<CheckoutResult> {
  try {
    // 1. Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        success: false,
        error: "Debes iniciar sesión para continuar",
      };
    }

    const userId = session.user.id;

    // 2. Validate cart items
    if (!items || items.length === 0) {
      return {
        success: false,
        error: "El carrito está vacío",
      };
    }

    // 3. Get event's organization ID (needed for MP credentials)
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      columns: { organizationId: true },
    });

    if (!event) {
      return {
        success: false,
        error: "Evento no encontrado",
      };
    }

    const organizationId = event.organizationId;

    // 4. Create reservation (atomic inventory lock)
    const reservation = await createReservation(userId, eventId, items);

    // 5. Get organization's Mercado Pago credentials
    const mpCredentials = await getOrgMercadoPagoCredentials(organizationId);

    // 6. Create Mercado Pago client with organization's access token
    const mercadopago = new MercadoPagoConfig({
      accessToken: mpCredentials.accessToken,
    });

    // 7. Build preference items from reservation
    const preferenceItems = items.map((item) => ({
      id: item.ticket_type_id,
      title: `Entrada - ${item.ticket_type_id.substring(0, 8)}`, // You may want to fetch ticket type name
      quantity: item.quantity,
      unit_price:
        reservation.total_amount /
        items.reduce((sum, i) => sum + i.quantity, 0), // Calculate per-ticket price
      currency_id: "COP", // Adjust based on your region
    }));

    // 8. Calculate marketplace fee (platform commission)
    const marketplaceFee = calculateMarketplaceFee(reservation.total_amount);

    // 9. Create Mercado Pago preference
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    const preference = await new Preference(mercadopago).create({
      body: {
        items: preferenceItems,
        back_urls: {
          success: `${appUrl}/payment/success`,
          failure: `${appUrl}/payment/failure`,
          pending: `${appUrl}/payment/pending`,
        },
        auto_return: "approved",
        notification_url: `${appUrl}/api/mercadopago`,
        metadata: {
          reservation_id: reservation.reservation_id,
          event_id: eventId,
          user_id: userId,
          organization_id: organizationId,
        },
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: reservation.expires_at,
        // Platform commission (deducted from seller's payout)
        marketplace_fee: marketplaceFee,
      },
    });

    // 10. Update reservation with payment session ID
    await db.execute(
      sql`UPDATE reservations
          SET payment_session_id = ${preference.id}
          WHERE id = ${reservation.reservation_id}`
    );

    // 11. Return checkout URL
    return {
      success: true,
      checkoutUrl: preference.init_point!,
      reservation: {
        id: reservation.reservation_id,
        expires_at: reservation.expires_at,
        total_amount: reservation.total_amount,
      },
    };
  } catch (error: any) {
    console.error("Checkout error:", error);

    return {
      success: false,
      error: error.message || "Error al procesar el checkout",
    };
  }
}
