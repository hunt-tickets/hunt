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

export async function getEventQRCodesV2(eventId: string): Promise<EventQRCodesData> {
  const supabase = await createClient();
  const startTime = Date.now();

  try {
    console.log("🔄 CONTROL DE ACCESO V2 - Starting...");

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

    console.log(`📋 Found ${tickets.length} ticket types for event`);

    // 2. Get ALL transactions from the 3 tables
    const allTransactions: any[] = [];
    const tables = [
      { name: "transactions", source: "app" },
      { name: "transactions_web", source: "web" },
      { name: "transactions_cash", source: "cash" }
    ];

    for (const { name, source } of tables) {
      let from = 0;
      const batchSize = 5000;
      let tableCount = 0;

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

        const transactionsWithSource = data.map(t => ({ ...t, source }));
        allTransactions.push(...transactionsWithSource);
        tableCount += data.length;

        if (data.length < batchSize) break;
        from += batchSize;
      }

      console.log(`  - ${name}: ${tableCount} transactions`);
    }

    console.log(`📊 Total transactions found: ${allTransactions.length}`);

    // 3. Get ALL QR codes for ALL transactions (not just PAID WITH QR)
    const transactionIds = allTransactions.map(t => t.id);
    const allQRCodes: any[] = [];
    const qrBatchSize = 100;

    console.log(`🔍 Fetching QR codes for ${transactionIds.length} transactions...`);

    for (let i = 0; i < transactionIds.length; i += qrBatchSize) {
      const batchIds = transactionIds.slice(i, i + qrBatchSize);

      const { data, error } = await supabase
        .from("qr_codes")
        .select("id, transaction_id, user_id, created_at, scan, scanner_id, updated_at, apple, google")
        .in("transaction_id", batchIds);

      if (error) {
        console.error("Error fetching QR codes batch:", error);
        continue;
      }

      if (data) {
        allQRCodes.push(...data);
      }
    }

    console.log(`✅ Found ${allQRCodes.length} QR codes in qr_codes table`);

    // 4. Calculate expected vs actual
    const transactionsWithQRStatus = allTransactions.filter(t => t.status === "PAID WITH QR");
    const expectedQRCount = transactionsWithQRStatus.reduce((sum, t) => sum + (t.quantity || 1), 0);

    console.log(`📈 Transactions with "PAID WITH QR": ${transactionsWithQRStatus.length}`);
    console.log(`📈 Expected QR codes: ${expectedQRCount}`);
    console.log(`📈 Actual QR codes: ${allQRCodes.length}`);
    console.log(`⚠️  Difference: ${Math.abs(expectedQRCount - allQRCodes.length)} QR codes`);

    // 5. Build transaction map and count QRs per transaction
    const transactionMap = new Map(allTransactions.map(t => [t.id, t]));
    const qrCountByTransaction = new Map<string, number>();

    allQRCodes.forEach(qr => {
      const count = qrCountByTransaction.get(qr.transaction_id) || 0;
      qrCountByTransaction.set(qr.transaction_id, count + 1);
    });

    // 6. Identify transactions with missing QR codes (only for PAID WITH QR status)
    const transactionsWithMissingQR = transactionsWithQRStatus.filter(t => {
      const expectedQRs = t.quantity || 1;
      const actualQRs = qrCountByTransaction.get(t.id) || 0;
      return actualQRs < expectedQRs;
    });

    console.log(`🚨 Transactions with missing QR codes: ${transactionsWithMissingQR.length}`);

    // 7. Get all unique user IDs and scanner IDs
    const qrUserIds = allQRCodes.map(qr => qr.user_id).filter(Boolean);
    const transactionUserIds = transactionsWithMissingQR.map(t => t.user_id).filter(Boolean);
    const allUserIds = [...new Set([...qrUserIds, ...transactionUserIds])];
    const scannerIds = [...new Set(allQRCodes.filter(qr => qr.scanner_id).map(qr => qr.scanner_id))];

    console.log(`👥 Fetching ${allUserIds.length} user profiles and ${scannerIds.length} scanner profiles`);

    // 8. Fetch profiles in batches
    const profileBatchSize = 100;
    const userProfiles: any[] = [];
    const scannerProfiles: any[] = [];

    for (let i = 0; i < allUserIds.length; i += profileBatchSize) {
      const batch = allUserIds.slice(i, i + profileBatchSize);
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

    const userMap = Object.fromEntries(userProfiles.map(u => [u.id, u]));
    const scannerMap = Object.fromEntries(scannerProfiles.map(s => [s.id, s]));

    // 9. Format QR codes
    const formattedQRCodes = allQRCodes.map(qr => {
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

    // 10. Format transactions with missing QR codes
    const formattedTransactionsWithoutQR = transactionsWithMissingQR.map(t => {
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
    console.log(`✅ V2 COMPLETE: Returning ${formattedQRCodes.length} QR codes and ${formattedTransactionsWithoutQR.length} transactions with missing QR (took ${duration}ms)`);

    return {
      qrCodes: formattedQRCodes,
      transactionsWithoutQR: formattedTransactionsWithoutQR
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("Unexpected error in getEventQRCodesV2:", error);
    console.error(`Failed after ${duration}ms`);
    return { qrCodes: [], transactionsWithoutQR: [] };
  }
}
