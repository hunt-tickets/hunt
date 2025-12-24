-- Migration: Optimized get_ticket_availability_v2
-- Purpose: Performance-optimized version of get_ticket_availability
--
-- Problem with v1:
--   The same correlated subquery (to count reserved tickets) runs 4 times per ticket type:
--   once for reserved_count, available, is_available, and is_sold_out.
--   For an event with N ticket types, this means 4N subquery executions.
--
-- Solution:
--   Use LEFT JOIN LATERAL to compute reserved_count once per ticket type,
--   then reuse that value for all derived columns.
--   This reduces subquery executions from 4N to N.
--
-- Note: Return type is identical to v1 - this is a drop-in replacement.

-- ============================================================================
-- FUNCTION: get_ticket_availability_v2 (Optimized with LATERAL)
-- ============================================================================
-- Returns current availability for all ticket types of an event.
--
-- Key features:
--   - Uses lazy expiration: only counts reservations where expires_at > NOW()
--   - Expired reservations don't block availability (no dependency on cleanup cron)
--   - LATERAL join computes reserved_count once per ticket type (4x fewer subqueries)
--
-- Parameters:
--   p_event_id: UUID of the event to get availability for
--
-- Returns: Table with availability info for each ticket type
-- ============================================================================

CREATE OR REPLACE FUNCTION get_ticket_availability_v2(p_event_id UUID)
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

    -- reserved_count: computed once in LATERAL, reused below
    rc.reserved_count,

    -- available: tickets that can still be purchased
    (tt.capacity - tt.sold_count - rc.reserved_count) AS available,

    tt.min_per_order,
    tt.max_per_order,
    tt.sale_start,
    tt.sale_end,

    -- is_available: true if tickets remain AND we're within the sale window
    (
      (tt.capacity - tt.sold_count - rc.reserved_count) > 0
      AND (tt.sale_start IS NULL OR NOW() >= tt.sale_start)
      AND (tt.sale_end IS NULL OR NOW() <= tt.sale_end)
    ) AS is_available,

    -- is_sold_out: true if no tickets remain (regardless of sale window)
    ((tt.capacity - tt.sold_count - rc.reserved_count) = 0) AS is_sold_out

  FROM ticket_types tt

  -- ============================================================================
  -- LEFT JOIN LATERAL: Compute reserved_count once per ticket type
  -- ============================================================================
  -- LATERAL allows the subquery to reference tt.id from the outer query.
  -- Unlike a correlated subquery in SELECT, this runs exactly once per row.
  -- LEFT JOIN ensures we get results even for ticket types with no reservations.
  -- ON true: no additional join condition needed (filtering is inside the subquery).
  -- ============================================================================
  LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ri.quantity)::INT, 0) AS reserved_count
    FROM reservation_items ri
    JOIN reservations r ON r.id = ri.reservation_id
    WHERE ri.ticket_type_id = tt.id
      AND r.status = 'active'      -- only active reservations
      AND r.expires_at > NOW()     -- lazy expiration: ignore expired ones
  ) rc ON true

  WHERE tt.event_id = p_event_id
    AND tt.active = TRUE  -- exclude inactive ticket types
  ORDER BY tt.price ASC, tt.name ASC;
END;
$$;

-- ============================================================================
-- Function documentation
-- ============================================================================

COMMENT ON FUNCTION get_ticket_availability_v2 IS
'Optimized version of get_ticket_availability. Uses LATERAL join to compute reserved_count once per ticket type instead of 4 times. Returns identical results to v1 with better performance at scale.';
