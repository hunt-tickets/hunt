import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createReservation, type CartItem } from "@/lib/reservations";
import { db } from "@/lib/drizzle";
import { events } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

/**
 * POST /api/checkout/reserve
 * Step 1: Create reservation (locks tickets)
 * This ensures the user won't lose their tickets while filling billing form
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
        { status: 401 }
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
        { status: 400 }
      );
    }

    // 4. Validate event exists and is active
    const event = await db.query.events.findFirst({
      where: and(eq(events.id, eventId), eq(events.lifecycleStatus, "active")),
      columns: { id: true, organizationId: true },
    });

    if (!event) {
      return NextResponse.json(
        { success: false, error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // 5. Create reservation (atomic inventory lock)
    const reservation = await createReservation(userId, eventId, items);

    // 6. Return reservation data
    return NextResponse.json({
      success: true,
      reservation: {
        id: reservation.reservation_id,
        expires_at: reservation.expires_at,
        total_amount: reservation.total_amount,
      },
    });
  } catch (error: unknown) {
    console.error("Reservation error:", error);

    let errorMessage = "Error al crear la reserva";

    if (error && typeof error === "object" && "message" in error) {
      errorMessage = String(error.message);
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
