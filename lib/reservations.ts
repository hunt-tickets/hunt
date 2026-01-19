/**
 * Reservation & Ticketing System for Mercado Pago
 *
 * This module provides high-level functions for the ticketing system that handle
 * concurrent ticket purchases safely using atomic PostgreSQL functions.
 *
 * Architecture:
 * - Client cart stored in localStorage/React state (no DB writes during browsing)
 * - Reservation created ONLY when user clicks "Checkout" button
 * - 5-minute timer starts at checkout
 * - Mercado Pago webhook converts reservation → order + tickets
 * - Cron job expires abandoned reservations
 *
 * Usage:
 * - All functions use Supabase RPC to call PostgreSQL functions
 * - Functions use the server client (with secret key for elevated privileges)
 */

import { createClient } from "@/lib/supabase/server";

// ============================================================================
// Types
// ============================================================================

export interface CartItem {
  ticket_type_id: string;
  quantity: number;
}

export interface ReservationResult {
  reservation_id: string;
  expires_at: string;
  total_amount: number;
}

export interface OrderResult {
  order_id: string;
  ticket_ids: string[];
}

export interface TicketAvailability {
  ticket_type_id: string;
  ticket_name: string;
  description: string | null;
  price: number;
  capacity: number;
  sold_count: number;
  reserved_count: number;
  available: number;
  min_per_order: number;
  max_per_order: number;
  sale_start: string | null;
  sale_end: string | null;
  is_available: boolean;
  is_sold_out: boolean;
}

export interface UserReservation {
  reservation_id: string;
  event_id: string;
  event_name: string;
  total_amount: number;
  expires_at: string;
  status: string;
  payment_session_id: string | null;
  created_at: string;
  items: Array<{
    ticket_type_id: string;
    ticket_name: string;
    quantity: number;
    price: number;
  }>;
}

export interface ExpiryResult {
  expired_count: number;
  released_tickets: number;
}

// ============================================================================
// FUNCTION 1: Create Reservation (Checkout)
// ============================================================================

/**
 * Create a reservation when user clicks "Checkout" button
 *
 * This function atomically:
 * 1. Validates cart items against current availability
 * 2. Locks inventory with FOR UPDATE
 * 3. Creates reservation with 5-minute expiry
 * 4. Increments reserved_count on ticket_types
 *
 * @param userId - Better Auth user ID
 * @param eventId - Event UUID
 * @param items - Array of cart items {ticket_type_id, quantity}
 * @param expiryMinutes - Expiry time in minutes (default: 5)
 * @returns Reservation details or throws error if insufficient tickets
 *
 * @throws Error if:
 * - User not found
 * - Event not found or inactive
 * - Insufficient tickets available
 * - Quantity exceeds min/max limits
 * - Sale window restrictions
 */
export async function createReservation(
  userId: string,
  eventId: string,
  items: CartItem[],
  expiryMinutes: number = 5
): Promise<ReservationResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.rpc("create_reservation_v2", {
      p_user_id: userId,
      p_event_id: eventId,
      p_items: items,
      p_payment_processor: "mercadopago",
      p_expiry_minutes: expiryMinutes,
    });

    if (error) {
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error("Failed to create reservation");
    }

    const result = data[0];
    return {
      reservation_id: result.reservation_id,
      expires_at: result.expires_at,
      total_amount: parseFloat(result.total_amount),
    };
  } catch (error) {
    // Parse PostgreSQL errors into user-friendly messages
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("Insufficient tickets available")) {
      const match = errorMessage.match(/Available: (\d+)/);
      const available = match ? match[1] : "0";
      throw new Error(`Solo quedan ${available} boletos disponibles`);
    }
    if (errorMessage.includes("not available for sale at this time")) {
      throw new Error("Estas entradas no están disponibles para la venta en este momento");
    }
    if (errorMessage.includes("Minimum order quantity")) {
      const cleanMsg = errorMessage.split("CONTEXT")[0].trim();
      throw new Error(cleanMsg);
    }
    if (errorMessage.includes("Maximum order quantity")) {
      const cleanMsg = errorMessage.split("CONTEXT")[0].trim();
      throw new Error(cleanMsg);
    }
    if (errorMessage.includes("Event not found or inactive")) {
      throw new Error("Evento no encontrado o no disponible");
    }

    // Re-throw original error if not handled
    throw error;
  }
}

// ============================================================================
// FUNCTION 2: Convert Reservation to Order (Payment Webhook)
// ============================================================================

/**
 * Convert paid reservation to order with tickets
 *
 * Called by Mercado Pago webhook after successful payment. This function:
 * 1. Checks idempotency (safe to call multiple times)
 * 2. Creates order record
 * 3. Creates order_items and individual tickets with QR codes
 * 4. Moves inventory from reserved → sold
 * 5. Marks reservation as 'converted'
 *
 * @param reservationId - Reservation UUID
 * @param paymentSessionId - Mercado Pago preference ID (for idempotency)
 * @param platform - Platform where purchase was made ('web' | 'app' | 'cash')
 * @returns Order details with ticket IDs
 *
 * @throws Error if:
 * - Reservation not found
 * - Reservation already converted
 * - Reservation expired
 */
export async function convertReservationToOrder(
  reservationId: string,
  paymentSessionId?: string,
  platform: "web" | "app" | "cash" = "web",
  currency: string = "COP",
  marketplaceFee: number = 0,
  processorFee: number = 0,
  soldBy?: string, // For cash sales: the seller who made the sale
  taxWithholdingIca: number = 0, // Colombian ICA tax withholding
  taxWithholdingFuente: number = 0 // Colombian Retención en la Fuente
): Promise<OrderResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("convert_reservation_to_order", {
    p_reservation_id: reservationId,
    p_payment_session_id: paymentSessionId || null,
    p_platform: platform,
    p_currency: currency,
    p_marketplace_fee: marketplaceFee,
    p_processor_fee: processorFee,
    p_sold_by: soldBy || null,
    p_tax_withholding_ica: taxWithholdingIca,
    p_tax_withholding_fuente: taxWithholdingFuente,
  });

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    throw new Error("Failed to convert reservation to order");
  }

  const result = data[0];

  return {
    order_id: result.order_id,
    ticket_ids: result.ticket_ids || [],
  };
}

// ============================================================================
// FUNCTION 3: Expire Reservations (Cron Job)
// ============================================================================

/**
 * Expire abandoned reservations and release tickets back to inventory
 *
 * This should be called by a cron job every 1-5 minutes.
 * Uses SKIP LOCKED to prevent conflicts if multiple workers run concurrently.
 *
 * @returns Count of expired reservations and released tickets
 */
export async function expireReservations(): Promise<ExpiryResult> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("expire_reservations");

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return { expired_count: 0, released_tickets: 0 };
  }

  const result = data[0];
  return {
    expired_count: parseInt(result.expired_count) || 0,
    released_tickets: parseInt(result.released_tickets) || 0,
  };
}

// ============================================================================
// FUNCTION 4: Cancel Reservation (User Action)
// ============================================================================

/**
 * User-initiated reservation cancellation
 *
 * Allows users to cancel their reservation before payment.
 * Validates user ownership to prevent unauthorized cancellations.
 *
 * @param reservationId - Reservation UUID
 * @param userId - Better Auth user ID (for authorization)
 * @returns true if successful
 *
 * @throws Error if:
 * - Reservation not found
 * - User doesn't own reservation
 * - Reservation not in 'active' status
 */
export async function cancelReservation(
  reservationId: string,
  userId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("cancel_reservation", {
    p_reservation_id: reservationId,
    p_user_id: userId,
  });

  if (error) {
    throw error;
  }

  return true;
}

// ============================================================================
// FUNCTION 5: Get Ticket Availability (Read-Only)
// ============================================================================

/**
 * Get current availability for all ticket types of an event
 *
 * Safe to call frequently (read-only, no locks).
 * Shows current availability accounting for sold and reserved tickets.
 * Note: This is a regular database query, NOT using Supabase Realtime subscriptions.
 * Data is refreshed on page load/navigation (SSR).
 *
 * @param eventId - Event UUID
 * @returns Array of ticket types with availability details
 */
export async function getTicketAvailability(
  eventId: string
): Promise<TicketAvailability[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_ticket_availability_v2", {
    p_event_id: eventId,
  });

  if (error) {
    throw error;
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    ticket_type_id: row.ticket_type_id as string,
    ticket_name: row.ticket_name as string,
    description: row.description as string | null,
    price: parseFloat(String(row.price)),
    capacity: parseInt(String(row.capacity)),
    sold_count: parseInt(String(row.sold_count)),
    reserved_count: parseInt(String(row.reserved_count)),
    available: parseInt(String(row.available)),
    min_per_order: parseInt(String(row.min_per_order)),
    max_per_order: parseInt(String(row.max_per_order)),
    sale_start: row.sale_start as string | null,
    sale_end: row.sale_end as string | null,
    is_available: row.is_available as boolean,
    is_sold_out: row.is_sold_out as boolean,
  }));
}

// ============================================================================
// FUNCTION 6: Refund Order
// ============================================================================

/**
 * Process order refund and return tickets to inventory
 *
 * This should be called AFTER processing the refund with Mercado Pago.
 * Atomically:
 * 1. Marks tickets as 'cancelled'
 * 2. Decrements sold_count
 * 3. Marks order as 'refunded'
 *
 * @param orderId - Order UUID
 * @param refundReason - Optional reason for refund
 * @returns true if successful
 *
 * @throws Error if order not found or not in 'paid' status
 */
export async function refundOrder(
  orderId: string,
  refundReason?: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase.rpc("refund_order", {
    p_order_id: orderId,
    p_refund_reason: refundReason || null,
  });

  if (error) {
    throw error;
  }

  return true;
}

// ============================================================================
// FUNCTION 7: Get User Reservations
// ============================================================================

/**
 * Get user's reservations (for checkout confirmation view)
 *
 * @param userId - Better Auth user ID
 * @param status - Filter by status ('active', 'expired', 'converted', 'cancelled')
 * @returns Array of reservations with items
 */
export async function getUserReservations(
  userId: string,
  status: "active" | "expired" | "converted" | "cancelled" | null = "active"
): Promise<UserReservation[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc("get_user_reservations", {
    p_user_id: userId,
    p_status: status,
  });

  if (error) {
    throw error;
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    reservation_id: row.reservation_id as string,
    event_id: row.event_id as string,
    event_name: row.event_name as string,
    total_amount: parseFloat(String(row.total_amount)),
    expires_at: row.expires_at as string,
    status: row.status as string,
    payment_session_id: row.payment_session_id as string | null,
    created_at: row.created_at as string,
    items: (row.items || []) as Array<{
      ticket_type_id: string;
      ticket_name: string;
      quantity: number;
      price: number;
    }>,
  }));
}
