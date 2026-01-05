"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EVENT_CATEGORIES } from "@/constants/event-categories";

const eventFormSchema = z.object({
  name: z.string().min(1, "El nombre del evento es requerido"),
  type: z
    .enum(["single", "multi_day", "recurring", "slots"])
    .default("single")
    .refine((val) => val === "single", {
      message:
        "Solo eventos de tipo 'único' están disponibles en esta versión de la plataforma",
    }),
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
    venue_name?: string;
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
    venue_name: string | null;
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
  if (formData.venue_name !== undefined)
    updateData.venue_name = formData.venue_name || null;
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
