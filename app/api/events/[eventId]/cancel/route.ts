import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { cancelEvent } from "@/lib/helpers/events";

/**
 * POST /api/events/[eventId]/cancel
 *
 * Cancel an event with proper validation and refund workflow initiation
 *
 * ⚠️ WARNING: This initiates PERMANENT event cancellation process
 *
 * Requirements:
 * - User must be authenticated
 * - User must have 'cancel' permission on event (admin/owner role)
 * - Event must be active (not already cancelled)
 * - If event has tickets sold, cannot cancel within 24 hours
 *
 * What happens:
 * 1. Event moves to 'cancellation_pending' state
 * 2. Event is hidden from public and locked from edits
 * 3. All tickets are cancelled (users cannot use them)
 * 4. Returns count of paid orders requiring manual refund processing
 *
 * Request body:
 * {
 *   cancellationReason: string,
 *   confirmZeroTickets?: boolean
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   ticketsSold?: number,
 *   paidOrdersCount?: number
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
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
    const { eventId } = await params;

    // 2. Parse request body
    const body = await request.json();
    const {
      cancellationReason,
      confirmZeroTickets = false,
    } = body as {
      cancellationReason: string;
      confirmZeroTickets?: boolean;
    };

    // 3. Validate cancellation reason
    if (!cancellationReason || cancellationReason.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error: "Debes proporcionar una razón para la cancelación",
        },
        { status: 400 }
      );
    }

    // 4. Validate event exists and get organization for permission check
    const supabase = await createClient();
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, organization_id, name, lifecycle_status")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    // 5. Check permissions
    // TODO: Add proper permission check using Better Auth organization roles
    // Verify user has 'cancel' permission on event (admin/owner role)
    // Example:
    // const { data: member } = await supabase
    //   .from("member")
    //   .select("role")
    //   .eq("user_id", userId)
    //   .eq("organization_id", event.organization_id)
    //   .single();
    //
    // if (!member || !['administrator', 'owner'].includes(member.role)) {
    //   return NextResponse.json(
    //     { success: false, error: "No tienes permisos para cancelar este evento" },
    //     { status: 403 }
    //   );
    // }

    // 6. Call helper function to cancel event
    const result = await cancelEvent(
      eventId,
      userId,
      cancellationReason.trim(),
      confirmZeroTickets
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    // 7. Return success response
    return NextResponse.json({
      success: true,
      message: result.message,
      ticketsSold: result.ticketsSold,
      paidOrdersCount: result.paidOrdersCount,
    });
  } catch (error: unknown) {
    console.error("Cancel event error:", error);

    let errorMessage = "Error al cancelar el evento";

    if (error && typeof error === "object") {
      if ("message" in error && typeof error.message === "string") {
        errorMessage = error.message;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
