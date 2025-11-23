"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Server actions for secure operations
 * All sensitive operations should be server actions
 */

export async function createTicketPurchase(
  ticketTierId: string,
  quantity: number,
  paymentMethodId: string
) {
  const supabase = await createClient();

  // Verify user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // Start a transaction using Supabase's RPC
  const { data, error } = await supabase.rpc("purchase_tickets", {
    p_user_id: user.id,
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
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // Verify user owns this order
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, event:events(event_date)")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (orderError || !order) {
    throw new Error("Order not found");
  }

  // Check if cancellation is allowed (e.g., 24 hours before event)
  const eventDate = new Date(order.event.event_date);
  const now = new Date();
  const hoursUntilEvent = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntilEvent < 24) {
    throw new Error("Cannot cancel within 24 hours of event");
  }

  // Process cancellation via RPC for atomicity
  const { data, error } = await supabase.rpc("cancel_order", {
    p_order_id: orderId,
    p_user_id: user.id,
  });

  if (error) {
    throw new Error("Cancellation failed");
  }

  revalidatePath("/tickets");
  revalidatePath("/profile");

  return data;
}

export async function transferTicket(
  ticketId: string,
  recipientEmail: string
) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required");
  }

  // Verify ticket ownership and transfer eligibility
  const { data: ticket, error: ticketError } = await supabase
    .from("tickets")
    .select("*, ticket_tier:ticket_tiers(transfer_allowed)")
    .eq("id", ticketId)
    .eq("owner_id", user.id)
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
    p_from_user_id: user.id,
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
    .select(`
      *,
      ticket_type:tickets_types(id, name)
    `)
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tickets:", error);
    return null;
  }

  return data;
}

export async function getAllEventTransactions(eventId: string) {
  const supabase = await createClient();

  // Helper function to fetch all transactions with pagination
  async function fetchAllTransactions(tableName: string, source: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allData: any[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          id,
          quantity,
          total,
          status,
          created_at,
          ticket_id,
          user_id,
          tickets!inner(
            event_id,
            name,
            price
          ),
          user:profiles!user_id(
            name,
            lastName,
            email
          )
        `)
        .eq("tickets.event_id", eventId)
        .eq("status", "PAID WITH QR")
        .order("created_at", { ascending: false })
        .range(from, from + batchSize - 1);

      if (error) {
        console.error(`❌ Error fetching ${tableName}:`, error);
        break;
      }

      console.log(`✅ ${tableName} - Fetched ${data?.length || 0} records (from ${from} to ${from + batchSize - 1})`);

      if (data && data.length > 0) {
        allData = [...allData, ...data.map(t => ({ ...t, source }))];
        from += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    return allData;
  }

  // Get all transactions from all sources
  console.log(`🔍 Fetching transactions for event: ${eventId}`);
  const [appTransactions, webTransactions, cashTransactions] = await Promise.all([
    fetchAllTransactions("transactions", "app"),
    fetchAllTransactions("transactions_web", "web"),
    fetchAllTransactions("transactions_cash", "cash"),
  ]);

  console.log(`📊 Transaction Summary:`);
  console.log(`   App: ${appTransactions.length} transactions`);
  console.log(`   Web: ${webTransactions.length} transactions`);
  console.log(`   Cash: ${cashTransactions.length} transactions`);

  // Combine and sort all transactions by date
  const allTransactions = [
    ...appTransactions,
    ...webTransactions,
    ...cashTransactions,
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  console.log(`   Total: ${allTransactions.length} transactions`);

  return allTransactions;
}

export async function getCompleteEventTransactions(eventId: string) {
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('admin').eq('id', user.id).single();
    isAdmin = profile?.admin === true;
  }

  // Get event name
  const { data: event } = await supabase
    .from('events')
    .select('name')
    .eq('id', eventId)
    .single();

  const eventName = event?.name || 'Evento sin nombre';

  // Helper function to fetch all transactions with complete data
  async function fetchCompleteTransactions(tableName: string, source: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allData: any[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    // Build select query with JOINs based on table
    let selectQuery = '';
    if (tableName === 'transactions') {
      selectQuery = `
        id, created_at, ticket_id, quantity, price, variable_fee, tax, total, status, order_id, user_id, tracker,
        user:profiles!user_id(name, lastName, email)
      `;
    } else if (tableName === 'transactions_web') {
      selectQuery = `
        id, created_at, ticket_id, quantity, price, variable_fee, tax, total, status, order_id, user_id, promoter_id, order,
        user:profiles!user_id(name, lastName, email),
        promoter:profiles!promoter_id(name, lastName, email)
      `;
    } else {
      // transactions_cash
      selectQuery = `
        id, created_at, ticket_id, quantity, price, variable_fee, tax, total, status, order_id, user_id, promoter_id,
        user:profiles!user_id(name, lastName, email),
        promoter:profiles!promoter_id(name, lastName, email)
      `;
    }

    while (hasMore) {
      const { data, error } = await supabase
        .from(tableName)
        .select(selectQuery)
        .eq('status', 'PAID WITH QR')
        .order('created_at', { ascending: false })
        .range(from, from + batchSize - 1);

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        break;
      }

      if (data && data.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        allData = [...allData, ...(data as any[]).map(t => ({ ...t, source }))];
        from += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    return allData;
  }

  // Get tickets
  const { data: tickets } = await supabase
    .from('tickets')
    .select('id, name')
    .eq('event_id', eventId);

  if (!tickets || tickets.length === 0) {
    return [];
  }

  const ticketIds = tickets.map(t => t.id);
  const ticketMap: Record<string, string> = {};
  tickets.forEach(t => {
    ticketMap[t.id] = t.name;
  });

  // Get all transactions in parallel
  const [appTxs, webTxs, cashTxs] = await Promise.all([
    fetchCompleteTransactions('transactions', 'app'),
    fetchCompleteTransactions('transactions_web', 'web'),
    fetchCompleteTransactions('transactions_cash', 'cash'),
  ]);

  // Filter by event tickets FIRST
  const filteredAppTxs = appTxs.filter(t => ticketIds.includes(t.ticket_id));
  const filteredWebTxs = webTxs.filter(t => ticketIds.includes(t.ticket_id));
  const filteredCashTxs = cashTxs.filter(t => ticketIds.includes(t.ticket_id));

  const allTxs = [
    ...filteredAppTxs,
    ...filteredWebTxs,
    ...filteredCashTxs,
  ];

  // Get Bold data for all users (basic info for everyone, detailed info for admins)
  // Collect references ONLY from filtered transactions (transactions of this event)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const boldDataMap: Record<string, any> = {};
  const boldReferences = new Set<string>();
  filteredAppTxs.forEach(tx => {
    if (tx.tracker) boldReferences.add(tx.tracker);
  });
  filteredWebTxs.forEach(tx => {
    if (tx.order) boldReferences.add(tx.order);
  });

  console.log(`🔍 [getCompleteEventTransactions] Total references collected: ${boldReferences.size}`);
  console.log(`🔍 [getCompleteEventTransactions] Sample references:`, Array.from(boldReferences).slice(0, 3));

  if (boldReferences.size > 0) {
    // Split references into chunks to avoid PostgreSQL IN limit (~1000 items)
    const referencesArray = Array.from(boldReferences);
    const CHUNK_SIZE = 100;
    const chunks = [];

    for (let i = 0; i < referencesArray.length; i += CHUNK_SIZE) {
      chunks.push(referencesArray.slice(i, i + CHUNK_SIZE));
    }

    console.log(`🔍 [getCompleteEventTransactions] Fetching Bold data in ${chunks.length} chunks`);

    // Fetch Bold data in chunks
    for (let i = 0; i < chunks.length; i++) {
      const { data: boldDataChunk, error: boldError } = await supabase
        .from('bold_transactions')
        .select('*')
        .in('referencia', chunks[i]);

      if (boldError) {
        console.error(`❌ [getCompleteEventTransactions] Bold fetch error (chunk ${i + 1}):`, boldError);
      } else {
        boldDataChunk?.forEach(bold => {
          boldDataMap[bold.referencia] = bold;
        });
        console.log(`✅ [getCompleteEventTransactions] Chunk ${i + 1}/${chunks.length}: Fetched ${boldDataChunk?.length || 0} Bold records`);
      }
    }

    console.log(`🔍 [getCompleteEventTransactions] Bold data mapped: ${Object.keys(boldDataMap).length} records`);
    console.log(`🔍 [getCompleteEventTransactions] Sample bold data:`, Object.keys(boldDataMap).slice(0, 2).map(key => ({
      ref: key,
      id: boldDataMap[key].id,
      estado: boldDataMap[key].estado_actual
    })));
  }

  // Format transactions
  const formattedTransactions = allTxs.map((tx, index) => {
    const ticketName = ticketMap[tx.ticket_id] || '';
    const reference = tx.source === 'app' ? tx.tracker : tx.source === 'web' ? tx.order : null;
    const bold = reference ? boldDataMap[reference] : null;

    // Log first transaction for debugging
    if (index === 0) {
      console.log(`🔍 [getCompleteEventTransactions] First transaction:`, {
        id: tx.id,
        source: tx.source,
        reference: reference,
        hasBold: !!bold,
        boldId: bold?.id
      });
    }

    const formatName = (name: string | null, lastName: string | null) => {
      if (!name && !lastName) return '';
      const fullName = `${name || ''} ${lastName || ''}`.trim();
      const words = fullName.split(/\s+/).filter(word => word.length > 0);
      return words.map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    const baseData = {
      id: tx.id,
      created_at: tx.created_at,
      user_fullname: tx.user ? formatName(tx.user.name, tx.user.lastName) : '',
      user_email: tx.user?.email || '',
      ticket_name: ticketName,
      event_name: eventName,
      quantity: tx.quantity,
      price: tx.price,
      variable_fee: tx.variable_fee,
      tax: tx.tax,
      total: tx.total,
      status: tx.status,
      type: tx.source,
      cash: tx.source === 'cash',
      order_id: tx.order_id,
      promoter_fullname: tx.promoter ? formatName(tx.promoter.name, tx.promoter.lastName) : '',
      promoter_email: tx.promoter?.email || '',
      // Basic Bold data for all users
      bold_id: bold?.id || null,
      bold_fecha: bold?.fecha || null,
      bold_estado: bold?.estado_actual || null,
      bold_metodo_pago: bold?.metodo_de_pago || null,
    };

    // Add detailed Bold data only for admins
    if (isAdmin && bold) {
      return {
        ...baseData,
        bold_valor_compra: bold.valor_de_la_compra,
        bold_propina: bold.propina,
        bold_iva: bold.iva,
        bold_impoconsumo: bold.impoconsumo,
        bold_valor_total: bold.valor_total,
        bold_rete_fuente: bold.valor_rete_fuente,
        bold_rete_iva: bold.valor_rete_iva,
        bold_rete_ica: bold.valor_rete_ica,
        bold_comision_porcentaje: bold.comision_bold_porcentaje,
        bold_comision_fija: bold.comision_bold_fija,
        bold_total_deduccion: bold.total_deduccion,
        bold_deposito_cuenta: bold.deposito_en_cuenta_bold,
        bold_banco: bold.banco,
        bold_franquicia: bold.franquicia,
        bold_pais_tarjeta: bold.pais_tarjeta,
      };
    }

    return baseData;
  });

  return formattedTransactions.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export async function getTicketsSalesAnalytics(eventId: string) {
  const supabase = await createClient();

  // Helper function to fetch all transactions with pagination
  async function fetchAllTransactions(tableName: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allData: any[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error, count } = await supabase
        .from(tableName)
        .select("ticket_id, quantity, total, tickets!inner(event_id)", { count: 'exact' })
        .eq("tickets.event_id", eventId)
        .eq("status", "PAID WITH QR")
        .range(from, from + batchSize - 1);

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        break;
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data];
        from += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }

      // Log progress
      if (count !== null) {
        console.log(`📊 ${tableName} - Fetched ${allData.length} of ${count} records`);
      }
    }

    return allData;
  }

  // Get all transactions for this event grouped by ticket
  const appTransactions = await fetchAllTransactions("transactions");
  const webTransactions = await fetchAllTransactions("transactions_web");
  const cashTransactions = await fetchAllTransactions("transactions_cash");

  // Calculate total quantities for debugging
  const appQuantityTotal = appTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0);
  const webQuantityTotal = webTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0);
  const cashQuantityTotal = cashTransactions.reduce((sum, t) => sum + (t.quantity || 0), 0);

  console.log("📊 Analytics Debug - App Transactions:", appTransactions.length, "records, Total Quantity:", appQuantityTotal);
  console.log("📊 Analytics Debug - Web Transactions:", webTransactions.length, "records, Total Quantity:", webQuantityTotal);
  console.log("📊 Analytics Debug - Cash Transactions:", cashTransactions.length, "records, Total Quantity:", cashQuantityTotal);

  // Combine all transactions
  const allTransactions = [
    ...appTransactions.map(t => ({ ...t, source: 'app' })),
    ...webTransactions.map(t => ({ ...t, source: 'web' })),
    ...cashTransactions.map(t => ({ ...t, source: 'cash' }))
  ];

  const totalQuantitySum = appQuantityTotal + webQuantityTotal + cashQuantityTotal;
  console.log("📊 Analytics Debug - All Transactions:", allTransactions.length, "records");
  console.log("📊 Analytics Debug - TOTAL TICKETS SOLD (TypeScript Method):", totalQuantitySum);
  console.log("📊 Analytics Debug - Sample Transaction:", allTransactions[0]);

  // Group by ticket_id
  const analytics: Record<string, {
    ticketId: string;
    app: { quantity: number; total: number };
    web: { quantity: number; total: number };
    cash: { quantity: number; total: number };
    total: { quantity: number; total: number };
  }> = {};

  allTransactions.forEach(transaction => {
    if (!analytics[transaction.ticket_id]) {
      analytics[transaction.ticket_id] = {
        ticketId: transaction.ticket_id,
        app: { quantity: 0, total: 0 },
        web: { quantity: 0, total: 0 },
        cash: { quantity: 0, total: 0 },
        total: { quantity: 0, total: 0 }
      };
    }

    const source = transaction.source as 'app' | 'web' | 'cash';
    analytics[transaction.ticket_id][source].quantity += transaction.quantity || 0;
    analytics[transaction.ticket_id][source].total += transaction.total || 0;
    analytics[transaction.ticket_id].total.quantity += transaction.quantity || 0;
    analytics[transaction.ticket_id].total.total += transaction.total || 0;
  });

  // Calculate final totals from analytics object to verify
  const finalTotalQuantity = Object.values(analytics).reduce((sum, ticket) => sum + ticket.total.quantity, 0);
  const finalTotalRevenue = Object.values(analytics).reduce((sum, ticket) => sum + ticket.total.total, 0);

  console.log("📊 Analytics Debug - Final Analytics Object:", analytics);
  console.log("📊 Analytics Debug - Number of Tickets with Data:", Object.keys(analytics).length);
  console.log("📊 Analytics Debug - Final Total Quantity (after grouping):", finalTotalQuantity);
  console.log("📊 Analytics Debug - Final Total Revenue:", finalTotalRevenue);
  console.log("📊 Analytics Debug - Verification: Sum matches?", finalTotalQuantity === totalQuantitySum);

  return analytics;
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

export async function createTicket(eventId: string, ticketData: {
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
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "No autenticado" };
  }

  const { error } = await supabase
    .from("tickets")
    .insert({
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

  revalidatePath(`/profile/[userId]/administrador/event/${eventId}`);

  return { success: true, message: "Entrada creada exitosamente" };
}

export async function updateTicket(ticketId: string, ticketData: {
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
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "No autenticado" };
  }

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

  revalidatePath(`/profile/[userId]/administrador/event`);

  return { success: true, message: "Entrada actualizada exitosamente" };
}

export async function getEventProducers(eventId: string) {
  const supabase = await createClient();

  // First, get the events_producers entries
  const { data: eventProducers, error: epError } = await supabase
    .from("events_producers")
    .select("id, created_at, producer_id")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

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

export async function getAllProducers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("producers")
    .select("id, name, logo")
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching all producers:", error);
    return [];
  }

  return data || [];
}

export async function getAllArtists() {
  const supabase = await createClient();

  const { data, error} = await supabase
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

export async function getProducerTeam(producerId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("producers_admin")
    .select(`
      id,
      rol,
      profile:profiles!inner(
        id,
        name,
        lastName,
        email
      )
    `)
    .eq("producer_id", producerId)
    .order("rol", { ascending: true });

  if (error) {
    console.error("Error fetching producer team:", error);
    return [];
  }

  // Transform profile from array to object if needed
  const transformedData = data?.map((item) => ({
    ...item,
    profile: Array.isArray(item.profile) ? item.profile[0] : item.profile
  }));

  return transformedData || [];
}

export async function getAllTransactions() {
  const supabase = await createClient();

  // Helper function to fetch all transactions with pagination
  async function fetchAllTransactions(tableName: string, source: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allData: any[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          id,
          quantity,
          total,
          status,
          created_at,
          ticket_id,
          user_id,
          order_id,
          tickets!inner(
            event_id,
            name,
            price,
            event:events!inner(
              id,
              name
            )
          ),
          user:profiles!user_id(
            name,
            lastName,
            email
          ),
          qr_code:qr_codes!transaction_id(
            id,
            svg
          )
        `)
        .eq("status", "PAID WITH QR")
        .order("created_at", { ascending: false })
        .range(from, from + batchSize - 1);

      if (error) {
        console.error(`❌ Error fetching ${tableName}:`, error);
        break;
      }

      if (data && data.length > 0) {
        allData = [...allData, ...data.map(t => ({ ...t, source }))];
        from += batchSize;
        hasMore = data.length === batchSize;
      } else {
        hasMore = false;
      }
    }

    return allData;
  }

  // Get all transactions from all sources
  const [appTransactions, webTransactions, cashTransactions] = await Promise.all([
    fetchAllTransactions("transactions", "app"),
    fetchAllTransactions("transactions_web", "web"),
    fetchAllTransactions("transactions_cash", "cash"),
  ]);

  // Combine and sort all transactions by date
  const allTransactions = [
    ...appTransactions,
    ...webTransactions,
    ...cashTransactions,
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return allTransactions;
}

export async function getOrphanQRCodes() {
  const supabase = await createClient();

  // Get all QR codes with their user profiles
  const { data: allQRCodes, error: qrError } = await supabase
    .from("qr_codes")
    .select(`
      id,
      transaction_id,
      user_id,
      svg,
      created_at,
      scan,
      scanner_id,
      updated_at,
      apple,
      google,
      profile:profiles!user_id(
        id,
        name,
        lastName,
        email
      )
    `)
    .order("created_at", { ascending: false });

  if (qrError) {
    console.error("Error fetching QR codes:", qrError);
    return [];
  }

  if (!allQRCodes || allQRCodes.length === 0) {
    return [];
  }

  console.log(`🔍 Checking ${allQRCodes.length} QR codes for orphans...`);

  // Check each QR code individually against all three transaction tables
  const orphanQRs = [];

  for (const qr of allQRCodes) {
    // Check if transaction exists in any of the three tables
    const [appCheck, webCheck, cashCheck] = await Promise.all([
      supabase.from("transactions").select("id").eq("id", qr.transaction_id).single(),
      supabase.from("transactions_web").select("id").eq("id", qr.transaction_id).single(),
      supabase.from("transactions_cash").select("id").eq("id", qr.transaction_id).single()
    ]);

    // If transaction doesn't exist in any table, it's an orphan
    const existsInApp = appCheck.data !== null && !appCheck.error;
    const existsInWeb = webCheck.data !== null && !webCheck.error;
    const existsInCash = cashCheck.data !== null && !cashCheck.error;

    if (!existsInApp && !existsInWeb && !existsInCash) {
      orphanQRs.push(qr);
      console.log(`❌ Orphan QR found: ${qr.id} (transaction: ${qr.transaction_id})`);
    }
  }

  // Format the data
  const formattedOrphanQRs = orphanQRs.map((qr) => {
    const profile = Array.isArray(qr.profile) ? qr.profile[0] : qr.profile;
    return {
      id: qr.id,
      transaction_id: qr.transaction_id,
      user_id: qr.user_id,
      svg: qr.svg,
      created_at: qr.created_at,
      scan: qr.scan,
      scanner_id: qr.scanner_id,
      updated_at: qr.updated_at,
      apple: qr.apple,
      google: qr.google,
      user_name: profile ? `${profile.name || ''} ${profile.lastName || ''}`.trim() : 'N/A',
      user_email: profile?.email || 'N/A'
    };
  });

  console.log(`✅ Found ${formattedOrphanQRs.length} orphan QR codes out of ${allQRCodes.length} total QR codes`);

  return formattedOrphanQRs;
}

export async function getEventQRCodes(eventId: string) {
  const supabase = await createClient();

  // Get all tickets for this event
  const { data: ticketsData } = await supabase
    .from("tickets")
    .select("id, name")
    .eq("event_id", eventId);

  if (!ticketsData || ticketsData.length === 0) {
    return [];
  }

  // Ensure tickets is always an array
  const tickets = Array.isArray(ticketsData) ? ticketsData : [ticketsData];
  const ticketIds = tickets.map(t => t.id);
  const ticketMap = new Map(tickets.map(t => [t.id, t.name]));

  // Helper function to fetch QR codes directly with transaction data in batches
  async function fetchAllQRCodes(tableName: string, source: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allData: any[] = [];
    let from = 0;
    const batchSize = 1000;

    while (true) {
      const { data, error } = await supabase
        .from(tableName)
        .select(`
          id,
          ticket_id,
          user_id,
          order_id,
          created_at
        `)
        .in("ticket_id", ticketIds)
        .eq("status", "PAID WITH QR")
        .range(from, from + batchSize - 1);

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        break;
      }

      if (!data || data.length === 0) break;

      allData.push(...data.map(t => ({ ...t, source })));

      if (data.length < batchSize) break;
      from += batchSize;
    }

    return allData;
  }

  // Get all transactions in parallel
  const [appTx, webTx, cashTx] = await Promise.all([
    fetchAllQRCodes("transactions", "app"),
    fetchAllQRCodes("transactions_web", "web"),
    fetchAllQRCodes("transactions_cash", "cash"),
  ]);

  const allTransactions = [...appTx, ...webTx, ...cashTx];

  if (allTransactions.length === 0) {
    return [];
  }

  const transactionIds = allTransactions.map(t => t.id);
  const transactionMap = new Map(allTransactions.map(t => [t.id, t]));

  // Fetch all QR codes for these transactions in batches
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allQRCodes: any[] = [];
  let from = 0;
  const batchSize = 1000;

  while (true) {
    const { data: qrBatch, error } = await supabase
      .from("qr_codes")
      .select("id, transaction_id, user_id, created_at, scan, scanner_id, updated_at, apple, google")
      .in("transaction_id", transactionIds)
      .range(from, from + batchSize - 1);

    if (error) {
      console.error("Error fetching QR codes:", error);
      break;
    }

    if (!qrBatch || qrBatch.length === 0) break;

    allQRCodes.push(...qrBatch);

    if (qrBatch.length < batchSize) break;
    from += batchSize;
  }

  // Get unique user and scanner IDs
  const userIds = [...new Set(allQRCodes.map(qr => qr.user_id))];
  const scannerIds = [...new Set(allQRCodes.filter(qr => qr.scanner_id).map(qr => qr.scanner_id))];

  // Fetch all user and scanner profiles in parallel
  const [usersData, scannersData] = await Promise.all([
    userIds.length > 0
      ? supabase.from("profiles").select("id, name, lastName, email").in("id", userIds)
      : Promise.resolve({ data: [] }),
    scannerIds.length > 0
      ? supabase.from("profiles").select("id, name, lastName, email").in("id", scannerIds)
      : Promise.resolve({ data: [] }),
  ]);

  const userMap = new Map((usersData.data || []).map(u => [u.id, u]));
  const scannerMap = new Map((scannersData.data || []).map(s => [s.id, s]));

  // Format the QR codes with all data
  const formattedQRCodes = allQRCodes.map(qr => {
    const transaction = transactionMap.get(qr.transaction_id);
    const user = userMap.get(qr.user_id);
    const scanner = qr.scanner_id ? scannerMap.get(qr.scanner_id) : null;

    return {
      id: qr.id,
      transaction_id: qr.transaction_id,
      user_id: qr.user_id,
      created_at: qr.created_at,
      scan: qr.scan,
      scanner_id: qr.scanner_id,
      updated_at: qr.updated_at,
      apple: qr.apple,
      google: qr.google,
      user_name: user ? `${user.name || ''} ${user.lastName || ''}`.trim() : 'N/A',
      user_email: user?.email || 'N/A',
      scanner_name: scanner ? `${scanner.name || ''} ${scanner.lastName || ''}`.trim() : null,
      scanner_email: scanner?.email || null,
      ticket_name: transaction?.ticket_id ? ticketMap.get(transaction.ticket_id) || 'N/A' : 'N/A',
      source: transaction?.source || 'unknown',
      order_id: transaction?.order_id || null,
    };
  });

  return formattedQRCodes;
}