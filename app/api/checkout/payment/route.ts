import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { db } from "@/lib/drizzle";
import {
  paymentProcessorAccount,
  events,
  ticketTypes,
  reservations,
} from "@/lib/schema";
import { eq, and, sql, inArray } from "drizzle-orm";

// ============================================================================
// Types
// ============================================================================

interface BillingInfo {
  tipoDocumento: string;
  numeroDocumento: string;
  primerNombre: string;
  segundoNombre?: string;
  primerApellido: string;
  segundoApellido?: string;
  emailFactura: string;
}

// ============================================================================
// Helpers
// ============================================================================

function calculateMarketplaceFee(totalAmount: number): number {
  const feePercentage = parseFloat(
    process.env.MARKETPLACE_FEE_PERCENTAGE || "5",
  );
  const fee = (totalAmount * feePercentage) / 100;
  return Math.round(fee * 100) / 100;
}

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

/**
 * POST /api/checkout/payment
 * Step 2: Create MercadoPago preference with billing data
 * Assumes reservation already exists
 */
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
    const { reservationId, eventId, items, billingInfo } = body as {
      reservationId: string;
      eventId: string;
      items: Array<{ ticket_type_id: string; quantity: number }>;
      billingInfo: BillingInfo;
    };

    // 3. Validate reservation exists and belongs to user
    const reservation = await db.query.reservations.findFirst({
      where: and(
        eq(reservations.id, reservationId),
        eq(reservations.userId, userId),
      ),
    });

    if (!reservation || reservation.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: "Reserva no encontrada o expirada." },
        { status: 404 },
      );
    }

    // 4. Get event and organization
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

    // 5. Get organization's Mercado Pago credentials
    const mpCredentials = await getOrgMercadoPagoCredentials(organizationId);

    // 6. Create Mercado Pago client
    const mercadopago = new MercadoPagoConfig({
      accessToken: mpCredentials.accessToken,
    });

    // 7. Fetch ticket types to get prices and names
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

    // 8. Build preference items
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

    // 9. Calculate marketplace fee
    const totalAmount = Number(reservation.totalAmount);
    const marketplaceFee = calculateMarketplaceFee(totalAmount);

    // 10. Create Mercado Pago preference
    const appUrl = process.env.APP_URL || "http://localhost:3000";

    const preference = await new Preference(mercadopago).create({
      body: {
        items: preferenceItems,
        payer: {
          name: billingInfo.primerNombre,
          surname: [billingInfo.primerApellido, billingInfo.segundoApellido]
            .filter(Boolean)
            .join(" "),
          email: billingInfo.emailFactura,
          identification: {
            type: billingInfo.tipoDocumento,
            number: billingInfo.numeroDocumento,
          },
        },
        back_urls: {
          success: `${appUrl}/payment/success`,
          failure: `${appUrl}/payment/failure`,
          pending: `${appUrl}/payment/pending`,
        },
        auto_return: "approved",
        notification_url: `${appUrl}/api/mercadopago`,
        metadata: {
          reservation_id: reservationId,
          event_id: eventId,
          user_id: userId,
          organization_id: organizationId,
          platform: "web",
          billing_info: JSON.stringify(billingInfo),
        },
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: reservation.expiresAt.toISOString(),
        marketplace_fee: marketplaceFee,
      },
    });

    // 12. Update reservation with payment session ID
    await db.execute(
      sql`UPDATE reservations
          SET payment_session_id = ${preference.id}
          WHERE id = ${reservationId}`,
    );

    // 13. Return checkout URL
    return NextResponse.json({
      success: true,
      checkoutUrl: preference.init_point,
    });
  } catch (error: unknown) {
    console.error("Payment preference error:", error);

    let errorMessage = "Error al crear la preferencia de pago";

    if (error && typeof error === "object" && "message" in error) {
      errorMessage = String(error.message);
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    );
  }
}
