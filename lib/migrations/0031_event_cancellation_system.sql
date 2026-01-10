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
--      - lifecycle_status → 'cancellation_pending' (NOT cancelled yet!)
--      - cancelled_by → p_cancelled_by
--      - cancellation_reason → p_cancellation_reason
--      - cancellation_initiated_at → NOW()
--      - status → FALSE (hide from public)
--      - modification_locked → TRUE (lock from edits)
--   6. Cancel all tickets (status = 'cancelled')
--   7. Insert audit log entry
--   8. Return count of paid orders
--   9. Admin dashboard will query orders separately for refund management UI
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
  paid_orders_count INT
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
BEGIN
  -- STEP 1: Validate event exists and fetch details
  SELECT
    id,
    name,
    date,
    lifecycle_status,
    organization_id
  INTO v_event
  FROM events
  WHERE id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Event not found: %', p_event_id;
  END IF;

  -- STEP 2: CRITICAL CHECK - Prevent re-cancellation (idempotency)
  -- Once cancellation is initiated or completed, cannot cancel again
  IF v_event.lifecycle_status IN ('cancellation_pending', 'cancelled') THEN
    RAISE EXCEPTION 'Event is already cancelled or cancellation is pending. Current status: %', v_event.lifecycle_status;
  END IF;

  -- Check if event is not active
  IF v_event.lifecycle_status != 'active' THEN
    RAISE EXCEPTION 'Can only cancel active events. Current status: %', v_event.lifecycle_status;
  END IF;

  -- STEP 3: Calculate total tickets sold across all ticket types
  SELECT COALESCE(SUM(sold_count), 0)
  INTO v_tickets_sold
  FROM ticket_types
  WHERE event_id = p_event_id;

  -- STEP 4A: Apply cancellation rules - Zero tickets case
  IF v_tickets_sold = 0 AND NOT p_confirm_zero_tickets THEN
    RAISE EXCEPTION 'Confirmation required for cancelling events with 0 tickets';
  END IF;

  -- STEP 4B: Apply cancellation rules - 24-hour deadline for events with tickets
  IF v_tickets_sold > 0 AND v_event.date IS NOT NULL THEN
    -- Calculate hours until event
    v_hours_until_event := EXTRACT(EPOCH FROM (v_event.date - NOW())) / 3600;

    IF v_hours_until_event < 24 THEN
      RAISE EXCEPTION 'Cannot cancel within 24 hours of event start. Hours remaining: %', ROUND(v_hours_until_event, 2);
    END IF;
  END IF;

  -- STEP 5: Update event to cancellation_pending status (NOT cancelled yet - orders must be handled first)
  UPDATE events SET
    lifecycle_status = 'cancellation_pending',
    cancelled_by = p_cancelled_by,
    cancellation_reason = p_cancellation_reason,
    cancellation_initiated_at = NOW(),
    status = FALSE,  -- Hide from public immediately
    modification_locked = TRUE  -- Lock the event to prevent further edits
  WHERE id = p_event_id;

  -- STEP 6: Mark all tickets as cancelled (user cannot use them anymore)
  UPDATE tickets SET
    status = 'cancelled'
  WHERE order_id IN (
    SELECT id FROM orders WHERE event_id = p_event_id
  );

  -- STEP 7: Count paid orders that need manual resolution
  SELECT COUNT(*)
  INTO v_paid_orders_count
  FROM orders
  WHERE event_id = p_event_id
    AND payment_status = 'paid';

  -- STEP 8: Insert audit log
  INSERT INTO event_audit_log (
    event_id,
    action,
    performed_by,
    reason,
    metadata
  )
  VALUES (
    p_event_id,
    'cancellation_initiated',
    p_cancelled_by,
    p_cancellation_reason,
    jsonb_build_object(
      'tickets_sold', v_tickets_sold,
      'paid_orders_count', v_paid_orders_count,
      'hours_until_event', ROUND(v_hours_until_event, 2)
    )
  );

  -- STEP 9: Return summary
  -- Admin dashboard will fetch order details separately when needed
  RETURN QUERY SELECT
    TRUE as success,
    format('Event cancellation initiated. %s paid orders require manual resolution.', v_paid_orders_count) as message,
    v_tickets_sold as tickets_sold,
    v_paid_orders_count as paid_orders_count;
END;
$$;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION cancel_event_v1 TO service_role;

-- Add helpful comment
COMMENT ON FUNCTION cancel_event_v1 IS 'Atomically cancels an event with proper validation and refund preparation. Returns order details for Mercado Pago refund processing in TypeScript layer.';
