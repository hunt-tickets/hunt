"use server";

import { createClient } from "@/lib/supabase/server";

// Interfaces
export interface AccessControlStats {
  totalTransactions: number;
  expectedQRs: number;
  actualQRs: number;
  missingQRs: number;
  scannedQRs: number;
  appleWallet: number;
  googleWallet: number;
  transactionsWithMissingQR: number;
}

export interface QRCodePaginated {
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

export interface TransactionMissingQRPaginated {
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

interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 1. FUNCIÓN OPTIMIZADA: Solo obtener estadísticas (sin cargar todos los datos)
export async function getEventAccessStats(eventId: string): Promise<AccessControlStats | null> {
  const supabase = await createClient();

  try {
    // Obtener tickets del evento
    const { data: tickets, error: ticketsError } = await supabase
      .from("tickets")
      .select("id")
      .eq("event_id", eventId);

    if (ticketsError || !tickets || tickets.length === 0) {
      return null;
    }

    const ticketIds = tickets.map(t => t.id);

    // Contar transacciones y cantidad total (usando agregación en la base de datos)
    const countTransactions = async (tableName: string) => {
      const { count, data, error } = await supabase
        .from(tableName)
        .select("quantity", { count: 'exact' })
        .in("ticket_id", ticketIds)
        .eq("status", "PAID WITH QR");

      if (error) {
        console.error(`Error counting ${tableName}:`, error);
        return { count: 0, totalQuantity: 0 };
      }

      const totalQuantity = data?.reduce((sum, t) => sum + (t.quantity || 1), 0) || 0;
      return { count: count || 0, totalQuantity };
    };

    // Ejecutar conteos en paralelo
    const [appStats, webStats, cashStats] = await Promise.all([
      countTransactions("transactions"),
      countTransactions("transactions_web"),
      countTransactions("transactions_cash"),
    ]);

    const totalTransactions = appStats.count + webStats.count + cashStats.count;
    const expectedQRs = appStats.totalQuantity + webStats.totalQuantity + cashStats.totalQuantity;

    // Primero obtener los IDs de transacciones para contar QR codes
    const transactionIds: string[] = [];

    // Obtener IDs de transacciones de cada tabla
    const { data: appTxIds } = await supabase
      .from("transactions")
      .select("id")
      .in("ticket_id", ticketIds)
      .eq("status", "PAID WITH QR");

    const { data: webTxIds } = await supabase
      .from("transactions_web")
      .select("id")
      .in("ticket_id", ticketIds)
      .eq("status", "PAID WITH QR");

    const { data: cashTxIds } = await supabase
      .from("transactions_cash")
      .select("id")
      .in("ticket_id", ticketIds)
      .eq("status", "PAID WITH QR");

    if (appTxIds) transactionIds.push(...appTxIds.map(t => t.id));
    if (webTxIds) transactionIds.push(...webTxIds.map(t => t.id));
    if (cashTxIds) transactionIds.push(...cashTxIds.map(t => t.id));

    // Contar QR codes reales y sus estados (con batching para manejar muchos IDs)
    let actualQRs = 0;
    const qrStats: Array<{ scan: boolean; apple: boolean; google: boolean }> = [];

    if (transactionIds.length > 0) {
      const batchSize = 500; // Procesar en lotes de 500 IDs

      for (let i = 0; i < transactionIds.length; i += batchSize) {
        const batch = transactionIds.slice(i, i + batchSize);

        const { count, data, error: qrError } = await supabase
          .from("qr_codes")
          .select("scan, apple, google", { count: 'exact' })
          .in("transaction_id", batch);

        if (qrError) {
          console.error("Error counting QR codes:", qrError);
          continue;
        }

        actualQRs += count || 0;
        if (data) {
          qrStats.push(...data);
        }
      }
    }

    // Calcular estadísticas de QR
    const scannedQRs = qrStats.filter(qr => qr.scan).length;
    const appleWallet = qrStats.filter(qr => qr.apple).length;
    const googleWallet = qrStats.filter(qr => qr.google).length;

    // Contar transacciones con QR faltantes (esto requiere una query más compleja)
    // Por ahora estimamos basándonos en la diferencia
    const missingQRs = Math.max(0, expectedQRs - (actualQRs || 0));
    const avgQRPerTransaction = totalTransactions > 0 ? expectedQRs / totalTransactions : 1;
    const transactionsWithMissingQR = Math.ceil(missingQRs / avgQRPerTransaction);

    return {
      totalTransactions,
      expectedQRs,
      actualQRs: actualQRs || 0,
      missingQRs,
      scannedQRs,
      appleWallet,
      googleWallet,
      transactionsWithMissingQR
    };

  } catch (error) {
    console.error("Error in getEventAccessStats:", error);
    return null;
  }
}

// 2. FUNCIÓN PAGINADA: Obtener QR codes con paginación
export async function getEventQRCodesPaginated(
  eventId: string,
  page: number = 1,
  pageSize: number = 50,
  searchTerm?: string,
  filterScanned?: boolean,
  filterSource?: 'app' | 'web' | 'cash'
): Promise<PaginatedResponse<QRCodePaginated>> {
  const supabase = await createClient();
  const offset = (page - 1) * pageSize;

  try {
    // Primero obtener tickets del evento
    const { data: tickets } = await supabase
      .from("tickets")
      .select("id, name")
      .eq("event_id", eventId);

    if (!tickets || tickets.length === 0) {
      return { data: [], totalCount: 0, page, pageSize, totalPages: 0 };
    }

    const ticketIds = tickets.map(t => t.id);
    const ticketMap = Object.fromEntries(tickets.map(t => [t.id, t.name]));

    // Obtener IDs de transacciones según el filtro de source
    const getTransactionIds = async (tableName: string, source: string) => {
      const { data } = await supabase
        .from(tableName)
        .select("id")
        .in("ticket_id", ticketIds)
        .eq("status", "PAID WITH QR");

      if (data) {
        return data.map(t => ({ id: t.id, source }));
      }
      return [];
    };

    const transactionData: { id: string; source: string }[] = [];

    if (!filterSource || filterSource === 'app') {
      const appData = await getTransactionIds("transactions", "app");
      transactionData.push(...appData);
    }
    if (!filterSource || filterSource === 'web') {
      const webData = await getTransactionIds("transactions_web", "web");
      transactionData.push(...webData);
    }
    if (!filterSource || filterSource === 'cash') {
      const cashData = await getTransactionIds("transactions_cash", "cash");
      transactionData.push(...cashData);
    }

    const transactionMap = Object.fromEntries(transactionData.map(t => [t.id, t.source]));
    const validTransactionIds = transactionData.map(t => t.id);

    if (validTransactionIds.length === 0) {
      return { data: [], totalCount: 0, page, pageSize, totalPages: 0 };
    }

    // Construir query base para QR codes (sin join de profiles por ahora)
    let qrQuery = supabase
      .from("qr_codes")
      .select(`
        id,
        transaction_id,
        user_id,
        created_at,
        scan,
        scanner_id,
        updated_at,
        apple,
        google
      `, { count: 'exact' })
      .in("transaction_id", validTransactionIds);

    // Aplicar filtros
    if (filterScanned !== undefined) {
      qrQuery = qrQuery.eq("scan", filterScanned);
    }

    // TODO: La búsqueda por email/nombre necesita hacerse después o con un enfoque diferente
    // ya que no podemos hacer join directo con profiles en qr_codes

    // Ejecutar query con paginación
    const { data: qrCodes, count, error } = await qrQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error("Error fetching QR codes:", error);
      return { data: [], totalCount: 0, page, pageSize, totalPages: 0 };
    }

    // Obtener información de usuarios y scanners
    const userIds = [...new Set(qrCodes?.map(qr => qr.user_id) || [])];
    const scannerIds = [...new Set(qrCodes?.filter(qr => qr.scanner_id).map(qr => qr.scanner_id) || [])];

    interface UserProfile {
      id: string;
      name: string | null;
      lastName: string | null;
      email: string;
    }

    let userMap: Record<string, UserProfile> = {};
    let scannerMap: Record<string, UserProfile> = {};

    // Obtener perfiles de usuarios
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("profiles")
        .select("id, name, lastName, email")
        .in("id", userIds);

      if (users) {
        userMap = Object.fromEntries(users.map(u => [u.id, u]));
      }
    }

    // Obtener perfiles de scanners
    if (scannerIds.length > 0) {
      const { data: scanners } = await supabase
        .from("profiles")
        .select("id, name, lastName, email")
        .in("id", scannerIds);

      if (scanners) {
        scannerMap = Object.fromEntries(scanners.map(s => [s.id, s]));
      }
    }

    // Obtener información adicional de las transacciones
    const transactionIdsInPage = [...new Set(qrCodes?.map(qr => qr.transaction_id) || [])];

    interface TransactionDetail {
      id: string;
      ticket_id: string;
      order_id: string | null;
    }

    const transactionDetails: Record<string, TransactionDetail> = {};

    // Solo buscar detalles si tenemos QR codes
    if (transactionIdsInPage.length > 0) {
      // Buscar en cada tabla de transacciones
      const [appTx, webTx, cashTx] = await Promise.all([
        supabase
          .from("transactions")
          .select("id, ticket_id, order_id")
          .in("id", transactionIdsInPage),
        supabase
          .from("transactions_web")
          .select("id, ticket_id, order_id")
          .in("id", transactionIdsInPage),
        supabase
          .from("transactions_cash")
          .select("id, ticket_id, order_id")
          .in("id", transactionIdsInPage),
      ]);

      // Combinar resultados
      if (appTx.data) appTx.data.forEach(t => transactionDetails[t.id] = t);
      if (webTx.data) webTx.data.forEach(t => transactionDetails[t.id] = t);
      if (cashTx.data) cashTx.data.forEach(t => transactionDetails[t.id] = t);
    }

    // Formatear los datos
    const formattedQRCodes: QRCodePaginated[] = (qrCodes || []).map(qr => {
      const user = userMap[qr.user_id];
      const scanner = qr.scanner_id ? scannerMap[qr.scanner_id] : null;
      const transaction = transactionDetails[qr.transaction_id];
      const source = transactionMap[qr.transaction_id] || 'unknown';

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
        source: source,
        order_id: transaction?.order_id || null
      };
    });

    const totalPages = Math.ceil((count || 0) / pageSize);

    return {
      data: formattedQRCodes,
      totalCount: count || 0,
      page,
      pageSize,
      totalPages
    };

  } catch (error) {
    console.error("Error in getEventQRCodesPaginated:", error);
    return { data: [], totalCount: 0, page, pageSize, totalPages: 0 };
  }
}

// 3. FUNCIÓN PAGINADA: Obtener transacciones sin QR con paginación
export async function getEventTransactionsMissingQRPaginated(
  eventId: string,
  page: number = 1,
  pageSize: number = 50
): Promise<PaginatedResponse<TransactionMissingQRPaginated>> {
  // Suppress unused variable warnings for future implementation
  void eventId;
  void page;
  void pageSize;

  try {
    // Esta función es más compleja porque necesitamos identificar transacciones con QR faltantes
    // Por ahora, retornamos un placeholder
    // TODO: Implementar lógica optimizada para encontrar transacciones con QR faltantes

    return {
      data: [],
      totalCount: 0,
      page,
      pageSize,
      totalPages: 0
    };

  } catch (error) {
    console.error("Error in getEventTransactionsMissingQRPaginated:", error);
    return { data: [], totalCount: 0, page, pageSize, totalPages: 0 };
  }
}

// 4. FUNCIÓN AUXILIAR: Buscar QR codes específicos (para escaneo)
export async function searchQRCode(
  eventId: string,
  qrCodeId: string
): Promise<QRCodePaginated | null> {
  const supabase = await createClient();

  try {
    const { data: qrCode, error } = await supabase
      .from("qr_codes")
      .select(`
        *,
        transactions!inner(
          ticket_id,
          source,
          order_id,
          tickets!inner(
            event_id,
            name
          )
        ),
        profiles!qr_codes_user_id_fkey(
          name,
          lastName,
          email
        )
      `)
      .eq("id", qrCodeId)
      .eq("transactions.tickets.event_id", eventId)
      .single();

    if (error || !qrCode) {
      return null;
    }

    const user = qrCode.profiles;
    const transaction = qrCode.transactions;

    return {
      id: qrCode.id,
      transaction_id: qrCode.transaction_id,
      user_id: qrCode.user_id,
      created_at: qrCode.created_at,
      scan: qrCode.scan || false,
      scanner_id: qrCode.scanner_id,
      updated_at: qrCode.updated_at,
      apple: qrCode.apple || false,
      google: qrCode.google || false,
      user_name: user ? `${user.name || ''} ${user.lastName || ''}`.trim() || 'Sin nombre' : 'N/A',
      user_email: user?.email || 'N/A',
      scanner_name: null,
      scanner_email: null,
      ticket_name: transaction?.tickets?.name || 'N/A',
      source: transaction?.source || 'unknown',
      order_id: transaction?.order_id || null
    };

  } catch (error) {
    console.error("Error in searchQRCode:", error);
    return null;
  }
}

// 5. FUNCIÓN DE ACTUALIZACIÓN: Marcar QR como escaneado
export async function markQRAsScanned(
  qrCodeId: string,
  scannerId: string
): Promise<boolean> {
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("qr_codes")
      .update({
        scan: true,
        scanner_id: scannerId,
        updated_at: new Date().toISOString()
      })
      .eq("id", qrCodeId);

    return !error;

  } catch (error) {
    console.error("Error in markQRAsScanned:", error);
    return false;
  }
}