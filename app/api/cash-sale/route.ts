import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

interface CartItem {
  ticket_type_id: string;
  quantity: number;
}

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

    const supabase = await createClient();

    // 4. Get event and its organization
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, organization_id, name")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // 5. Verify seller is a member of the organization
    const { data: membership, error: memberError } = await supabase
      .from("member")
      .select("id, role")
      .eq("organizationId", event.organization_id)
      .eq("userId", sellerId)
      .single();

    if (memberError || !membership) {
      return NextResponse.json(
        {
          success: false,
          error: "No tienes permisos para vender tickets de este evento",
        },
        { status: 403 }
      );
    }

    // 6. Find or create buyer by email
    const normalizedEmail = buyerEmail.toLowerCase().trim();
    const { data: buyerData, error: buyerError } = await supabase
      .from("user")
      .select("id, email, name")
      .eq("email", normalizedEmail)
      .single();

    let buyer = buyerData;
    let isNewUser = false;

    // If buyer doesn't exist, create passwordless account
    if (buyerError || !buyer) {
      console.log(
        "Seller is selling cash tickets to a non-existent user, creating passwordless account..."
      );

      // Create passwordless user (no account/credential entry - they'll use Email OTP to sign in)
      const newUserId = crypto.randomUUID();
      const now = new Date().toISOString();

      const { data: newUser, error: createError } = await supabase
        .from("user")
        .insert({
          id: newUserId,
          email: normalizedEmail,
          name: normalizedEmail.split("@")[0], // Temporary name from email
          emailVerified: false,
          createdAt: now,
          updatedAt: now,
        })
        .select("id, email, name")
        .single();

      if (createError || !newUser) {
        console.error("Error creating user:", createError);
        return NextResponse.json(
          { success: false, error: "Error al crear cuenta para el comprador" },
          { status: 500 }
        );
      }

      buyer = newUser;
      isNewUser = true;
    }

    // 7. Create reservation for the buyer (5 min expiry for cash sales)
    const { data: reservationData, error: reservationError } =
      await supabase.rpc("create_reservation_v2", {
        p_user_id: buyer.id,
        p_event_id: eventId,
        p_items: items,
        p_payment_processor: "cash",
        p_expiry_minutes: 5,
      });

    if (reservationError) {
      // Parse PostgreSQL errors into user-friendly messages
      const errorMessage = reservationError.message || String(reservationError);

      if (errorMessage.includes("Insufficient tickets available")) {
        const match = errorMessage.match(/Available: (\d+)/);
        const available = match ? match[1] : "0";
        return NextResponse.json(
          {
            success: false,
            error: `Solo quedan ${available} boletos disponibles`,
          },
          { status: 400 }
        );
      }
      if (errorMessage.includes("not available for sale at this time")) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Estas entradas no están disponibles para la venta en este momento",
          },
          { status: 400 }
        );
      }
      if (
        errorMessage.includes("Minimum order quantity") ||
        errorMessage.includes("Maximum order quantity")
      ) {
        const cleanMsg = errorMessage.split("CONTEXT")[0].trim();
        return NextResponse.json(
          { success: false, error: cleanMsg },
          { status: 400 }
        );
      }

      console.error("Reservation error:", reservationError);
      return NextResponse.json(
        { success: false, error: "Error al crear la reservación" },
        { status: 500 }
      );
    }

    if (!reservationData || reservationData.length === 0) {
      return NextResponse.json(
        { success: false, error: "Error al crear la reservación" },
        { status: 500 }
      );
    }

    const reservation = reservationData[0];

    // 8. Immediately convert to order (cash sale - no payment wait)
    const { data: orderData, error: orderError } = await supabase.rpc(
      "convert_reservation_to_order",
      {
        p_reservation_id: reservation.reservation_id,
        p_payment_session_id: `cash-${Date.now()}`,
        p_platform: "cash",
        p_currency: "COP",
        p_marketplace_fee: 0,
        p_processor_fee: 0,
        p_sold_by: sellerId,
      }
    );

    if (orderError) {
      console.error("Order conversion error:", orderError);
      return NextResponse.json(
        { success: false, error: "Error al procesar la orden" },
        { status: 500 }
      );
    }

    if (!orderData || orderData.length === 0) {
      return NextResponse.json(
        { success: false, error: "Error al procesar la orden" },
        { status: 500 }
      );
    }

    const order = orderData[0];
    const ticketsCount = order.ticket_ids?.length || 0;

    // 9. Send welcome email to new users (fire-and-forget)
    if (isNewUser) {
      const eventName = event.name || "un evento";

      console.log(`📧 [CASH SALE] Sending welcome email to ${buyer.email}...`);
      resend.emails
        .send({
          from: process.env.FROM_EMAIL!,
          to: buyer.email,
          subject: `¡Tienes ${ticketsCount} ticket(s) para ${eventName}!`,
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>¡Bienvenido a Hunt Tickets!</h2>
            <p>Se ha creado una cuenta para ti y tienes <strong>${ticketsCount} ticket(s)</strong> para <strong>${eventName}</strong>.</p>
            <p>Para ver tus tickets, inicia sesión con tu email usando un código de verificación:</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.BETTER_AUTH_URL || "https://hunt-tickets.com"}/sign-in"
                 style="background: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ver mis tickets
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              Usa tu email <strong>${buyer.email}</strong> para iniciar sesión.
              Recibirás un código de 6 dígitos para acceder.
            </p>
          </div>
        `,
        })
        .then((result) => {
          console.log(`✅ [CASH SALE] Welcome email sent to ${buyer.email}. Resend ID: ${result.data?.id}`);
        })
        .catch((err) => {
          console.error(`❌ [CASH SALE] Failed to send welcome email to ${buyer.email}:`, err);
        });
    }

    return NextResponse.json({
      success: true,
      order_id: order.order_id,
      tickets_count: ticketsCount,
      buyer: {
        email: buyer.email,
        name: buyer.name,
        isNewUser,
      },
      total_amount: parseFloat(reservation.total_amount),
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
