"use server";

import { createClient } from "@/lib/supabase/server";

export async function getAllTransactionsForAccounting() {
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
          price,
          variable_fee,
          tax,
          status,
          created_at,
          ticket_id,
          user_id,
          tickets!inner(
            id,
            name,
            event_id,
            events!inner(
              id,
              name,
              date
            )
          ),
          user:profiles!user_id(
            name,
            lastName,
            email
          )
        `)
        .eq("status", "PAID WITH QR")
        .order("created_at", { ascending: false })
        .range(from, from + batchSize - 1);

      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
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

  console.log(`📊 Total Accounting Transactions: ${allTransactions.length}`);

  return allTransactions;
}

export async function getAccountingSummary() {
  // Get all transactions
  const transactions = await getAllTransactionsForAccounting();

  // Calculate totals
  const totalIngresos = transactions.reduce((sum, t) => sum + (t.total || 0), 0);
  const totalTicketsSold = transactions.reduce((sum, t) => sum + (t.quantity || 0), 0);
  const totalFees = transactions.reduce((sum, t) => sum + (t.variable_fee || 0), 0);
  const totalTax = transactions.reduce((sum, t) => sum + (t.tax || 0), 0);

  // Group by channel
  const byChannel = {
    app: transactions.filter(t => t.source === 'app').reduce((sum, t) => sum + (t.total || 0), 0),
    web: transactions.filter(t => t.source === 'web').reduce((sum, t) => sum + (t.total || 0), 0),
    cash: transactions.filter(t => t.source === 'cash').reduce((sum, t) => sum + (t.total || 0), 0),
  };

  // Group by month (last 12 months)
  const monthlyData: Record<string, { ingresos: number; transactions: number }> = {};
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[key] = { ingresos: 0, transactions: 0 };
  }

  transactions.forEach(t => {
    const date = new Date(t.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyData[key]) {
      monthlyData[key].ingresos += t.total || 0;
      monthlyData[key].transactions += 1;
    }
  });

  // Top events by revenue
  const eventRevenue: Record<string, { name: string; revenue: number; tickets: number }> = {};

  transactions.forEach(t => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const event = (t.tickets as any)?.events;
    if (event?.id) {
      if (!eventRevenue[event.id]) {
        eventRevenue[event.id] = { name: event.name, revenue: 0, tickets: 0 };
      }
      eventRevenue[event.id].revenue += t.total || 0;
      eventRevenue[event.id].tickets += t.quantity || 0;
    }
  });

  const topEvents = Object.values(eventRevenue)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    totalIngresos,
    totalTicketsSold,
    totalFees,
    totalTax,
    byChannel,
    monthlyData: Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .reverse(),
    topEvents,
    transactionCount: transactions.length,
  };
}

export async function getExpenses() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }

  return data || [];
}

export async function createExpense(expenseData: {
  concept: string;
  amount: number;
  category: string;
  date: string;
  description?: string;
  provider?: string;
  invoice_number?: string;
}) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "No autenticado" };
  }

  const { error } = await supabase
    .from("expenses")
    .insert({
      concept: expenseData.concept,
      amount: expenseData.amount,
      category: expenseData.category,
      date: expenseData.date,
      description: expenseData.description || null,
      provider: expenseData.provider || null,
      invoice_number: expenseData.invoice_number || null,
      created_by: user.id,
    });

  if (error) {
    console.error("Error creating expense:", error);
    return { success: false, message: "Error al crear el gasto" };
  }

  return { success: true, message: "Gasto registrado exitosamente" };
}
