-- Migration: Add event_day_id to get_ticket_availability_v2
-- Purpose: Include event_day_id in ticket availability response for multi-day event support

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
  is_sold_out BOOLEAN,
  event_day_id UUID  -- NEW: Link to specific day (null = all days pass)
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
    rc.reserved_count,
    (tt.capacity - tt.sold_count - rc.reserved_count) AS available,
    tt.min_per_order,
    tt.max_per_order,
    tt.sale_start,
    tt.sale_end,
    (
      (tt.capacity - tt.sold_count - rc.reserved_count) > 0
      AND (tt.sale_start IS NULL OR NOW() >= tt.sale_start)
      AND (tt.sale_end IS NULL OR NOW() <= tt.sale_end)
    ) AS is_available,
    ((tt.capacity - tt.sold_count - rc.reserved_count) = 0) AS is_sold_out,
    tt.event_day_id  -- NEW: Include day association

  FROM ticket_types tt

  LEFT JOIN LATERAL (
    SELECT COALESCE(SUM(ri.quantity)::INT, 0) AS reserved_count
    FROM reservation_items ri
    JOIN reservations r ON r.id = ri.reservation_id
    WHERE ri.ticket_type_id = tt.id
      AND r.status = 'active'
      AND r.expires_at > NOW()
  ) rc ON true

  WHERE tt.event_id = p_event_id
    AND tt.active = TRUE
  ORDER BY tt.price ASC, tt.name ASC;
END;
$$;

COMMENT ON FUNCTION get_ticket_availability_v2 IS
'Returns ticket availability for an event including event_day_id for multi-day event support. Uses LATERAL join for optimized reserved count calculation.';
