"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Server actions for secure operations
 * All sensitive operations should be server actions
 */

export async function createTicketPurchase(
  ticketTierId: string,
  quantity: number,
  paymentMethodId: string
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Authentication required");
  }

  const supabase = await createClient();

  // Start a transaction using Supabase's RPC
  const { data, error } = await supabase.rpc("purchase_tickets", {
    p_user_id: session.user.id,
    p_ticket_tier_id: ticketTierId,
    p_quantity: quantity,
    p_payment_method_id: paymentMethodId,
  });

  if (error) {
    console.error("Purchase error:", error);

    // Handle specific errors
    if (error.message.includes("insufficient_tickets")) {
      throw new Error("Not enough tickets available");
    }
    if (error.message.includes("payment_failed")) {
      throw new Error("Payment processing failed");
    }

    throw new Error("Purchase failed. Please try again.");
  }

  // Revalidate relevant paths
  revalidatePath("/tickets");
  revalidatePath(`/events/${data.event_id}`);

  return data;
}

export async function cancelTicketOrder(orderId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Authentication required");
  }

  const supabase = await createClient();

  // Verify user owns this order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, event:events(event_date)")
    .eq("id", orderId)
    .eq("user_id", session.user.id)
    .single();

  if (orderError || !order) {
    throw new Error("Order not found");
  }

  // Check if cancellation is allowed (e.g., 24 hours before event)
  const eventDate = new Date(order.event.event_date);
  const now = new Date();
  const hoursUntilEvent =
    (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilEvent < 24) {
    throw new Error("Cannot cancel within 24 hours of event");
  }

  // Process cancellation via RPC for atomicity
  const { data, error } = await supabase.rpc("cancel_order", {
    p_order_id: orderId,
    p_user_id: session.user.id,
  });

  if (error) {
    throw new Error("Cancellation failed");
  }

  revalidatePath("/tickets");
  revalidatePath("/profile");

  return data;
}

export async function transferTicket(ticketId: string, recipientEmail: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    throw new Error("Authentication required");
  }

  const supabase = await createClient();

  // Verify ticket ownership and transfer eligibility
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("*, ticket_tier:ticket_tiers(transfer_allowed)")
    .eq("id", ticketId)
    .eq("owner_id", session.user.id)
    .single();

  if (ticketError || !ticket) {
    throw new Error("Ticket not found");
  }

  if (!ticket.ticket_tier.transfer_allowed) {
    throw new Error("This ticket type cannot be transferred");
  }

  // Find recipient user
  const { data: recipientData } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", recipientEmail)
    .single();

  if (!recipientData) {
    throw new Error("Recipient not found");
  }

  // Process transfer
  const { error: transferError } = await supabase.rpc("transfer_ticket", {
    p_ticket_id: ticketId,
    p_from_user_id: session.user.id,
    p_to_user_id: recipientData.id,
  });

  if (transferError) {
    throw new Error("Transfer failed");
  }

  revalidatePath("/tickets");

  return { success: true };
}

export async function getEventTickets(eventId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tickets")
    .select(
      `
      *,
      ticket_type:tickets_types(id, name)
    `
    )
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tickets:", error);
    return null;
  }

  return data;
}

export async function getTicketTypes() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tickets_types")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching ticket types:", error);
    return [];
  }

  return data || [];
}

export async function createTicket(
  eventId: string,
  ticketData: {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    capacity?: number;
    max_date?: string;
    status: boolean;
    section?: string;
    row?: string;
    seat?: string;
    palco?: string;
    hex?: string;
    family?: string;
    reference?: string;
    ticket_type_id?: string;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase.from("tickets").insert({
    event_id: eventId,
    name: ticketData.name,
    description: ticketData.description || null,
    price: ticketData.price,
    quantity: ticketData.quantity,
    capacity: ticketData.capacity || null,
    max_date: ticketData.max_date || null,
    status: ticketData.status,
    section: ticketData.section || null,
    row: ticketData.row || null,
    seat: ticketData.seat || null,
    palco: ticketData.palco || null,
    hex: ticketData.hex || null,
    family: ticketData.family || null,
    reference: ticketData.reference || null,
    ticket_type_id: ticketData.ticket_type_id || null,
  });

  if (error) {
    console.error("Error creating ticket:", error);
    return { success: false, message: "Error al crear la entrada" };
  }

  return { success: true, message: "Entrada creada exitosamente" };
}

export async function updateTicket(
  ticketId: string,
  ticketData: {
    name: string;
    description?: string;
    price: number;
    quantity: number;
    capacity?: number;
    max_date?: string;
    status: boolean;
    section?: string;
    row?: string;
    seat?: string;
    palco?: string;
    hex?: string;
    family?: string;
    reference?: string;
  }
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tickets")
    .update({
      name: ticketData.name,
      description: ticketData.description || null,
      price: ticketData.price,
      quantity: ticketData.quantity,
      capacity: ticketData.capacity || null,
      max_date: ticketData.max_date || null,
      status: ticketData.status,
      section: ticketData.section || null,
      row: ticketData.row || null,
      seat: ticketData.seat || null,
      palco: ticketData.palco || null,
      hex: ticketData.hex || null,
      family: ticketData.family || null,
      reference: ticketData.reference || null,
    })
    .eq("id", ticketId);

  if (error) {
    console.error("Error updating ticket:", error);
    return { success: false, message: "Error al actualizar la entrada" };
  }

  revalidatePath(`/profile/[userId]/administrador/event`, "page");

  return { success: true, message: "Entrada actualizada exitosamente" };
}

/**
 * Update ticket_type (from ticket_types table)
 * Used for updating modern ticket types with sale windows
 */
export async function updateTicketType(
  ticketTypeId: string,
  ticketTypeData: {
    name?: string;
    description?: string;
    price?: number;
    capacity?: number;
    sale_start?: string | null;
    sale_end?: string | null;
    min_per_order?: number;
    max_per_order?: number;
  }
) {
  const supabase = await createClient();

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = {};
  if (ticketTypeData.name !== undefined) updateData.name = ticketTypeData.name;
  if (ticketTypeData.description !== undefined) updateData.description = ticketTypeData.description || null;
  if (ticketTypeData.price !== undefined) updateData.price = ticketTypeData.price.toFixed(2);
  if (ticketTypeData.capacity !== undefined) updateData.capacity = ticketTypeData.capacity;
  if (ticketTypeData.sale_start !== undefined) updateData.sale_start = ticketTypeData.sale_start || null;
  if (ticketTypeData.sale_end !== undefined) updateData.sale_end = ticketTypeData.sale_end || null;
  if (ticketTypeData.min_per_order !== undefined) updateData.min_per_order = ticketTypeData.min_per_order;
  if (ticketTypeData.max_per_order !== undefined) updateData.max_per_order = ticketTypeData.max_per_order;

  const { error } = await supabase
    .from("ticket_types")
    .update(updateData)
    .eq("id", ticketTypeId);

  if (error) {
    console.error("Error updating ticket type:", error);
    return { success: false, message: "Error al actualizar el tipo de entrada" };
  }

  revalidatePath(`/profile/[userId]/administrador/event`, "page");

  return { success: true, message: "Tipo de entrada actualizado exitosamente" };
}

export async function getEventArtists(eventId: string) {
  const supabase = await createClient();

  // First, get the lineup entries
  const { data: lineup, error: lineupError } = await supabase
    .from("lineup")
    .select("id, created_at, artist_id")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

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
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching all artists:", error);
    return [];
  }

  return data || [];
}

export async function getAllVenues() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("venues")
    .select("id, name, logo, address, city")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching all venues:", error);
    return [];
  }

  return data || [];
}

export async function updateTicketTypeActive(
  ticketTypeId: string,
  active: boolean
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("ticket_types")
    .update({ active })
    .eq("id", ticketTypeId);

  if (error) {
    console.error("Error updating ticket type active status:", error);
    return { success: false, message: error.message };
  }

  return { success: true };
}
