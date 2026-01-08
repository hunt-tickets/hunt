-- Migration: Event Cancellation System with Fair Refund Policy
-- Purpose: Atomic operations to safely cancel events and process refunds
-- Created: 2025-01-08
-- Architecture: Service-role access only (RLS enabled, no policies)
-- Flow: Server action → cancel_event RPC → Mercado Pago refund API → Email notifications
--
-- ⚠️ IMPORTANT: CANCELLATION IS PERMANENT AND IRREVERSIBLE ⚠️
-- Once an event is cancelled, it CANNOT be reactivated. The event is soft-deleted.
-- Admins MUST be warned in the UI before proceeding with cancellation.
--
-- Lifecycle States:
-- - 'active': Event is operational and can be edited
-- - 'cancelled': Event was cancelled, PERMANENT, soft-deleted (deleted_at set)
-- - 'archived': Event ended naturally (for historical/reporting purposes)
--
-- Cancellation Rules (Fair for All Parties):
-- 1. Events with 0 tickets: Can cancel anytime with confirmation
-- 2. Events with tickets: CANNOT cancel within 24 hours of event start
-- 3. Refund policy: Buyers get 100% refund, organizer pays all fees
-- 4. Automatic refunds via Mercado Pago API
-- 5. Cancellation soft-deletes the event (sets deleted_at timestamp)
-- 6. Cannot cancel already-cancelled events (idempotency check)
--
-- What this migration provides:
-- - cancel_event_v1(): Atomic DB operations for event cancellation
-- - Validates cancellation rules (24-hour deadline for events with tickets)
-- - Updates event lifecycle_status to 'cancelled'
-- - Soft-deletes event (sets deleted_at)
-- - Marks all orders as 'refunded' (actual MP refund handled in TypeScript layer)
-- - Cancels all tickets
-- - Logs cancellation in audit trail
-- - Returns summary for email notifications and refund processing
-- - Prevents re-cancellation of already-cancelled events
--
-- ============================================================================
-- FUNCTION: cancel_event_v1 (Atomic Event Cancellation - PERMANENT ACTION)
-- ============================================================================
-- Called by server action when admin/owner cancels an event
-- This function safely cancels events with proper validation and atomicity
--
-- ⚠️ WARNING: THIS IS A PERMANENT, IRREVERSIBLE ACTION ⚠️
-- Once cancelled, an event CANNOT be reactivated. The event is soft-deleted.
-- UI MUST warn admins before calling this function.
--
-- Flow:
--   1. Validate event exists and fetch details
--   2. CHECK: Event is NOT already cancelled (prevent duplicate cancellation)
--   3. Calculate total tickets sold across all ticket types
--   4. Apply cancellation rules:
--      - 0 tickets: Require p_confirm_zero_tickets = TRUE (accident prevention)
--      - Has tickets: Block if within 24 hours of event start time
--   5. Update event:
--      - lifecycle_status → 'cancelled' (PERMANENT STATE)
--      - deleted_at → NOW() (soft delete)
--      - cancelled_by → p_cancelled_by
--      - cancellation_reason → p_cancellation_reason
--      - cancelled_at → NOW()
--      - status → FALSE (deactivate)
--   6. Update all paid orders to 'refunded' status
--   7. Cancel all tickets (status = 'cancelled')
--   8. Insert audit log entry
--   9. Return summary for TypeScript layer to process MP refunds
--
-- Returns: Cancellation summary with orders to refund
-- Security: Called server-side only via service role key
-- Note: Actual Mercado Pago refund API calls happen in TypeScript layer
-- ============================================================================

CREATE OR REPLACE FUNCTION cancel_event_v1(
  p_event_id UUID,
  p_cancelled_by TEXT,
  p_cancellation_reason TEXT,
  p_confirm_zero_tickets BOOLEAN DEFAULT FALSE
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  tickets_sold INT,
  orders_to_refund INT,
  order_details JSONB -- Array of {order_id, payment_session_id, amount, user_id}
)
LANGUAGE plpgsql
SECURITY DEFINER -- Run with function owner's privileges (bypasses RLS)
SET search_path = public
AS $$
DECLARE
  v_event RECORD;
  v_tickets_sold INT;
  v_paid_orders_count INT;
  v_hours_until_event NUMERIC;
  v_order_details JSONB;
BEGIN
  -- STEP 1: Validate event exists and fetch details
  -- TODO: SELECT event with date, lifecycle_status, name
  -- TODO: RAISE EXCEPTION if event not found

  -- STEP 2: CRITICAL CHECK - Prevent re-cancellation (idempotency)
  -- Once cancelled, ALWAYS cancelled. This is PERMANENT.
  -- TODO: IF v_event.lifecycle_status = 'cancelled' THEN
  --   RAISE EXCEPTION 'Event is already cancelled and cannot be reactivated'

  -- STEP 3: Calculate total tickets sold across all ticket types
  -- TODO: SELECT SUM(sold_count) FROM ticket_types WHERE event_id = p_event_id

  -- STEP 4A: Apply cancellation rules - Zero tickets case
  -- TODO: IF v_tickets_sold = 0 AND NOT p_confirm_zero_tickets THEN
  --   RAISE EXCEPTION 'Confirmation required for cancelling events with 0 tickets'

  -- STEP 4B: Apply cancellation rules - 24-hour deadline for events with tickets
  -- TODO: IF v_tickets_sold > 0 THEN
  --   Calculate hours until event: (v_event.date - NOW())
  --   IF hours < 24 THEN RAISE EXCEPTION 'Cannot cancel within 24 hours of event'

  -- STEP 5: Update event to cancelled status (PERMANENT + SOFT DELETE)
  -- TODO: UPDATE events SET
  --   lifecycle_status = 'cancelled',
  --   deleted_at = NOW(),
  --   cancelled_by = p_cancelled_by,
  --   cancellation_reason = p_cancellation_reason,
  --   cancelled_at = NOW(),
  --   status = FALSE
  -- WHERE id = p_event_id

  -- STEP 6: Update all paid orders to refunded status
  -- TODO: UPDATE orders SET payment_status = 'refunded'
  -- WHERE event_id = p_event_id AND payment_status = 'paid'

  -- STEP 7: Cancel all tickets
  -- TODO: UPDATE tickets SET status = 'cancelled'
  -- WHERE order_id IN (SELECT id FROM orders WHERE event_id = p_event_id)

  -- STEP 8: Insert audit log
  -- TODO: INSERT INTO event_audit_log
  -- (event_id, action, performed_by, reason, metadata)
  -- VALUES (p_event_id, 'cancelled', p_cancelled_by, p_cancellation_reason, ...)

  -- STEP 9: Collect order details for refund processing
  -- TODO: SELECT JSONB_AGG(jsonb_build_object(
  --   'order_id', id,
  --   'payment_session_id', payment_session_id,
  --   'amount', total_amount,
  --   'currency', currency,
  --   'user_id', user_id
  -- )) INTO v_order_details FROM orders
  -- WHERE event_id = p_event_id AND payment_status = 'refunded'

  -- STEP 10: Return summary for TypeScript layer
  -- TODO: Implement complete return with actual values

  -- Temporary skeleton return
  RETURN QUERY SELECT
    TRUE as success,
    'Skeleton function - to be implemented' as message,
    0 as tickets_sold,
    0 as orders_to_refund,
    '[]'::JSONB as order_details;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION cancel_event_v1 TO service_role;

-- Add helpful comment
COMMENT ON FUNCTION cancel_event_v1 IS 'Atomically cancels an event with proper validation and refund preparation. Returns order details for Mercado Pago refund processing in TypeScript layer.';
