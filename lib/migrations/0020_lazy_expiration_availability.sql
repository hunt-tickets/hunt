-- Migration: Update get_ticket_availability to use lazy expiration
-- Purpose: Calculate availability from actual reservation data, ignoring expired reservations
-- This ensures accuracy even if the cleanup cron hasn't run yet

-- ============================================================================
-- FUNCTION 5: get_ticket_availability (with Lazy Expiration)
-- ============================================================================
-- Returns current availability for all ticket types of an event.
-- Uses lazy expiration: only counts reservations where expires_at > NOW()
-- This ensures expired reservations don't block ticket availability.
-- ============================================================================

CREATE OR REPLACE FUNCTION get_ticket_availability(p_event_id UUID)
RETURNS TABLE(
  ticket_type_id UUID,
  ticket_name TEXT,
  description TEXT,
  price NUMERIC(10, 2),
  capacity INT,
  sold_count INT,
  reserved_count INT,
  available INT,
  min_per_order INT,
  max_per_order INT,
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  is_available BOOLEAN,
  is_sold_out BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tt.id AS ticket_type_id,
    tt.name AS ticket_name,
    tt.description,
    tt.price,
    tt.capacity,
    tt.sold_count,
    -- Calculate actual reserved count from active, non-expired reservations
    (
      SELECT COALESCE(SUM(ri.quantity)::INT, 0)
      FROM reservation_items ri
      JOIN reservations r ON r.id = ri.reservation_id
      WHERE ri.ticket_type_id = tt.id
      AND r.status = 'active'
      AND r.expires_at > NOW()
    ) AS reserved_count,
    -- Calculate available using lazy expiration
    (
      tt.capacity - tt.sold_count - (
        SELECT COALESCE(SUM(ri.quantity)::INT, 0)
        FROM reservation_items ri
        JOIN reservations r ON r.id = ri.reservation_id
        WHERE ri.ticket_type_id = tt.id
        AND r.status = 'active'
        AND r.expires_at > NOW()
      )
    ) AS available,
    tt.min_per_order,
    tt.max_per_order,
    tt.sale_start,
    tt.sale_end,
    (
      tt.capacity - tt.sold_count - (
        SELECT COALESCE(SUM(ri.quantity)::INT, 0)
        FROM reservation_items ri
        JOIN reservations r ON r.id = ri.reservation_id
        WHERE ri.ticket_type_id = tt.id
        AND r.status = 'active'
        AND r.expires_at > NOW()
      ) > 0 AND
      (tt.sale_start IS NULL OR NOW() >= tt.sale_start) AND
      (tt.sale_end IS NULL OR NOW() <= tt.sale_end)
    ) AS is_available,
    (
      tt.capacity - tt.sold_count - (
        SELECT COALESCE(SUM(ri.quantity)::INT, 0)
        FROM reservation_items ri
        JOIN reservations r ON r.id = ri.reservation_id
        WHERE ri.ticket_type_id = tt.id
        AND r.status = 'active'
        AND r.expires_at > NOW()
      ) = 0
    ) AS is_sold_out
  FROM ticket_types tt
  WHERE tt.event_id = p_event_id
  ORDER BY tt.price ASC, tt.name ASC;
END;
$$;

-- ============================================================================
-- Index to optimize the lazy expiration subquery
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_reservations_active_expires
ON reservations(status, expires_at)
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_reservation_items_ticket_type
ON reservation_items(ticket_type_id, reservation_id);

-- ============================================================================
-- Update function comment
-- ============================================================================

COMMENT ON FUNCTION get_ticket_availability IS
'Get real-time availability for all ticket types of an event. Uses lazy expiration: calculates reserved count from active reservations where expires_at > NOW(). This ensures accuracy even if cleanup cron has not run.';
