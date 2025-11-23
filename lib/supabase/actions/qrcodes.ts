"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from "@/lib/supabase/server";

interface QRCodeResult {
  id: string;
  transaction_id: string;
  user_id: string;
  created_at: string;
  scan: boolean;
  scanner_id: string | null;
  updated_at: string | null;
  apple: boolean;
  google: boolean;
  user_name: string;
  user_email: string;
  scanner_name: string | null;
  scanner_email: string | null;
  ticket_name: string;
  source: string;
  order_id: string | null;
}

interface TransactionWithoutQR {
  id: string;
  transaction_id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  ticket_name: string;
  quantity: number;
  actualQRs: number;
  missingQRs: number;
  status: string;
  source: string;
  order_id: string | null;
  created_at: string;
  total: number;
}

interface EventQRCodesData {
  qrCodes: QRCodeResult[];
  transactionsWithoutQR: TransactionWithoutQR[];
}

export async function getEventQRCodesOptimized(eventId: string): Promise<EventQRCodesData> {
  const supabase = await createClient();
  const startTime = Date.now();

  try {
    // 1. Get tickets for this event
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select("id, name")
      .eq("event_id", eventId);

    if (ticketsError) {
      console.error("Error fetching tickets:", ticketsError);
      return { qrCodes: [], transactionsWithoutQR: [] };
    }

    if (!tickets || tickets.length === 0) {
      console.log("No tickets found for event");
      return { qrCodes: [], transactionsWithoutQR: [] };
    }

    const ticketIds = tickets.map(t => t.id);
    const ticketMap = Object.fromEntries(tickets.map(t => [t.id, t.name]));

    // 2. Get ALL transactions for these tickets (to find those without QR)
    const transactions: any[] = [];
    const tables = [
      { name: "transactions", source: "app" },
      { name: "transactions_web", source: "web" },
      { name: "transactions_cash", source: "cash" }
    ];

    // Process each table in parallel
    const transactionPromises = tables.map(async ({ name, source }) => {
      const results: any[] = [];
      let from = 0;
      const batchSize = 5000; // Larger batch for simple queries

      while (true) {
        const { data, error } = await supabase
          .from(name)
          .select("id, ticket_id, user_id, order_id, quantity, status, total, created_at")
          .in("ticket_id", ticketIds)
          .range(from, from + batchSize - 1);

        if (error) {
          console.error(`Error fetching ${name}:`, error);
          break;
        }

        if (!data || data.length === 0) break;

        results.push(...data.map(t => ({ ...t, source })));

        if (data.length < batchSize) break;
        from += batchSize;
      }

      return results;
    });

    const transactionResults = await Promise.all(transactionPromises);
    transactionResults.forEach(results => transactions.push(...results));

    if (transactions.length === 0) {
      console.log("No transactions found");
      return { qrCodes: [], transactionsWithoutQR: [] };
    }

    // Filter only transactions with "PAID WITH QR" status
    const transactionsWithQRStatus = transactions.filter(t => t.status === "PAID WITH QR");

    // Calculate expected QR count from transactions
    const expectedQRCount = transactionsWithQRStatus.reduce((sum, t) => {
      const qty = (t as any).quantity || 1;
      return sum + qty;
    }, 0);

    console.log(`Found ${transactions.length} total transactions`);
    console.log(`  - ${transactionsWithQRStatus.length} with "PAID WITH QR" status (expected ${expectedQRCount} QR codes)`);

    // Create lookup maps
    const transactionMap = new Map(transactions.map(t => [t.id, t]));
    const transactionIds = transactionsWithQRStatus.map(t => t.id);

    // 3. Get QR codes for these transactions in batches
    const qrCodes: any[] = [];
    const qrBatchSize = 100; // Smaller batch size for .in() queries (Supabase limit)

    // Process in batches to avoid query limits
    for (let i = 0; i < transactionIds.length; i += qrBatchSize) {
      const batchIds = transactionIds.slice(i, i + qrBatchSize);

      const { data, error } = await supabase
        .from("qr_codes")
        .select("id, transaction_id, user_id, created_at, scan, scanner_id, updated_at, apple, google")
        .in("transaction_id", batchIds);

      if (error) {
        console.error("Error fetching QR codes batch:", error);
        console.error("Batch size:", batchIds.length);
        console.error("Sample IDs:", batchIds.slice(0, 3));
        continue;
      }

      if (data) {
        qrCodes.push(...data);
        console.log(`Batch ${Math.floor(i / qrBatchSize) + 1}: Fetched ${data.length} QR codes`);
      }
    }

    console.log(`Found ${qrCodes.length} QR codes`);

    // Check for discrepancy
    if (qrCodes.length !== expectedQRCount) {
      console.warn(`⚠️ DESCUADRE: Expected ${expectedQRCount} QR codes but found ${qrCodes.length}`);
      console.warn(`Diferencia: ${Math.abs(qrCodes.length - expectedQRCount)} códigos QR`);
    }

    // Count QR codes per transaction
    const qrCountByTransaction = new Map<string, number>();
    qrCodes.forEach(qr => {
      const count = qrCountByTransaction.get(qr.transaction_id) || 0;
      qrCountByTransaction.set(qr.transaction_id, count + 1);
    });

    // Identify transactions with missing QR codes
    // A transaction is missing QR codes if:
    // 1. It has NO QR codes at all, OR
    // 2. It has fewer QR codes than its quantity field
    const transactionsWithMissingQR = transactionsWithQRStatus.filter(t => {
      const expectedQRs = t.quantity || 1;
      const actualQRs = qrCountByTransaction.get(t.id) || 0;
      return actualQRs < expectedQRs;
    });

    console.log(`Found ${transactionsWithMissingQR.length} transactions with missing QR codes`);

    if (qrCodes.length === 0 && transactionsWithMissingQR.length === 0) {
      return { qrCodes: [], transactionsWithoutQR: [] };
    }

    // 4. Get unique user and scanner IDs (including users from transactions with missing QR)
    const qrUserIds = qrCodes.map(qr => qr.user_id).filter(Boolean);
    const transactionsMissingQRUserIds = transactionsWithMissingQR.map(t => t.user_id).filter(Boolean);
    const userIds = [...new Set([...qrUserIds, ...transactionsMissingQRUserIds])];
    const scannerIds = [...new Set(qrCodes.filter(qr => qr.scanner_id).map(qr => qr.scanner_id))];

    console.log(`Fetching ${userIds.length} user profiles and ${scannerIds.length} scanner profiles`);

    // 5. Fetch profiles in batches
    const profileBatchSize = 100; // Same safe batch size
    const userProfiles: any[] = [];
    const scannerProfiles: any[] = [];

    // Fetch user profiles in batches
    for (let i = 0; i < userIds.length; i += profileBatchSize) {
      const batch = userIds.slice(i, i + profileBatchSize);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, lastName, email")
        .in("id", batch);

      if (error) {
        console.error("Error fetching user profiles:", error);
        continue;
      }

      if (data) userProfiles.push(...data);
    }

    // Fetch scanner profiles in batches
    for (let i = 0; i < scannerIds.length; i += profileBatchSize) {
      const batch = scannerIds.slice(i, i + profileBatchSize);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, name, lastName, email")
        .in("id", batch);

      if (error) {
        console.error("Error fetching scanner profiles:", error);
        continue;
      }

      if (data) scannerProfiles.push(...data);
    }

    // Create lookup maps for profiles
    const userMap = Object.fromEntries(userProfiles.map(u => [u.id, u]));
    const scannerMap = Object.fromEntries(scannerProfiles.map(s => [s.id, s]));

    // 6. Format the final result
    const result = qrCodes.map(qr => {
      const transaction = transactionMap.get(qr.transaction_id);
      const user = userMap[qr.user_id];
      const scanner = qr.scanner_id ? scannerMap[qr.scanner_id] : null;

      return {
        id: qr.id,
        transaction_id: qr.transaction_id,
        user_id: qr.user_id,
        created_at: qr.created_at,
        scan: qr.scan || false,
        scanner_id: qr.scanner_id,
        updated_at: qr.updated_at,
        apple: qr.apple || false,
        google: qr.google || false,
        user_name: user ? `${user.name || ''} ${user.lastName || ''}`.trim() || 'Sin nombre' : 'N/A',
        user_email: user?.email || 'N/A',
        scanner_name: scanner ? `${scanner.name || ''} ${scanner.lastName || ''}`.trim() || null : null,
        scanner_email: scanner?.email || null,
        ticket_name: transaction?.ticket_id ? (ticketMap[transaction.ticket_id] || 'N/A') : 'N/A',
        source: transaction?.source || 'unknown',
        order_id: transaction?.order_id || null
      };
    });

    // 7. Format transactions with missing QR codes
    const transactionsWithoutQRFormatted = transactionsWithMissingQR.map(t => {
      const user = userMap[t.user_id];
      const expectedQRs = t.quantity || 1;
      const actualQRs = qrCountByTransaction.get(t.id) || 0;
      const missingQRs = expectedQRs - actualQRs;

      return {
        id: t.id,
        transaction_id: t.id,
        user_id: t.user_id,
        user_name: user ? `${user.name || ''} ${user.lastName || ''}`.trim() || 'Sin nombre' : 'N/A',
        user_email: user?.email || 'N/A',
        ticket_name: ticketMap[t.ticket_id] || 'N/A',
        quantity: t.quantity || 1,
        actualQRs: actualQRs,
        missingQRs: missingQRs,
        status: t.status || 'UNKNOWN',
        source: t.source || 'unknown',
        order_id: t.order_id || null,
        created_at: t.created_at || new Date().toISOString(),
        total: t.total || 0
      };
    });

    const duration = Date.now() - startTime;
    console.log(`✅ Returning ${result.length} QR codes and ${transactionsWithoutQRFormatted.length} transactions without QR (took ${duration}ms)`);

    return {
      qrCodes: result,
      transactionsWithoutQR: transactionsWithoutQRFormatted
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("Unexpected error in getEventQRCodesOptimized:", error);
    console.error(`Failed after ${duration}ms`);
    return { qrCodes: [], transactionsWithoutQR: [] };
  }
}