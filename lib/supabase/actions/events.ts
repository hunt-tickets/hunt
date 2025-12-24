"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import type { EventFinancialReport } from "@/lib/supabase/types";
import { toZonedTime } from "date-fns-tz";
import { formatISO } from "date-fns";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Event as EventSchema } from "@/lib/schema";
import { EVENT_CATEGORIES } from "@/lib/constants/event-categories";

const eventFormSchema = z.object({
  organization_id: z.string().min(1, "El ID de la organización es requerido"),
  category: z.enum(EVENT_CATEGORIES, {
    message: "Selecciona una categoría válida",
  }),
  name: z.string().optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  start_time: z.string().optional(),
  end_date: z.string().optional(),
  end_time: z.string().optional(),
  venue_id: z.string().optional(),
  age: z.string().optional(),
  cash_sales: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  lists: z.string().optional(),
  courtesies: z.string().optional(),
  guest_list: z.string().optional(),
  guest_list_quantity: z.string().optional(),
  guest_list_info: z.string().optional(),
  guest_list_max_date: z.string().optional(),
  guest_list_max_time: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  address: z.string().optional(),
  extra_info: z.string().optional(),
  variable_fee: z.string().optional(),
  fixed_fee: z.string().optional(),
  pos_fee: z.string().optional(),
  late_fee: z.string().optional(),
  hex: z.string().optional(),
  hex_text: z.string().optional(),
  hex_text_secondary: z.string().optional(),
  guest_email: z.string().optional(),
  guest_name: z.string().optional(),
});

export type EventFormState = {
  errors?: {
    organization_id?: string[];
    category?: string[];
    name?: string[];
    description?: string[];
    start_date?: string[];
    start_time?: string[];
    end_date?: string[];
    end_time?: string[];
    venue_id?: string[];
    age?: string[];
    cash_sales?: string[];
    status?: string[];
    priority?: string[];
    lists?: string[];
    courtesies?: string[];
    guest_list?: string[];
    guest_list_quantity?: string[];
    guest_list_info?: string[];
    guest_list_max_date?: string[];
    guest_list_max_time?: string[];
    city?: string[];
    country?: string[];
    address?: string[];
    extra_info?: string[];
    variable_fee?: string[];
    fixed_fee?: string[];
    pos_fee?: string[];
    late_fee?: string[];
    hex?: string[];
    hex_text?: string[];
    hex_text_secondary?: string[];
    guest_email?: string[];
    guest_name?: string[];
  };
  message?: string;
  success?: boolean;
};

export async function createEvent(
  prevState: EventFormState,
  formData: FormData
): Promise<EventFormState> {
  // Get session using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    return {
      message: "No autenticado",
      success: false,
    };
  }

  const user = session.user;
  const supabase = await createClient();

  // Extract form data
  const rawFormData = {
    organization_id: formData.get("organization_id"),
    category: formData.get("category"),
    name: formData.get("name"),
    description: formData.get("description"),
    start_date: formData.get("start_date"),
    start_time: formData.get("start_time"),
    end_date: formData.get("end_date"),
    end_time: formData.get("end_time"),
    venue_id: formData.get("venue_id"),
    age: formData.get("age"),
    cash_sales: formData.get("cash_sales"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    lists: formData.get("lists"),
    courtesies: formData.get("courtesies"),
    guest_list: formData.get("guest_list"),
    guest_list_quantity: formData.get("guest_list_quantity") || "",
    guest_list_info: formData.get("guest_list_info") || "",
    guest_list_max_date: formData.get("guest_list_max_date") || "",
    guest_list_max_time: formData.get("guest_list_max_time") || "",
    city: formData.get("city") || "",
    country: formData.get("country") || "",
    address: formData.get("address") || "",
    extra_info: formData.get("extra_info") || "",
    variable_fee: formData.get("variable_fee") || "",
    fixed_fee: formData.get("fixed_fee") || "",
    pos_fee: formData.get("pos_fee") || "",
    late_fee: formData.get("late_fee") || "",
    hex: formData.get("hex") || "",
    hex_text: formData.get("hex_text") || "",
    hex_text_secondary: formData.get("hex_text_secondary") || "",
    guest_email: formData.get("guest_email") || "",
    guest_name: formData.get("guest_name") || "",
  };

  // Extract files for logging
  const flyerFile = formData.get("flyer") as File;
  const walletFile = formData.get("wallet") as File;
  const flyerOverlayFile = formData.get("flyer_overlay") as File;
  const flyerBackgroundFile = formData.get("flyer_background") as File;
  const flyerBannerFile = formData.get("flyer_banner") as File;

  console.log("📋 Raw FormData before validation:", rawFormData);
  console.log("📁 Files received:", {
    flyer: flyerFile
      ? { name: flyerFile.name, size: flyerFile.size, type: flyerFile.type }
      : null,
    wallet: walletFile
      ? { name: walletFile.name, size: walletFile.size, type: walletFile.type }
      : null,
    flyer_overlay: flyerOverlayFile
      ? { name: flyerOverlayFile.name, size: flyerOverlayFile.size, type: flyerOverlayFile.type }
      : null,
    flyer_background: flyerBackgroundFile
      ? { name: flyerBackgroundFile.name, size: flyerBackgroundFile.size, type: flyerBackgroundFile.type }
      : null,
    flyer_banner: flyerBannerFile
      ? { name: flyerBannerFile.name, size: flyerBannerFile.size, type: flyerBannerFile.type }
      : null,
  });

  // Validate form data
  const validatedFields = eventFormSchema.safeParse(rawFormData);

  if (!validatedFields.success) {
    // Format errors from issues (Zod v4 stable API)
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

    console.log("✅ Validation result:", {
      success: false,
      errors: fieldErrors,
    });

    return {
      errors: fieldErrors as EventFormState["errors"],
      message: "Campos inválidos. Por favor revise el formulario.",
      success: false,
    };
  }

  console.log("✅ Validation result:", {
    success: true,
    errors: null,
  });

  const { data: validData } = validatedFields;
  console.log(validData);

  try {
    // Convert dates from Bogota timezone to UTC (matching mobile app behavior)
    const BOGOTA_TZ = "America/Bogota";

    let startDateTime = null;
    if (validData.start_date && validData.start_time) {
      const startDateTimeBogota = toZonedTime(
        `${validData.start_date}T${validData.start_time}`,
        BOGOTA_TZ
      );
      startDateTime = formatISO(startDateTimeBogota);
    }

    let endDateTime = null;
    if (validData.end_date && validData.end_time) {
      const endDateTimeBogota = toZonedTime(
        `${validData.end_date}T${validData.end_time}`,
        BOGOTA_TZ
      );
      endDateTime = formatISO(endDateTimeBogota);
    }

    // Parse guest list max hour if provided
    let guestListMaxHour = null;
    if (validData.guest_list_max_date && validData.guest_list_max_time) {
      const guestListMaxBogota = toZonedTime(
        `${validData.guest_list_max_date}T${validData.guest_list_max_time}`,
        BOGOTA_TZ
      );
      guestListMaxHour = formatISO(guestListMaxBogota);
    }

    // File upload validation
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    // Validate flyer file
    if (flyerFile && flyerFile.size > 0) {
      if (flyerFile.size > MAX_FILE_SIZE) {
        return {
          message: "La imagen del flyer es muy grande. Máximo 5MB.",
          success: false,
        };
      }
      if (!ALLOWED_TYPES.includes(flyerFile.type)) {
        return {
          message:
            "Formato de imagen no válido para flyer. Use JPG, PNG o WebP.",
          success: false,
        };
      }
    }

    // Validate wallet file
    if (walletFile && walletFile.size > 0) {
      if (walletFile.size > MAX_FILE_SIZE) {
        return {
          message: "La imagen de wallet es muy grande. Máximo 5MB.",
          success: false,
        };
      }
      if (!ALLOWED_TYPES.includes(walletFile.type)) {
        return {
          message:
            "Formato de imagen no válido para wallet. Use JPG, PNG o WebP.",
          success: false,
        };
      }
    }

    // Validate additional flyer files
    if (flyerOverlayFile && flyerOverlayFile.size > 0) {
      if (flyerOverlayFile.size > MAX_FILE_SIZE) {
        return {
          message: "La imagen de overlay es muy grande. Máximo 5MB.",
          success: false,
        };
      }
      if (!ALLOWED_TYPES.includes(flyerOverlayFile.type)) {
        return {
          message: "Formato de imagen no válido para overlay. Use JPG, PNG o WebP.",
          success: false,
        };
      }
    }

    if (flyerBackgroundFile && flyerBackgroundFile.size > 0) {
      if (flyerBackgroundFile.size > MAX_FILE_SIZE) {
        return {
          message: "La imagen de background es muy grande. Máximo 5MB.",
          success: false,
        };
      }
      if (!ALLOWED_TYPES.includes(flyerBackgroundFile.type)) {
        return {
          message: "Formato de imagen no válido para background. Use JPG, PNG o WebP.",
          success: false,
        };
      }
    }

    if (flyerBannerFile && flyerBannerFile.size > 0) {
      if (flyerBannerFile.size > MAX_FILE_SIZE) {
        return {
          message: "La imagen de banner es muy grande. Máximo 5MB.",
          success: false,
        };
      }
      if (!ALLOWED_TYPES.includes(flyerBannerFile.type)) {
        return {
          message: "Formato de imagen no válido para banner. Use JPG, PNG o WebP.",
          success: false,
        };
      }
    }

    // Create event in database
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .insert({
        organization_id: validData.organization_id,
        category: validData.category,
        name: validData.name || null,
        description: validData.description || null,
        date: startDateTime,
        end_date: endDateTime,
        venue_id: validData.venue_id || null,
        age: validData.age ? parseInt(validData.age) : null,
        status: validData.status === "Activo",
        priority: validData.priority === "Activo",
        cash: validData.cash_sales === "Activo",
        private_list: validData.lists === "Activo",
        access_pass: validData.courtesies === "Activo",
        guest_list: validData.guest_list === "Activo",
        guest_list_quantity: validData.guest_list_quantity
          ? parseInt(validData.guest_list_quantity)
          : null,
        guest_list_info: validData.guest_list_info || null,
        guest_list_max_hour: guestListMaxHour,
        city: validData.city || null,
        country: validData.country || null,
        address: validData.address || null,
        extra_info: validData.extra_info || null,
        variable_fee: validData.variable_fee ? parseFloat(validData.variable_fee) : null,
        fixed_fee: validData.fixed_fee ? parseFloat(validData.fixed_fee) : null,
        pos_fee: validData.pos_fee ? parseFloat(validData.pos_fee) : null,
        late_fee: validData.late_fee ? parseFloat(validData.late_fee) : null,
        hex: validData.hex || null,
        hex_text: validData.hex_text || null,
        hex_text_secondary: validData.hex_text_secondary || "A3A3A3",
        guest_email: validData.guest_email || null,
        guest_name: validData.guest_name || null,
      })
      .select()
      .single();

    if (eventError) {
      console.error("Error creating event:", eventError);
      return {
        message: "Error al crear el evento. Por favor intente nuevamente.",
        success: false,
      };
    }

    let flyerUrl = null;
    let walletUrl = null;
    let flyerOverlayUrl = null;
    let flyerBackgroundUrl = null;
    let flyerBannerUrl = null;

    // Upload flyer if provided (using event ID from created event)
    if (flyerFile && flyerFile.size > 0) {
      const flyerExt = flyerFile.name.split(".").pop();
      const flyerPath = `flyers/${eventData.id}.${flyerExt}`;

      const { error: flyerError } = await supabase.storage
        .from("events")
        .upload(flyerPath, flyerFile);

      if (flyerError) {
        console.error("Error uploading flyer:", flyerError);
        return {
          message: `Error al subir la imagen del flyer: ${flyerError.message}`,
          success: false,
        };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("events").getPublicUrl(flyerPath);
      flyerUrl = publicUrl;
    }

    // Upload wallet image if provided (to variants folder)
    if (walletFile && walletFile.size > 0) {
      const walletExt = walletFile.name.split(".").pop();
      const walletPath = `variants/${eventData.id}.${walletExt}`;

      const { error: walletError } = await supabase.storage
        .from("events")
        .upload(walletPath, walletFile);

      if (walletError) {
        console.error("Error uploading wallet:", walletError);
        return {
          message: `Error al subir la imagen de wallet: ${walletError.message}`,
          success: false,
        };
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("events").getPublicUrl(walletPath);
      walletUrl = publicUrl;
    }

    // Upload flyer overlay if provided
    if (flyerOverlayFile && flyerOverlayFile.size > 0) {
      const ext = flyerOverlayFile.name.split(".").pop();
      const path = `flyers/overlay_${eventData.id}.${ext}`;

      const { error } = await supabase.storage
        .from("events")
        .upload(path, flyerOverlayFile);

      if (error) {
        console.error("Error uploading flyer overlay:", error);
      } else {
        const { data: { publicUrl } } = supabase.storage.from("events").getPublicUrl(path);
        flyerOverlayUrl = publicUrl;
      }
    }

    // Upload flyer background if provided
    if (flyerBackgroundFile && flyerBackgroundFile.size > 0) {
      const ext = flyerBackgroundFile.name.split(".").pop();
      const path = `flyers/background_${eventData.id}.${ext}`;

      const { error } = await supabase.storage
        .from("events")
        .upload(path, flyerBackgroundFile);

      if (error) {
        console.error("Error uploading flyer background:", error);
      } else {
        const { data: { publicUrl } } = supabase.storage.from("events").getPublicUrl(path);
        flyerBackgroundUrl = publicUrl;
      }
    }

    // Upload flyer banner if provided
    if (flyerBannerFile && flyerBannerFile.size > 0) {
      const ext = flyerBannerFile.name.split(".").pop();
      const path = `flyers/banner_${eventData.id}.${ext}`;

      const { error } = await supabase.storage
        .from("events")
        .upload(path, flyerBannerFile);

      if (error) {
        console.error("Error uploading flyer banner:", error);
      } else {
        const { data: { publicUrl } } = supabase.storage.from("events").getPublicUrl(path);
        flyerBannerUrl = publicUrl;
      }
    }

    // Update event with image URLs if uploaded
    if (flyerUrl || walletUrl || flyerOverlayUrl || flyerBackgroundUrl || flyerBannerUrl) {
      const updateData: {
        flyer?: string;
        flyer_apple?: string;
        flyer_overlay?: string;
        flyer_background?: string;
        flyer_banner?: string;
      } = {};
      if (flyerUrl) updateData.flyer = flyerUrl;
      if (walletUrl) updateData.flyer_apple = walletUrl;
      if (flyerOverlayUrl) updateData.flyer_overlay = flyerOverlayUrl;
      if (flyerBackgroundUrl) updateData.flyer_background = flyerBackgroundUrl;
      if (flyerBannerUrl) updateData.flyer_banner = flyerBannerUrl;

      const { error: updateError } = await supabase
        .from("events")
        .update(updateData)
        .eq("id", eventData.id);

      if (updateError) {
        console.error("Error updating event with image URLs:", updateError);
        // Don't fail the whole operation, images are uploaded successfully
      }
    }

    // Revalidate the administrador page to show the new event
    revalidatePath(`/profile/${user.id}/organizaciones/${validData.organization_id}/administrador/eventos`);

    return {
      message: "Evento creado exitosamente",
      success: true,
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      message: "Error inesperado al crear el evento",
      success: false,
    };
  }
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
      .select(`
        *,
        venues (
          name,
          city
        )
      `)
      .eq("organization_id", organizationId)
      .order("date", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Error fetching organization events:", error);
      return [];
    }

    // Transform the data to flatten venue info
    const eventsWithVenue: EventWithVenue[] = (events || []).map((event: EventSchema & { venues?: { name: string | null; city: string | null } | null }) => ({
      ...event,
      venue_name: event.venues?.name || null,
      venue_city: event.venues?.city || null,
      venues: undefined, // Remove the nested venues object
    }));

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
  const producerIds = eventProducers.map(ep => ep.producer_id);

  const { data: producers, error: producersError } = await supabase
    .from("producers")
    .select("id, name, logo")
    .in("id", producerIds);

  if (producersError) {
    console.error("Error fetching producers:", producersError);
    return [];
  }

  // Combine the data
  return eventProducers.map(ep => {
    const producer = producers?.find(p => p.id === ep.producer_id);
    return {
      id: ep.id,
      created_at: ep.created_at,
      producer: producer || {
        id: ep.producer_id,
        name: null,
        logo: null
      }
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
    return { success: false, message: "El productor ya está asignado a este evento" };
  }

  const { error } = await supabase
    .from("events_producers")
    .insert({
      event_id: eventId,
      producer_id: producerId
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
  const artistIds = lineup.map(l => l.artist_id);

  const { data: artists, error: artistsError } = await supabase
    .from("artists")
    .select("id, name, description, category, logo")
    .in("id", artistIds);

  if (artistsError) {
    console.error("Error fetching artists:", artistsError);
    return [];
  }

  // Combine the data
  return lineup.map(l => {
    const artist = artists?.find(a => a.id === l.artist_id);
    return {
      id: l.id,
      created_at: l.created_at,
      artist: artist || {
        id: l.artist_id,
        name: null,
        description: null,
        category: null,
        logo: null
      }
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
    return { success: false, message: "El artista ya está asignado a este evento" };
  }

  const { error } = await supabase
    .from("lineup")
    .insert({
      event_id: eventId,
      artist_id: artistId
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

    revalidatePath(`/profile/[userId]/organizaciones/[organizationId]/administrador/event/[eventId]/entradas`, "page");

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

export async function updateEventConfiguration(eventId: string, formData: {
  name?: string;
  description?: string;
  category?: typeof EVENT_CATEGORIES[number];
  date?: string;
  end_date?: string;
  age?: number;
  variable_fee?: number;
  fixed_fee?: number;
  city?: string;
  country?: string;
  address?: string;
  faqs?: Array<{ id: string; question: string; answer: string }>;
}) {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "No autenticado" };
  }

  // Validate category if provided
  if (formData.category && !EVENT_CATEGORIES.includes(formData.category)) {
    return { success: false, message: "Categoría inválida" };
  }

  // Build update object with only provided fields
  const updateData: Partial<{
    name: string;
    description: string;
    category: string;
    date: string;
    end_date: string;
    age: number;
    variable_fee: number;
    fixed_fee: number;
    city: string;
    country: string;
    address: string;
    faqs: Array<{ id: string; question: string; answer: string }>;
  }> = {};

  if (formData.name !== undefined) updateData.name = formData.name;
  if (formData.description !== undefined) updateData.description = formData.description;
  if (formData.category !== undefined) updateData.category = formData.category;
  if (formData.date !== undefined) updateData.date = formData.date;
  if (formData.end_date !== undefined) updateData.end_date = formData.end_date;
  if (formData.age !== undefined) updateData.age = formData.age;
  if (formData.variable_fee !== undefined) updateData.variable_fee = formData.variable_fee;
  if (formData.fixed_fee !== undefined) updateData.fixed_fee = formData.fixed_fee;
  if (formData.city !== undefined) updateData.city = formData.city;
  if (formData.country !== undefined) updateData.country = formData.country;
  if (formData.address !== undefined) updateData.address = formData.address;
  if (formData.faqs !== undefined) updateData.faqs = formData.faqs;

  const { error } = await supabase
    .from("events")
    .update(updateData)
    .eq("id", eventId);

  if (error) {
    console.error("Error updating event configuration:", error);
    return { success: false, message: "Error al actualizar la configuración" };
  }

  revalidatePath(`/profile/[userId]/administrador/event/${eventId}/configuracion`, "page");

  return { success: true, message: "Configuración actualizada exitosamente" };
}

/**
 * Toggle event status (active/inactive)
 * Only owners and administrators should be able to call this
 */
export async function toggleEventStatus(eventId: string, status: boolean) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("events")
    .update({ status })
    .eq("id", eventId);

  if (error) {
    console.error("Error toggling event status:", error);
    return { success: false, message: "Error al cambiar el estado del evento" };
  }

  revalidatePath(`/profile/[userId]/organizaciones/[organizationId]/administrador/event/${eventId}`, "page");

  return {
    success: true,
    message: status ? "Evento activado" : "Evento desactivado",
    status
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
  venue_name: string;
  venue_city: string;
};

/**
 * Fetches popular/active events from the database for the home page
 * Returns events that are active and haven't ended yet, ordered by priority and date
 */
export async function getPopularEvents(limit: number = 12): Promise<PopularEventWithVenue[]> {
  const supabase = await createClient();

  try {
    const now = new Date().toISOString();

    const { data: events, error } = await supabase
      .from("events")
      .select(`
        id,
        name,
        description,
        date,
        end_date,
        status,
        flyer,
        priority,
        venues (
          name,
          city
        )
      `)
      .eq("status", true)
      .or(`end_date.gte.${now},end_date.is.null`)
      .order("priority", { ascending: false })
      .order("date", { ascending: true })
      .limit(limit);

    if (error) {
      console.error("Error fetching popular events:", error);
      return [];
    }

    // Transform the data to flatten venue info and match expected type
    const eventsWithVenue: PopularEventWithVenue[] = (events || []).map((event) => {
      // Handle venue data - Supabase returns object for single FK relation, array for many
      // TypeScript infers array, but runtime is object for one-to-one (event.venueId -> venues.id)
      const venueData = event.venues as unknown;
      const venue = Array.isArray(venueData)
        ? (venueData[0] as { name: string | null; city: string | null } | undefined)
        : (venueData as { name: string | null; city: string | null } | null);

      return {
        id: event.id,
        name: event.name,
        description: event.description,
        date: event.date ? new Date(event.date) : null,
        endDate: event.end_date ? new Date(event.end_date) : null,
        status: event.status,
        flyer: event.flyer,
        venue_name: venue?.name || "Venue",
        venue_city: venue?.city || "Ciudad",
      };
    });

    return eventsWithVenue;
  } catch (error) {
    console.error("Unexpected error fetching popular events:", error);
    return [];
  }
}

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
  tickets: {
    id: string;
    eventId: string;
    name: string;
    description: string | null;
    price: string;
    capacity: number;
    soldCount: number;
    reservedCount: number;
    minPerOrder: number;
    maxPerOrder: number;
    saleStart: Date | null;
    saleEnd: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
    active: boolean;
  }[];
};

/**
 * Fetches a single event by ID with all details for the event page
 * Uses get_ticket_availability RPC for accurate ticket counts with lazy expiration
 */
export async function getEventById(eventId: string): Promise<{ data: EventDetail | null; error: { message: string } | null }> {
  const supabase = await createClient();

  try {
    // Fetch event data and ticket availability in parallel
    const [eventResult, ticketResult] = await Promise.all([
      supabase
        .from("events")
        .select(`
          id,
          name,
          description,
          date,
          end_date,
          status,
          flyer,
          age,
          variable_fee,
          venues (
            name,
            city,
            address,
            latitude,
            longitude
          )
        `)
        .eq("id", eventId)
        .single(),
      // Use RPC for accurate availability with lazy expiration
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
      ? (venueData[0] as { name: string | null; city: string | null; address: string | null; latitude: string | null; longitude: string | null } | undefined)
      : (venueData as { name: string | null; city: string | null; address: string | null; latitude: string | null; longitude: string | null } | null);

    // Handle ticket types from RPC result
    const ticketTypes = ticketResult.data || [];

    // Format hours from date
    const formatHour = (date: string | null): string => {
      if (!date) return "--:--";
      return new Date(date).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
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
      tickets: ticketTypes.map((t: Record<string, unknown>) => ({
        id: t.ticket_type_id as string,
        eventId: event.id,
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
