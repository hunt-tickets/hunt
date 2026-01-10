import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle";
import { events, venues } from "@/lib/schema";
import { eq, and, gte, or, isNull, asc } from "drizzle-orm";
import type { EventFinancialReport } from "@/lib/supabase/types";
import type { Event as EventSchema, TicketType } from "@/lib/schema";

/**
 * Event with venue information for display
 */
export type EventWithVenue = EventSchema & {
  venue_name: string | null;
  venue_city: string | null;
};

/**
 * Public event with venue information for display on home page
 */
export type PublicEventWithVenue = {
  id: string;
  name: string | null;
  description: string | null;
  date: Date | null;
  endDate: Date | null;
  status: boolean | null;
  flyer: string | null;
  category:
    | "fiestas"
    | "conciertos"
    | "festivales"
    | "bienestar"
    | "clases"
    | "ferias"
    | "deportes"
    | "teatro"
    | null;
  venue_name: string;
  venue_city: string;
};

/**
 * Event day type for multi-day events
 */
export type EventDayDetail = {
  id: string;
  name: string | null;
  date: Date;
  endDate: Date | null;
  sortOrder: number;
};

/**
 * Extended ticket type with day information
 */
export type TicketTypeWithDay = TicketType & {
  eventDayId: string | null;
};

/**
 * Full event details type for the event detail page
 */
export type EventDetail = {
  id: string;
  name: string | null;
  description: string | null;
  date: Date | null;
  endDate: Date | null;
  status: boolean | null;
  flyer: string | null;
  age: string | null;
  variableFee: string | null;
  venue_name: string;
  venue_city: string;
  venue_address: string | null;
  venue_latitude: string | null;
  venue_longitude: string | null;
  hour: string;
  end_hour: string;
  tickets: TicketTypeWithDay[];
  // Multi-day event support
  eventType: "single" | "multi_day" | "recurring" | "slots";
  eventDays: EventDayDetail[];
};

/**
 * Fetches all events for a given organization with venue information
 * @param organizationId - The UUID of the organization
 * @returns Array of Event objects with joined venue data
 */
export async function getOrganizationEvents(
  organizationId: string
): Promise<EventWithVenue[]> {
  const supabase = await createClient();

  try {
    const { data: events, error } = await supabase
      .from("events")
      .select(
        `
        *,
        venues (
          name,
          city
        )
      `
      )
      .eq("organization_id", organizationId)
      .is("deleted_at", null) // Exclude cancelled/deleted events
      .order("date", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Error fetching organization events:", error);
      return [];
    }

    // Transform the data to flatten venue info
    const eventsWithVenue: EventWithVenue[] = (events || []).map(
      (
        event: EventSchema & {
          venues?: { name: string | null; city: string | null } | null;
        }
      ) => ({
        ...event,
        venue_name: event.venues?.name || null,
        venue_city: event.venues?.city || null,
        venues: undefined, // Remove the nested venues object
      })
    );

    return eventsWithVenue;
  } catch (error) {
    console.error("Unexpected error fetching organization events:", error);
    return [];
  }
}

/**
 * Fetches full financial report for a specific event (includes all arrays)
 * Use getEventFinancialSummary() instead if you don't need transaction details
 * @param eventId - The UUID of the event
 * @returns EventFinancialReport or null if error
 */
export async function getEventFinancialReport(
  eventId: string
): Promise<EventFinancialReport | null> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc(
      "get_event_sales_summary_with_validation",
      {
        p_event_id: eventId,
      }
    );

    if (error) {
      console.error("Error fetching financial report:", error);
      return null;
    }

    return data as EventFinancialReport;
  } catch (error) {
    console.error("Unexpected error fetching financial report:", error);
    return null;
  }
}

/**
 * Fetches event producers with their details
 * @param eventId - The UUID of the event
 * @returns Array of producers for the event
 */
export async function getEventProducers(eventId: string) {
  const supabase = await createClient();

  // First, get the events_producers entries
  const { data: eventProducers, error: epError } = await supabase
    .from("events_producers")
    .select("id, created_at, producer_id")
    .eq("event_id", eventId);

  if (epError) {
    console.error("Error fetching events_producers:", epError);
    return [];
  }

  if (!eventProducers || eventProducers.length === 0) {
    return [];
  }

  // Then get the producers for those producer_ids
  const producerIds = eventProducers.map((ep) => ep.producer_id);

  const { data: producers, error: producersError } = await supabase
    .from("producers")
    .select("id, name, logo")
    .in("id", producerIds);

  if (producersError) {
    console.error("Error fetching producers:", producersError);
    return [];
  }

  // Combine the data
  return eventProducers.map((ep) => {
    const producer = producers?.find((p) => p.id === ep.producer_id);
    return {
      id: ep.id,
      created_at: ep.created_at,
      producer: producer || {
        id: ep.producer_id,
        name: null,
        logo: null,
      },
    };
  });
}

/**
 * Fetches all producers
 * @returns Array of all producers
 */
export async function getAllProducers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("producers")
    .select("id, name, logo")
    .order("name");

  if (error) {
    console.error("Error fetching all producers:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetches event artists with their details
 * @param eventId - The UUID of the event
 * @returns Array of artists in the event lineup
 */
export async function getEventArtists(eventId: string) {
  const supabase = await createClient();

  // First, get the lineup entries
  const { data: lineup, error: lineupError } = await supabase
    .from("lineup")
    .select("id, created_at, artist_id")
    .eq("event_id", eventId);

  if (lineupError) {
    console.error("Error fetching lineup:", lineupError);
    return [];
  }

  if (!lineup || lineup.length === 0) {
    return [];
  }

  // Then get the artists for those artist_ids
  const artistIds = lineup.map((l) => l.artist_id);

  const { data: artists, error: artistsError } = await supabase
    .from("artists")
    .select("id, name, description, category, logo")
    .in("id", artistIds);

  if (artistsError) {
    console.error("Error fetching artists:", artistsError);
    return [];
  }

  // Combine the data
  return lineup.map((l) => {
    const artist = artists?.find((a) => a.id === l.artist_id);
    return {
      id: l.id,
      created_at: l.created_at,
      artist: artist || {
        id: l.artist_id,
        name: null,
        description: null,
        category: null,
        logo: null,
      },
    };
  });
}

/**
 * Fetches all artists
 * @returns Array of all artists
 */
export async function getAllArtists() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("artists")
    .select("id, name, description, category, logo")
    .order("name");

  if (error) {
    console.error("Error fetching all artists:", error);
    return [];
  }

  return data || [];
}

/**
 * Fetches all ticket types for an event
 * @param eventId - The UUID of the event
 * @returns Array of ticket types
 */
export async function getEventTicketTypes(eventId: string) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("ticket_types")
      .select("*")
      .eq("event_id", eventId)
      .eq("active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching ticket types:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching ticket types:", error);
    return [];
  }
}

/**
 * Fetches popular/active events from the database for the home page
 * Returns events that are active and haven't ended yet, ordered by priority and date
 *
 * Uses Drizzle (no cookies dependency) to allow ISR/static generation
 */
export async function getEventsWithVenue(
  limitCount: number = 12
): Promise<PublicEventWithVenue[]> {
  try {
    const now = new Date();

    const results = await db
      .select({
        id: events.id,
        name: events.name,
        description: events.description,
        date: events.date,
        endDate: events.endDate,
        status: events.status,
        flyer: events.flyer,
        category: events.category,
        venue_name: venues.name,
        venue_city: venues.city,
      })
      .from(events)
      .leftJoin(venues, eq(events.venueId, venues.id))
      .where(
        and(
          eq(events.status, true),
          eq(events.lifecycleStatus, "active"), // Extra safety
          or(gte(events.endDate, now), isNull(events.endDate))
        )
      )
      .orderBy(asc(events.date))
      .limit(limitCount);

    return results.map((event) => ({
      id: event.id,
      name: event.name,
      description: event.description,
      date: event.date,
      endDate: event.endDate,
      status: event.status,
      flyer: event.flyer,
      category: event.category,
      venue_name: event.venue_name || "Venue",
      venue_city: event.venue_city || "Ciudad",
    }));
  } catch (error) {
    console.error("Unexpected error fetching popular events:", error);
    return [];
  }
}

/**
 * Fetches a single event by ID with all details for the event page
 * Uses get_ticket_availability RPC for accurate ticket counts with lazy expiration
 */
export async function getEventById(
  eventId: string
): Promise<{ data: EventDetail | null; error: { message: string } | null }> {
  const supabase = await createClient();

  try {
    // Fetch event data (with nested event_days) and ticket availability in parallel
    const [eventResult, ticketResult] = await Promise.all([
      supabase
        .from("events")
        .select(
          `
          id,
          name,
          description,
          date,
          end_date,
          status,
          flyer,
          age,
          variable_fee,
          type,
          venues (
            name,
            city,
            address,
            latitude,
            longitude
          ),
          event_days (
            id,
            name,
            date,
            end_date,
            sort_order
          )
        `
        )
        .eq("id", eventId)
        .single(),
      // Use RPC for accurate availability with lazy expiration (includes event_day_id)
      supabase.rpc("get_ticket_availability_v2", { p_event_id: eventId }),
    ]);

    if (eventResult.error) {
      console.error("Error fetching event by ID:", eventResult.error);
      return { data: null, error: { message: eventResult.error.message } };
    }

    const event = eventResult.data;
    if (!event) {
      return { data: null, error: { message: "Event not found" } };
    }

    if (ticketResult.error) {
      console.error("Error fetching ticket availability:", ticketResult.error);
      // Continue without tickets rather than failing entirely
    }

    // Handle venue data
    const venueData = event.venues as unknown;
    const venue = Array.isArray(venueData)
      ? (venueData[0] as
          | {
              name: string | null;
              city: string | null;
              address: string | null;
              latitude: string | null;
              longitude: string | null;
            }
          | undefined)
      : (venueData as {
          name: string | null;
          city: string | null;
          address: string | null;
          latitude: string | null;
          longitude: string | null;
        } | null);

    // Handle ticket types from RPC result
    const ticketTypes = ticketResult.data || [];

    // Handle event days from nested select
    const eventDaysData =
      (event.event_days as unknown as Array<{
        id: string;
        name: string | null;
        date: string;
        end_date: string | null;
        sort_order: number | null;
      }>) || [];

    // Sort event days by sort_order
    const sortedDays: EventDayDetail[] = eventDaysData
      .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((d) => ({
        id: d.id,
        name: d.name,
        date: new Date(d.date),
        endDate: d.end_date ? new Date(d.end_date) : null,
        sortOrder: d.sort_order || 0,
      }));

    // Format hours from date
    const formatHour = (date: string | null): string => {
      if (!date) return "--:--";
      return new Date(date).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const eventDetail: EventDetail = {
      id: event.id,
      name: event.name,
      description: event.description,
      date: event.date ? new Date(event.date) : null,
      endDate: event.end_date ? new Date(event.end_date) : null,
      status: event.status,
      flyer: event.flyer,
      age: event.age,
      variableFee: event.variable_fee,
      venue_name: venue?.name || "Venue",
      venue_city: venue?.city || "Ciudad",
      venue_address: venue?.address || null,
      venue_latitude: venue?.latitude || null,
      venue_longitude: venue?.longitude || null,
      hour: formatHour(event.date),
      end_hour: formatHour(event.end_date),
      // Multi-day event support
      eventType: (event.type as EventDetail["eventType"]) || "single",
      eventDays: sortedDays,
      tickets: ticketTypes.map((t: Record<string, unknown>) => ({
        id: t.ticket_type_id as string,
        eventId: event.id,
        eventDayId: (t.event_day_id as string | null) || null,
        name: t.ticket_name as string,
        description: t.description as string | null,
        price: t.price as string,
        capacity: t.capacity as number,
        soldCount: t.sold_count as number,
        reservedCount: t.reserved_count as number,
        minPerOrder: t.min_per_order as number,
        maxPerOrder: t.max_per_order as number,
        saleStart: t.sale_start ? new Date(t.sale_start as string) : null,
        saleEnd: t.sale_end ? new Date(t.sale_end as string) : null,
        createdAt: new Date(),
        updatedAt: null,
        active: true, // RPC only returns active tickets
      })),
    };

    return { data: eventDetail, error: null };
  } catch (error) {
    console.error("Unexpected error fetching event:", error);
    return { data: null, error: { message: "Unexpected error" } };
  }
}

/**
 * Adds a producer to an event (database operation only)
 * @param eventId - The UUID of the event
 * @param producerId - The UUID of the producer
 * @returns Success/error response
 */
export async function addProducerToEventDb(
  eventId: string,
  producerId: string
) {
  const supabase = await createClient();

  // Check if producer is already added
  const { data: existing } = await supabase
    .from("events_producers")
    .select("id")
    .eq("event_id", eventId)
    .eq("producer_id", producerId)
    .single();

  if (existing) {
    return {
      success: false,
      message: "El productor ya está asignado a este evento",
    };
  }

  const { error } = await supabase.from("events_producers").insert({
    event_id: eventId,
    producer_id: producerId,
  });

  if (error) {
    console.error("Error adding producer to event:", error);
    return { success: false, message: "Error al agregar el productor" };
  }

  return { success: true, message: "Productor agregado exitosamente" };
}

/**
 * Adds an artist to an event lineup (database operation only)
 * @param eventId - The UUID of the event
 * @param artistId - The UUID of the artist
 * @returns Success/error response
 */
export async function addArtistToEventDb(eventId: string, artistId: string) {
  const supabase = await createClient();

  // Check if artist is already added
  const { data: existing } = await supabase
    .from("lineup")
    .select("id")
    .eq("event_id", eventId)
    .eq("artist_id", artistId)
    .single();

  if (existing) {
    return {
      success: false,
      message: "El artista ya está asignado a este evento",
    };
  }

  const { error } = await supabase.from("lineup").insert({
    event_id: eventId,
    artist_id: artistId,
  });

  if (error) {
    console.error("Error adding artist to event:", error);
    return { success: false, message: "Error al agregar el artista" };
  }

  return { success: true, message: "Artista agregado exitosamente" };
}

/**
 * Toggle event status with validation (database operation only)
 * @param eventId - The UUID of the event
 * @param status - The new status (true = active, false = inactive)
 * @returns Success/error response with status
 */
export async function toggleEventStatusDb(eventId: string, status: boolean) {
  const supabase = await createClient();

  // If activating the event, validate requirements are met based on event type
  if (status === true) {
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select(
        `
        id,
        type,
        date,
        ticket_types (id),
        event_days (id)
      `
      )
      .eq("id", eventId)
      .single();

    if (fetchError || !event) {
      console.error("Error fetching event for validation:", fetchError);
      return { success: false, message: "Error al validar el evento" };
    }

    const eventType = event.type || "single";
    const hasTicketTypes = (event.ticket_types?.length ?? 0) > 0;
    const missing: string[] = [];

    // Validate based on event type
    switch (eventType) {
      case "single":
        // Single events require a date
        if (!event.date) {
          missing.push("fecha");
        }
        break;

      case "multi_day":
        // Multi-day events require at least one event_day
        const hasEventDays = (event.event_days?.length ?? 0) > 0;
        if (!hasEventDays) {
          missing.push("al menos un día configurado");
        }
        break;

      case "recurring":
      case "slots":
        // Future: add specific validation for these types
        if (!event.date) {
          missing.push("fecha");
        }
        break;
    }

    // All event types require tickets
    if (!hasTicketTypes) {
      missing.push("al menos una entrada");
    }

    if (missing.length > 0) {
      return {
        success: false,
        message: `No se puede activar el evento. Falta: ${missing.join(", ")}`,
      };
    }
  }

  const { error } = await supabase
    .from("events")
    .update({ status })
    .eq("id", eventId);

  if (error) {
    console.error("Error toggling event status:", error);
    return { success: false, message: "Error al cambiar el estado del evento" };
  }

  return {
    success: true,
    message: status ? "Evento activado" : "Evento desactivado",
    status,
  };
}

/**
 * Cancel an event with proper validation and refund workflow initiation
 *
 * ⚠️ WARNING: This initiates event cancellation (PERMANENT process)
 *
 * What this function does:
 * 1. Calls cancel_event_v1 RPC function (atomic DB operations)
 * 2. Event moves to 'cancellation_pending' state
 * 3. Tickets are cancelled (users cannot use them)
 * 4. Returns count of paid orders that need manual resolution
 *
 * What this function DOES NOT do:
 * - Does NOT create refund records (admin must do manually)
 * - Does NOT call Mercado Pago API (happens later in refund workflow)
 * - Does NOT fully cancel event (only after all refunds processed)
 *
 * Cancellation Rules:
 * - Cannot cancel within 24 hours of event start (if tickets sold)
 * - Event becomes hidden and locked immediately
 *
 * @param eventId - The UUID of the event to cancel
 * @param cancelledBy - User ID of who is cancelling
 * @param cancellationReason - Reason for cancellation (for audit trail)
 * @returns Success/error response with count of paid orders
 */
export async function cancelEvent(
  eventId: string,
  cancelledBy: string,
  cancellationReason: string
): Promise<{
  success: boolean;
  message: string;
  ticketsSold?: number;
  paidOrdersCount?: number;
}> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("cancel_event_v1", {
      p_event_id: eventId,
      p_cancelled_by: cancelledBy,
      p_cancellation_reason: cancellationReason,
    });

    if (error) {
      console.error("Error calling cancel_event_v1:", error);

      // Parse PostgreSQL errors into user-friendly messages
      const errorMessage = error.message || String(error);

      // Handle specific error cases
      if (errorMessage.includes("Event not found")) {
        return { success: false, message: "Evento no encontrado" };
      }
      if (errorMessage.includes("already cancelled or cancellation is pending")) {
        return {
          success: false,
          message: "El evento ya está cancelado o la cancelación está pendiente",
        };
      }
      if (errorMessage.includes("Can only cancel active events")) {
        return {
          success: false,
          message: "Solo se pueden cancelar eventos activos",
        };
      }
      if (errorMessage.includes("Cannot cancel within 24 hours")) {
        // Extract hours remaining from error message
        const match = errorMessage.match(/Hours remaining: ([\d.]+)/);
        const hours = match ? parseFloat(match[1]) : 0;
        return {
          success: false,
          message: `No se puede cancelar dentro de las 24 horas previas al evento. Quedan ${hours.toFixed(1)} horas.`,
        };
      }

      // Generic error
      return {
        success: false,
        message: errorMessage || "Error al cancelar el evento",
      };
    }

    if (!data || data.length === 0) {
      return { success: false, message: "Error al cancelar el evento" };
    }

    const result = data[0];

    return {
      success: result.success,
      message: result.message,
      ticketsSold: result.tickets_sold,
      paidOrdersCount: result.paid_orders_count,
    };
  } catch (error) {
    console.error("Unexpected error cancelling event:", error);
    return {
      success: false,
      message: "Error inesperado al cancelar el evento",
    };
  }
}
