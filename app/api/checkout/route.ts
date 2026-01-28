import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createReservation, type CartItem } from "@/lib/reservations";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { db } from "@/lib/drizzle";
import { paymentProcessorAccount, events, ticketTypes } from "@/lib/schema";
import { eq, and, sql, inArray } from "drizzle-orm";

// ============================================================================
// Helper: Calculate Marketplace Fee
// ============================================================================

function calculateMarketplaceFee(totalAmount: number): number {
  const feePercentage = parseFloat(
    process.env.MARKETPLACE_FEE_PERCENTAGE || "5",
  );
  const fee = (totalAmount * feePercentage) / 100;
  return Math.round(fee * 100) / 100;
}

// ============================================================================
// Helper: Get Organization's Mercado Pago Credentials
// ============================================================================

async function getOrgMercadoPagoCredentials(organizationId: string) {
  const account = await db.query.paymentProcessorAccount.findFirst({
    where: and(
      eq(paymentProcessorAccount.organizationId, organizationId),
      eq(paymentProcessorAccount.processorType, "mercadopago"),
      eq(paymentProcessorAccount.status, "active"),
    ),
  });

  if (!account) {
    throw new Error(
      "No active Mercado Pago account found for this organization",
    );
  }

  return {
    accessToken: account.accessToken,
    accountId: account.processorAccountId,
  };
}

// ============================================================================
// POST /api/checkout
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión para continuar" },
        { status: 401 },
      );
    }
    const userId = session.user.id;

    // 2. Parse request body
    const body = await request.json();
    const { eventId, items } = body as { eventId: string; items: CartItem[] };
    // 3. Validate cart items
    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "El carrito está vacío" },
        { status: 400 },
      );
    }

    // 4. Get (validate) event's organization ID
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, eventId), eq(events.lifecycleStatus, "active")),
      columns: { organizationId: true },
    });
    if (!event) {
      return NextResponse.json(
        { success: false, error: "Evento no encontrado" },
        { status: 404 },
      );
    }

    const organizationId = event.organizationId;

    // 5. Create reservation (atomic inventory lock)
    const reservation = await createReservation(userId, eventId, items);

    // 6. Get organization's Mercado Pago credentials
    const mpCredentials = await getOrgMercadoPagoCredentials(organizationId);

    // 7. Create Mercado Pago client with organization's access token
    const mercadopago = new MercadoPagoConfig({
      accessToken: mpCredentials.accessToken,
    });

    // 8. Fetch ticket types to get prices and names
    const ticketTypeIds = items.map((item) => item.ticket_type_id);
    const ticketTypesData = await db
      .select({
        id: ticketTypes.id,
        name: ticketTypes.name,
        price: ticketTypes.price,
      })
      .from(ticketTypes)
      .where(inArray(ticketTypes.id, ticketTypeIds));

    const ticketTypeMap = new Map(ticketTypesData.map((tt) => [tt.id, tt]));

    // 9. Build preference items with actual prices
    const preferenceItems = items.map((item) => {
      const tt = ticketTypeMap.get(item.ticket_type_id);
      return {
        id: item.ticket_type_id,
        title: tt?.name || `Entrada`,
        quantity: item.quantity,
        unit_price: Math.round(Number(tt?.price || 0)),
        currency_id: "COP",
      };
    });

    // 10. Calculate marketplace fee
    const marketplaceFee = calculateMarketplaceFee(reservation.total_amount);

    // 11. Create Mercado Pago preference
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
          platform: "web",
        },
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: reservation.expires_at,
        marketplace_fee: marketplaceFee,

        statement_descriptor: "Nuevo Hunt", // Max 13 characters
      },
    });

    // 11. Update reservation with payment session ID
    await db.execute(
      sql`UPDATE reservations
          SET payment_session_id = ${preference.id}
          WHERE id = ${reservation.reservation_id}`,
    );

    // 12. Return checkout URL
    return NextResponse.json({
      success: true,
      checkoutUrl: preference.init_point,
      reservation: {
        id: reservation.reservation_id,
        expires_at: reservation.expires_at,
        total_amount: reservation.total_amount,
      },
    });
  } catch (error: unknown) {
    console.error("Checkout error:", error);

    // Handle PostgreSQL errors (from Supabase RPC)
    let errorMessage = "Error al procesar el checkout";

    if (error && typeof error === "object") {
      // PostgreSQL/Supabase error format
      if ("message" in error && typeof error.message === "string") {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
