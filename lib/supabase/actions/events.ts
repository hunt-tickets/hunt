"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle";
import { events, venues } from "@/lib/schema";
import { eq, and, gte, or, isNull, asc } from "drizzle-orm";
import { z } from "zod";
import type { EventFinancialReport } from "@/lib/supabase/types";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Event as EventSchema, TicketType } from "@/lib/schema";
import { EVENT_CATEGORIES } from "@/constants/event-categories";

const eventFormSchema = z.object({
  name: z.string().min(1, "El nombre del evento es requerido"),
  type: z.enum(["single", "multi_day", "recurring", "slots"]).default("single"),
});

export type EventFormState = {
  errors?: {
    name?: string[];
    type?: string[];
  };
  message?: string;
};

export async function createEvent(
  organizationId: string,
  _prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  // Get session using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { message: "No autenticado" };
  }

  const user = session.user;
  const supabase = await createClient();

  // Validate form data
  const validatedFields = eventFormSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type") || "single",
  });

  if (!validatedFields.success) {
    const fieldErrors: Record<string, string[]> = {};

    for (const issue of validatedFields.error.issues) {
      const fieldName = issue.path[0] as string;
      if (fieldName) {
        if (!fieldErrors[fieldName]) {
          fieldErrors[fieldName] = [];
        }
        fieldErrors[fieldName].push(issue.message);
      }
    }

    return {
      errors: fieldErrors as EventFormState["errors"],
      message: "Campos inválidos. Por favor revise el formulario.",
    };
  }

  const { data: validData } = validatedFields;

  // Create event in database with name, type, and organization
  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .insert({
      organization_id: organizationId,
      name: validData.name,
      type: validData.type,
    })
    .select("id")
    .single();

  if (eventError || !eventData) {
    console.error("Error creating event:", eventError);
    return {
      message: "Error al crear el evento. Por favor intente nuevamente.",
    };
  }

  // Redirect to the event configuration page
  redirect(
    `/profile/${user.id}/organizaciones/${organizationId}/administrador/event/${eventData.id}/configuracion`
  );
}

/**
 * Event with venue information for display
 */
export type EventWithVenue = EventSchema & {
  venue_name: string | null;
  venue_city: string | null;
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

export async function addProducerToEvent(eventId: string, producerId: string) {
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

  revalidatePath(`/profile/[userId]/administrador/event/${eventId}`, "page");

  return { success: true, message: "Productor agregado exitosamente" };
}

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

export async function addArtistToEvent(eventId: string, artistId: string) {
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

  revalidatePath(`/profile/[userId]/administrador/event/${eventId}`, "page");

  return { success: true, message: "Artista agregado exitosamente" };
}

// Ticket Type Form State
export type TicketTypeFormState = {
  errors?: {
    name?: string[];
    description?: string[];
    price?: string[];
    capacity?: string[];
    minPerOrder?: string[];
    maxPerOrder?: string[];
    saleStart?: string[];
    saleEnd?: string[];
  };
  message?: string;
  success?: boolean;
};

/**
 * Creates a new ticket type for an event
 * @param eventId - The UUID of the event
 * @param formData - The ticket type form data
 * @returns TicketTypeFormState with success/error information
 */
export async function createTicketType(
  eventId: string,
  formData: {
    name: string;
    description?: string;
    price: number;
    capacity: number;
    minPerOrder?: number;
    maxPerOrder?: number;
    saleStart?: string;
    saleEnd?: string;
    eventDayId?: string; // Link to specific day (undefined = all days)
  }
): Promise<TicketTypeFormState> {
  const supabase = await createClient();

  // Validate required fields
  if (!formData.name || formData.name.trim() === "") {
    return {
      errors: { name: ["El nombre es requerido"] },
      message: "El nombre es requerido",
      success: false,
    };
  }

  if (formData.price < 0) {
    return {
      errors: { price: ["El precio debe ser mayor o igual a 0"] },
      message: "El precio debe ser mayor o igual a 0",
      success: false,
    };
  }

  if (formData.capacity < 1) {
    return {
      errors: { capacity: ["La capacidad debe ser al menos 1"] },
      message: "La capacidad debe ser al menos 1",
      success: false,
    };
  }

  try {
    const { error } = await supabase.from("ticket_types").insert({
      event_id: eventId,
      event_day_id: formData.eventDayId || null, // null = valid for all days
      name: formData.name.trim(),
      description: formData.description?.trim() || null,
      price: formData.price.toFixed(2),
      capacity: formData.capacity,
      min_per_order: formData.minPerOrder || 1,
      max_per_order: formData.maxPerOrder || 10,
      sale_start: formData.saleStart || null,
      sale_end: formData.saleEnd || null,
    });

    if (error) {
      console.error("Error creating ticket type:", error);
      return {
        message: `Error: ${error.message || "Error al crear el tipo de entrada"}`,
        success: false,
      };
    }

    revalidatePath(
      `/profile/[userId]/organizaciones/[organizationId]/administrador/event/[eventId]/entradas`,
      "page"
    );

    return {
      message: "Tipo de entrada creado exitosamente",
      success: true,
    };
  } catch (error) {
    console.error("Unexpected error creating ticket type:", error);
    return {
      message: "Error inesperado al crear el tipo de entrada",
      success: false,
    };
  }
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

export async function updateEventConfiguration(
  eventId: string,
  formData: {
    name?: string;
    description?: string;
    category?: (typeof EVENT_CATEGORIES)[number];
    // Note: type is intentionally not editable after creation
    date?: string;
    end_date?: string;
    age?: number;
    variable_fee?: number;
    fixed_fee?: number;
    city?: string;
    country?: string;
    address?: string;
    faqs?: Array<{ id: string; question: string; answer: string }>;
  }
) {
  // Get session using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return { success: false, message: "No autenticado" };
  }

  const supabase = await createClient();

  // Validate category if provided
  if (formData.category && !EVENT_CATEGORIES.includes(formData.category)) {
    return { success: false, message: "Categoría inválida" };
  }

  // Validate type-specific field constraints for date fields
  if (formData.date !== undefined || formData.end_date !== undefined) {
    // Check current event type
    const { data: currentEvent } = await supabase
      .from("events")
      .select("type")
      .eq("id", eventId)
      .single();

    // multi_day events should not have date set directly
    if (currentEvent?.type === "multi_day") {
      return {
        success: false,
        message:
          "Los eventos multi-día no pueden tener fecha directa. Use los días del evento.",
      };
    }
  }

  // Build update object with only provided fields
  const updateData: Partial<{
    name: string;
    description: string | null;
    category: string;
    date: string | null;
    end_date: string | null;
    age: number;
    variable_fee: number;
    fixed_fee: number;
    city: string | null;
    country: string | null;
    address: string | null;
    faqs: Array<{ id: string; question: string; answer: string }>;
  }> = {};

  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.description !== undefined)
    updateData.description = formData.description || null;
  if (formData.category !== undefined) updateData.category = formData.category;
  // Convert empty strings to null for date fields (PostgreSQL doesn't accept "")
  if (formData.date !== undefined) updateData.date = formData.date || null;
  if (formData.end_date !== undefined)
    updateData.end_date = formData.end_date || null;
  if (formData.age !== undefined) updateData.age = formData.age;
  if (formData.variable_fee !== undefined)
    updateData.variable_fee = formData.variable_fee;
  if (formData.fixed_fee !== undefined)
    updateData.fixed_fee = formData.fixed_fee;
  // Convert empty strings to null for optional text fields
  if (formData.city !== undefined) updateData.city = formData.city || null;
  if (formData.country !== undefined)
    updateData.country = formData.country || null;
  if (formData.address !== undefined)
    updateData.address = formData.address || null;
  if (formData.faqs !== undefined) updateData.faqs = formData.faqs;

  const { error } = await supabase
    .from("events")
    .update(updateData)
    .eq("id", eventId);

  if (error) {
    console.error("Error updating event configuration:", error);
    return { success: false, message: "Error al actualizar la configuración" };
  }

  revalidatePath(
    `/profile/[userId]/administrador/event/${eventId}/configuracion`,
    "page"
  );

  return { success: true, message: "Configuración actualizada exitosamente" };
}

/**
 * Toggle event status (active/inactive)
 * Only owners and administrators should be able to call this
 * Validates requirements based on event type:
 * - single: requires date + tickets
 * - multi_day: requires event_days + tickets
 */
export async function toggleEventStatus(eventId: string, status: boolean) {
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

  revalidatePath(
    `/profile/[userId]/organizaciones/[organizationId]/administrador/event/${eventId}`,
    "page"
  );

  return {
    success: true,
    message: status ? "Evento activado" : "Evento desactivado",
    status,
  };
}

/**
 * Event with venue information for the popular events display
 */
export type PopularEventWithVenue = {
  id: string;
  name: string | null;
  description: string | null;
  date: Date | null;
  endDate: Date | null;
  status: boolean | null;
  flyer: string | null;
  category: string | null;
  venue_name: string;
  venue_city: string;
};

/**
 * Fetches popular/active events from the database for the home page
 * Returns events that are active and haven't ended yet, ordered by priority and date
 *
 * Uses Drizzle (no cookies dependency) to allow ISR/static generation
 */
export async function getPopularEvents(
  limitCount: number = 12
): Promise<PopularEventWithVenue[]> {
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
