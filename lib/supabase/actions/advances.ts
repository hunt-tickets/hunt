"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getEventAdvances(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events_payouts")
    .select(`
      id,
      amount,
      concept,
      payment_date,
      payment_method,
      notes,
      created_at,
      file,
      event_id,
      debt
    `)
    .eq("event_id", eventId)
    .order("payment_date", { ascending: false});

  if (error) {
    console.error("Error fetching event advances:", error);
    return null;
  }

  return data;
}

export async function createEventAdvance(eventId: string, advanceData: {
  amount: number;
  concept: string;
  date: string;
  payment_method: string;
  notes?: string;
  file?: string;
  debt?: boolean;
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "No autenticado" };
  }

  const { error } = await supabase
    .from("events_payouts")
    .insert({
      event_id: eventId,
      amount: advanceData.amount,
      concept: advanceData.concept,
      payment_date: advanceData.date,
      payment_method: advanceData.payment_method,
      notes: advanceData.notes || null,
      file: advanceData.file || null,
      debt: advanceData.debt || false,
    });

  if (error) {
    console.error("Error creating event advance:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    return { success: false, message: `Error al registrar el avance: ${error.message}` };
  }

  revalidatePath(`/profile/[userId]/administrador/event/${eventId}/avances`);

  return { success: true, message: "Avance registrado exitosamente" };
}

export async function updateEventAdvance(advanceId: string, advanceData: {
  amount: number;
  concept: string;
  date: string;
  payment_method: string;
  notes?: string;
  file?: string;
  debt?: boolean;
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "No autenticado" };
  }

  const { error } = await supabase
    .from("events_payouts")
    .update({
      amount: advanceData.amount,
      concept: advanceData.concept,
      payment_date: advanceData.date,
      payment_method: advanceData.payment_method,
      notes: advanceData.notes || null,
      file: advanceData.file || null,
      debt: advanceData.debt || false,
    })
    .eq("id", advanceId);

  if (error) {
    console.error("Error updating event advance:", error);
    return { success: false, message: "Error al actualizar el avance" };
  }

  revalidatePath(`/profile/[userId]/administrador/event`);

  return { success: true, message: "Avance actualizado exitosamente" };
}

export async function deleteEventAdvance(advanceId: string) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "No autenticado" };
  }

  const { error } = await supabase
    .from("events_payouts")
    .delete()
    .eq("id", advanceId);

  if (error) {
    console.error("Error deleting event advance:", error);
    return { success: false, message: "Error al eliminar el avance" };
  }

  revalidatePath(`/profile/[userId]/administrador/event`);

  return { success: true, message: "Avance eliminado exitosamente" };
}
