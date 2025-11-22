"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { createClient } from "@/lib/supabase/server";

interface QRCode {
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

interface TransactionMissingQR {
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

interface AccessControlData {
  qrCodes: QRCode[];
  transactionsMissingQR: TransactionMissingQR[];
  stats: {
    totalTransactions: number;
    expectedQRs: number;
    actualQRs: number;
    missingQRs: number;
  };
}

export async function getEventAccessControl(eventId: string): Promise<AccessControlData> {
  const supabase = await createClient();
  const startTime = Date.now();

  try {
    console.log(`\n🎫 ===== CONTROL DE ACCESO - Event: ${eventId} =====`);

    // 1. Obtener tickets del evento
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select("id, name")
      .eq("event_id", eventId);

    if (ticketsError || !tickets || tickets.length === 0) {
      console.error("Error o no hay tickets:", ticketsError);
      return {
        qrCodes: [],
        transactionsMissingQR: [],
        stats: { totalTransactions: 0, expectedQRs: 0, actualQRs: 0, missingQRs: 0 }
      };
    }

    const ticketIds = tickets.map(t => t.id);
    const ticketMap = Object.fromEntries(tickets.map(t => [t.id, t.name]));
    console.log(`📋 Tickets del evento: ${tickets.length}`);

    // 2. Obtener TODAS las transacciones con status "PAID WITH QR" de las 3 tablas
    // USANDO LA MISMA LÓGICA DEL DASHBOARD con INNER JOIN
    async function fetchAllTransactions(tableName: string, source: string) {
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
              price
            )
          `)
          .eq("tickets.event_id", eventId)
          .eq("status", "PAID WITH QR")
          .order("created_at", { ascending: false })
          .range(from, from + batchSize - 1);

        if (error) {
          console.error(`❌ Error en ${tableName}:`, error);
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

    const [appTransactions, webTransactions, cashTransactions] = await Promise.all([
      fetchAllTransactions("transactions", "app"),
      fetchAllTransactions("transactions_web", "web"),
      fetchAllTransactions("transactions_cash", "cash"),
    ]);

    console.log(`  app     : ${appTransactions.length} transacciones`);
    console.log(`  web     : ${webTransactions.length} transacciones`);
    console.log(`  cash    : ${cashTransactions.length} transacciones`);

    const allTransactions = [
      ...appTransactions,
      ...webTransactions,
      ...cashTransactions,
    ];

    const totalTransactions = allTransactions.length;
    const expectedQRs = allTransactions.reduce((sum, t) => sum + (t.quantity || 1), 0);

    console.log(`\n📊 RESUMEN DE TRANSACCIONES:`);
    console.log(`   Total transacciones: ${totalTransactions}`);
    console.log(`   Tickets vendidos (sum quantity): ${expectedQRs}`);

    if (totalTransactions === 0) {
      return {
        qrCodes: [],
        transactionsMissingQR: [],
        stats: { totalTransactions: 0, expectedQRs: 0, actualQRs: 0, missingQRs: 0 }
      };
    }

    // 3. Obtener TODOS los QR codes de esas transacciones
    const transactionIds = allTransactions.map(t => t.id);
    const allQRCodes: any[] = [];
    const batchSize = 100;

    for (let i = 0; i < transactionIds.length; i += batchSize) {
      const batch = transactionIds.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from("qr_codes")
        .select("id, transaction_id, user_id, created_at, scan, scanner_id, updated_at, apple, google")
        .in("transaction_id", batch);

      if (error) {
        console.error("❌ Error obteniendo QR codes:", error);
        continue;
      }

      if (data) {
        allQRCodes.push(...data);
      }
    }

    const actualQRs = allQRCodes.length;
    const missingQRs = expectedQRs - actualQRs;

    console.log(`\n📱 QR CODES EMITIDOS:`);
    console.log(`   Total en tabla qr_codes: ${actualQRs}`);

    console.log(`\n🔍 COMPARACIÓN VENDIDOS vs EMITIDOS:`);
    console.log(`   ✓ Tickets vendidos (esperados): ${expectedQRs}`);
    console.log(`   ✓ QR codes emitidos (reales):   ${actualQRs}`);
    console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    if (missingQRs > 0) {
      console.log(`   ⚠️  FALTANTES: ${missingQRs} QR codes NO EMITIDOS`);
      console.log(`   📉 Porcentaje emitido: ${((actualQRs / expectedQRs) * 100).toFixed(2)}%`);
    } else if (missingQRs < 0) {
      console.log(`   ⚠️  EXCEDENTES: ${Math.abs(missingQRs)} QR codes DE MÁS`);
      console.log(`   📈 Porcentaje emitido: ${((actualQRs / expectedQRs) * 100).toFixed(2)}%`);
    } else {
      console.log(`   ✅ PERFECTO: Todos los tickets tienen QR code`);
      console.log(`   📊 Cobertura: 100%`);
    }

    // 4. Contar QR por transacción
    const qrCountByTransaction = new Map<string, number>();
    allQRCodes.forEach(qr => {
      const count = qrCountByTransaction.get(qr.transaction_id) || 0;
      qrCountByTransaction.set(qr.transaction_id, count + 1);
    });

    // 5. Identificar transacciones con QR faltantes
    const transactionsWithMissingQR = allTransactions.filter(t => {
      const expected = t.quantity || 1;
      const actual = qrCountByTransaction.get(t.id) || 0;
      return actual < expected;
    });

    console.log(`\n🚨 ANÁLISIS DETALLADO DE TRANSACCIONES CON QR FALTANTES:`);
    console.log(`   ${transactionsWithMissingQR.length} transacciones afectadas`);

    if (transactionsWithMissingQR.length > 0) {
      let totalTicketsMissing = 0;
      const missingBySource = { app: 0, web: 0, cash: 0 };

      transactionsWithMissingQR.forEach(t => {
        const expected = t.quantity || 1;
        const actual = qrCountByTransaction.get(t.id) || 0;
        const missing = expected - actual;
        totalTicketsMissing += missing;

        if (missingBySource[t.source as 'app' | 'web' | 'cash'] !== undefined) {
          missingBySource[t.source as 'app' | 'web' | 'cash'] += missing;
        }
      });

      console.log(`   Total QR faltantes: ${totalTicketsMissing}`);
      console.log(`   Desglose por canal:`);
      console.log(`     - App:  ${missingBySource.app} QR faltantes`);
      console.log(`     - Web:  ${missingBySource.web} QR faltantes`);
      console.log(`     - Cash: ${missingBySource.cash} QR faltantes`);

      // Mostrar primeras 5 transacciones problemáticas
      if (transactionsWithMissingQR.length > 0) {
        console.log(`\n   Primeras 5 transacciones con problemas:`);
        transactionsWithMissingQR.slice(0, 5).forEach((t, idx) => {
          const expected = t.quantity || 1;
          const actual = qrCountByTransaction.get(t.id) || 0;
          const missing = expected - actual;
          console.log(`     ${idx + 1}. ID: ${t.id.substring(0, 8)}... | Esperados: ${expected} | Generados: ${actual} | Faltantes: ${missing} | Canal: ${t.source}`);
        });
        if (transactionsWithMissingQR.length > 5) {
          console.log(`     ... y ${transactionsWithMissingQR.length - 5} más`);
        }
      }
    }

    // 6. Obtener perfiles de usuarios y scanners
    // IMPORTANTE: user_id en qr_codes puede ser DIFERENTE al user_id de la transacción
    // - user_id en transacción = comprador original
    // - user_id en qr_code = dueño actual del ticket (puede haber sido transferido)
    const allUserIds = new Set<string>();
    allTransactions.forEach(t => t.user_id && allUserIds.add(t.user_id)); // Compradores originales
    allQRCodes.forEach(qr => qr.user_id && allUserIds.add(qr.user_id));   // Dueños actuales de tickets

    const scannerIds = [...new Set(allQRCodes.filter(qr => qr.scanner_id).map(qr => qr.scanner_id))];
    const userIds = Array.from(allUserIds);
    const transactionMap = new Map(allTransactions.map(t => [t.id, t]));

    // Detectar tickets transferidos
    let transferredTickets = 0;
    allQRCodes.forEach(qr => {
      const transaction = transactionMap.get(qr.transaction_id);
      if (transaction && qr.user_id !== transaction.user_id) {
        transferredTickets++;
      }
    });

    console.log(`\n👥 Obteniendo perfiles: ${userIds.length} usuarios únicos, ${scannerIds.length} scanners`);
    if (transferredTickets > 0) {
      console.log(`   🔄 Tickets transferidos detectados: ${transferredTickets} QR codes pertenecen a usuarios diferentes al comprador original`);
    }

    const userProfiles: any[] = [];
    const scannerProfiles: any[] = [];
    const profileBatchSize = 100;

    // Fetch user profiles
    for (let i = 0; i < userIds.length; i += profileBatchSize) {
      const batch = userIds.slice(i, i + profileBatchSize);
      const { data } = await supabase
        .from("profiles")
        .select("id, name, lastName, email")
        .in("id", batch);

      if (data) userProfiles.push(...data);
    }

    // Fetch scanner profiles
    for (let i = 0; i < scannerIds.length; i += profileBatchSize) {
      const batch = scannerIds.slice(i, i + profileBatchSize);
      const { data } = await supabase
        .from("profiles")
        .select("id, name, lastName, email")
        .in("id", batch);

      if (data) scannerProfiles.push(...data);
    }

    const userMap = Object.fromEntries(userProfiles.map(u => [u.id, u]));
    const scannerMap = Object.fromEntries(scannerProfiles.map(s => [s.id, s]));

    // 7. Formatear QR codes
    const formattedQRCodes: QRCode[] = allQRCodes.map(qr => {
      const transaction = transactionMap.get(qr.transaction_id);
      const user = userMap[qr.user_id]; // ← DUEÑO ACTUAL del ticket (puede ser diferente al comprador)
      const scanner = qr.scanner_id ? scannerMap[qr.scanner_id] : null;

      return {
        id: qr.id,
        transaction_id: qr.transaction_id,
        user_id: qr.user_id, // ← user_id del QR (dueño actual, NO el comprador original)
        created_at: qr.created_at,
        scan: qr.scan || false,
        scanner_id: qr.scanner_id,
        updated_at: qr.updated_at,
        apple: qr.apple || false,
        google: qr.google || false,
        user_name: user ? `${user.name || ''} ${user.lastName || ''}`.trim() || 'Sin nombre' : 'N/A', // Dueño actual
        user_email: user?.email || 'N/A', // Dueño actual
        scanner_name: scanner ? `${scanner.name || ''} ${scanner.lastName || ''}`.trim() || null : null,
        scanner_email: scanner?.email || null,
        ticket_name: transaction?.ticket_id ? (ticketMap[transaction.ticket_id] || 'N/A') : 'N/A',
        source: transaction?.source || 'unknown',
        order_id: transaction?.order_id || null
      };
    });

    // 8. Formatear transacciones con QR faltantes
    // NOTA: Aquí mostramos el COMPRADOR ORIGINAL (user_id de la transacción)
    // porque son transacciones que no tienen todos sus QR generados aún
    const formattedTransactionsMissingQR: TransactionMissingQR[] = transactionsWithMissingQR.map(t => {
      const user = userMap[t.user_id]; // ← COMPRADOR ORIGINAL (user_id de la transacción)
      const expected = t.quantity || 1;
      const actual = qrCountByTransaction.get(t.id) || 0;

      return {
        id: t.id,
        transaction_id: t.id,
        user_id: t.user_id, // ← user_id de la transacción (comprador original)
        user_name: user ? `${user.name || ''} ${user.lastName || ''}`.trim() || 'Sin nombre' : 'N/A', // Comprador original
        user_email: user?.email || 'N/A', // Comprador original
        ticket_name: ticketMap[t.ticket_id] || 'N/A',
        quantity: expected,
        actualQRs: actual,
        missingQRs: expected - actual,
        status: t.status || 'PAID WITH QR',
        source: t.source || 'unknown',
        order_id: t.order_id || null,
        created_at: t.created_at || new Date().toISOString(),
        total: t.total || 0
      };
    });

    const duration = Date.now() - startTime;
    console.log(`\n✅ Proceso completado en ${duration}ms`);
    console.log(`================================================\n`);

    return {
      qrCodes: formattedQRCodes,
      transactionsMissingQR: formattedTransactionsMissingQR,
      stats: {
        totalTransactions,
        expectedQRs,
        actualQRs,
        missingQRs
      }
    };

  } catch (error) {
    console.error("❌ Error en getEventAccessControl:", error);
    return {
      qrCodes: [],
      transactionsMissingQR: [],
      stats: { totalTransactions: 0, expectedQRs: 0, actualQRs: 0, missingQRs: 0 }
    };
  }
}
