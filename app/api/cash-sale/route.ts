import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createReservation, convertReservationToOrder, type CartItem } from "@/lib/reservations";
import { db } from "@/lib/drizzle";
import { user, member, events } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // 1. Get authenticated user (seller)
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Debes iniciar sesión para continuar" },
        { status: 401 }
      );
    }

    const sellerId = session.user.id;

    // 2. Parse request body
    const body = await request.json();
    const { eventId, items, buyerEmail } = body as {
      eventId: string;
      items: CartItem[];
      buyerEmail: string;
    };

    // 3. Validate inputs
    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Evento no especificado" },
        { status: 400 }
      );
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No se seleccionaron tickets" },
        { status: 400 }
      );
    }

    if (!buyerEmail) {
      return NextResponse.json(
        { success: false, error: "Email del comprador requerido" },
        { status: 400 }
      );
    }

    // 4. Get event and its organization
    const event = await db.query.events.findFirst({
      where: eq(events.id, eventId),
      columns: { id: true, organizationId: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // 5. Verify seller is a member of the organization
    const memberRecord = await db.query.member.findFirst({
      where: and(
        eq(member.userId, sellerId),
        eq(member.organizationId, event.organizationId)
      ),
    });

    if (!memberRecord) {
      return NextResponse.json(
        { success: false, error: "No tienes permisos para vender tickets de este evento" },
        { status: 403 }
      );
    }

    // 6. Find buyer by email
    const buyer = await db.query.user.findFirst({
      where: eq(user.email, buyerEmail.toLowerCase().trim()),
      columns: { id: true, email: true, name: true },
    });

    if (!buyer) {
      return NextResponse.json(
        { success: false, error: "No existe un usuario con ese email" },
        { status: 404 }
      );
    }

    // 7. Create reservation for the buyer
    const reservation = await createReservation(
      buyer.id,
      eventId,
      items,
      5 // Short expiry for cash sales (5 minutes)
    );

    // 8. Immediately convert to order (cash sale - no payment wait)
    const order = await convertReservationToOrder(
      reservation.reservation_id,
      `cash-${Date.now()}`, // Unique payment session ID for cash
      "cash",
      "COP",
      reservation.total_amount // net_amount = total_amount for cash (no fees)
    );

    return NextResponse.json({
      success: true,
      order_id: order.order_id,
      tickets_count: order.ticket_ids.length,
      buyer: {
        email: buyer.email,
        name: buyer.name,
      },
      total_amount: reservation.total_amount,
    });
  } catch (error: unknown) {
    console.error("Cash sale error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Error al procesar la venta";

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
