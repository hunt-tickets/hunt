"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface EventDayInput {
  id?: string;
  name: string;
  date: string;
  endDate?: string;
  sortOrder: number;
  // Festival essentials
  description?: string;
  flyer?: string;
  doorsOpen?: string;
  showStart?: string;
}

export type EventDaysResult = {
  success: boolean;
  message?: string;
  data?: { id: string }[];
};

/**
 * Sync event days - handles create, update, and delete in one operation
 * Pass the full array of days you want the event to have
 * Only allowed for 'multi_day' event types
 */
export async function syncEventDays(
  eventId: string,
  days: EventDayInput[]
): Promise<EventDaysResult> {
  const supabase = await createClient();

  try {
    // Validate event type - only multi_day events can have event_days
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("type")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      console.error("Error fetching event type:", eventError);
      return { success: false, message: "Error al obtener el tipo de evento" };
    }

    if (event.type !== "multi_day") {
      return {
        success: false,
        message: "Solo los eventos multi-día pueden tener días configurados",
      };
    }

    // Get existing days
    const { data: existingDays, error: fetchError } = await supabase
      .from("event_days")
      .select("id")
      .eq("event_id", eventId);

    if (fetchError) {
      console.error("Error fetching existing days:", fetchError);
      return { success: false, message: "Error al obtener los días existentes" };
    }

    const existingIds = new Set(existingDays?.map((d) => d.id) || []);
    const newIds = new Set(days.filter((d) => d.id && !d.id.startsWith("temp-")).map((d) => d.id));

    // Delete days that are no longer in the list
    const toDelete = [...existingIds].filter((id) => !newIds.has(id));
    if (toDelete.length > 0) {
      const { error: deleteError } = await supabase
        .from("event_days")
        .delete()
        .in("id", toDelete);

      if (deleteError) {
        console.error("Error deleting days:", deleteError);
        return { success: false, message: "Error al eliminar días" };
      }
    }

    // Upsert all days
    const upsertData = days.map((day) => ({
      ...(day.id && !day.id.startsWith("temp-") ? { id: day.id } : {}),
      event_id: eventId,
      name: day.name,
      date: day.date,
      end_date: day.endDate || null,
      sort_order: day.sortOrder,
      // Festival essentials
      description: day.description || null,
      flyer: day.flyer || null,
      doors_open: day.doorsOpen || null,
      show_start: day.showStart || null,
    }));

    if (upsertData.length > 0) {
      const { data: upsertedDays, error: upsertError } = await supabase
        .from("event_days")
        .upsert(upsertData, { onConflict: "id" })
        .select("id");

      if (upsertError) {
        console.error("Error upserting days:", upsertError);
        return { success: false, message: "Error al guardar los días" };
      }

      // Also update the event's date and end_date based on the days
      if (days.length > 0) {
        const sortedDates = days
          .map((d) => new Date(d.date))
          .sort((a, b) => a.getTime() - b.getTime());
        const sortedEndDates = days
          .filter((d) => d.endDate)
          .map((d) => new Date(d.endDate!))
          .sort((a, b) => b.getTime() - a.getTime());

        const firstDate = sortedDates[0];
        const lastDate = sortedEndDates[0] || sortedDates[sortedDates.length - 1];

        await supabase
          .from("events")
          .update({
            date: firstDate.toISOString(),
            end_date: lastDate.toISOString(),
          })
          .eq("id", eventId);
      }

      revalidatePath(
        `/profile/[userId]/organizaciones/[organizationId]/administrador/event/${eventId}`,
        "page"
      );
      return { success: true, data: upsertedDays };
    }

    return { success: true, data: [] };
  } catch (error) {
    console.error("Error syncing event days:", error);
    return { success: false, message: "Error inesperado al guardar los días" };
  }
}

/**
 * Get event days for an event
 */
export async function getEventDays(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("event_days")
    .select("*")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("Error fetching event days:", error);
    return [];
  }

  return data.map((day) => ({
    id: day.id,
    name: day.name || "",
    date: day.date,
    endDate: day.end_date || "",
    sortOrder: day.sort_order || 0,
    // Festival essentials
    description: day.description || "",
    flyer: day.flyer || "",
    doorsOpen: day.doors_open || "",
    showStart: day.show_start || "",
  }));
}
