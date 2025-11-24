-- Migration: High-Concurrency Ticketing Functions
-- Purpose: Atomic operations to handle concurrent ticket purchases safely
-- Created: 2025-11-24
-- Architecture: Service-role access only (RLS enabled, no policies)
-- Flow: Client cart → Checkout button → Create reservation (this migration) → Payment → Order

-- ============================================================================
-- FUNCTION 1: create_reservation (Atomic Ticket Hold)
-- ============================================================================
-- Called when user clicks "Checkout" button with items in their cart.
-- This function safely reserves tickets under high concurrency using row-level
-- locks with FOR UPDATE to prevent race conditions and double-selling.
--
-- Flow:
--   1. Validate user, event, and items
--   2. Lock ticket_types rows (FOR UPDATE to prevent concurrent modifications)
--   3. Check availability: capacity - sold_count - reserved_count >= quantity
--   4. Atomically increment reserved_count
--   5. Create reservation record with configurable expiry (default 10 minutes)
--   6. Create reservation_items linking to ticket types
--
-- Returns: reservation details (id, expires_at, total_amount)
-- Security: Called server-side only via service role key
-- ============================================================================

CREATE OR REPLACE FUNCTION create_reservation(
  p_user_id TEXT,
  p_event_id UUID,
  p_items JSONB, -- Array of {ticket_type_id: uuid, quantity: int}
  p_payment_processor TEXT DEFAULT NULL,
  p_expiry_minutes INT DEFAULT 10
)
RETURNS TABLE(
  reservation_id UUID,
  expires_at TIMESTAMPTZ,
  total_amount NUMERIC(10, 2)
)
LANGUAGE plpgsql
SECURITY DEFINER -- Run with function owner's privileges (bypasses RLS)
SET search_path = public
AS $$
DECLARE
  v_reservation_id UUID;
  v_expires_at TIMESTAMPTZ;
  v_total_amount NUMERIC(10, 2) := 0;
  v_item JSONB;
  v_ticket_type_id UUID;
  v_quantity INT;
  v_price NUMERIC(10, 2);
  v_available INT;
  v_ticket_name TEXT;
  v_min_order INT;
  v_max_order INT;
BEGIN
  -- Calculate expiry time
  v_expires_at := NOW() + (p_expiry_minutes || ' minutes')::INTERVAL;

  -- Validate user exists
  IF NOT EXISTS (SELECT 1 FROM "user" WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User not found: %', p_user_id;
  END IF;

  -- Validate event exists and is active
  IF NOT EXISTS (SELECT 1 FROM events WHERE id = p_event_id AND status = TRUE) THEN
    RAISE EXCEPTION 'Event not found or inactive: %', p_event_id;
  END IF;

  -- Validate items array is not empty
  IF jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'No items provided for reservation';
  END IF;

  -- Create reservation record first
  INSERT INTO reservations (
    user_id,
    event_id,
    total_amount,
    expires_at,
    status,
    payment_processor,
    created_at
  ) VALUES (
    p_user_id,
    p_event_id,
    0, -- Will be updated after processing items
    v_expires_at,
    'active',
    p_payment_processor,
    NOW()
  )
  RETURNING id INTO v_reservation_id;

  -- Process each ticket type in the order
  -- Sort by ticket_type_id to prevent deadlocks when multiple users
  -- buy multiple ticket types from the same event simultaneously
  FOR v_item IN
    SELECT * FROM jsonb_array_elements(p_items)
    ORDER BY (value->>'ticket_type_id')::UUID
  LOOP
    -- Extract values from JSON
    v_ticket_type_id := (v_item->>'ticket_type_id')::UUID;
    v_quantity := (v_item->>'quantity')::INT;

    -- Validate quantity
    IF v_quantity <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity: % for ticket type %', v_quantity, v_ticket_type_id;
    END IF;

    -- Lock the ticket_type row and get current availability
    -- FOR UPDATE prevents other transactions from modifying this row
    -- This is the key to preventing race conditions!
    SELECT
      capacity - sold_count - reserved_count,
      price,
      name,
      min_per_order,
      max_per_order
    INTO
      v_available,
      v_price,
      v_ticket_name,
      v_min_order,
      v_max_order
    FROM ticket_types
    WHERE id = v_ticket_type_id AND event_id = p_event_id
    FOR UPDATE; -- Critical: locks the row until transaction commits

    -- Check if ticket type exists
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Ticket type not found: %', v_ticket_type_id;
    END IF;

    -- Validate quantity limits
    IF v_quantity < v_min_order THEN
      RAISE EXCEPTION 'Minimum order quantity for "%" is %', v_ticket_name, v_min_order;
    END IF;

    IF v_quantity > v_max_order THEN
      RAISE EXCEPTION 'Maximum order quantity for "%" is %', v_ticket_name, v_max_order;
    END IF;

    -- Check availability (this is checked AFTER the row is locked)
    IF v_available < v_quantity THEN
      -- Rollback will happen automatically due to exception
      RAISE EXCEPTION 'Insufficient tickets available for "%". Requested: %, Available: %',
        v_ticket_name, v_quantity, v_available;
    END IF;

    -- Check sale window
    IF EXISTS (
      SELECT 1 FROM ticket_types
      WHERE id = v_ticket_type_id
      AND (
        (sale_start IS NOT NULL AND NOW() < sale_start) OR
        (sale_end IS NOT NULL AND NOW() > sale_end)
      )
    ) THEN
      RAISE EXCEPTION 'Ticket type "%" is not available for sale at this time', v_ticket_name;
    END IF;

    -- Atomically increment reserved_count
    -- The CHECK constraint ensures this won't exceed capacity
    UPDATE ticket_types
    SET
      reserved_count = reserved_count + v_quantity,
      updated_at = NOW()
    WHERE id = v_ticket_type_id;

    -- Create reservation item
    INSERT INTO reservation_items (
      reservation_id,
      ticket_type_id,
      quantity,
      created_at
    ) VALUES (
      v_reservation_id,
      v_ticket_type_id,
      v_quantity,
      NOW()
    );

    -- Add to total amount
    v_total_amount := v_total_amount + (v_price * v_quantity);
  END LOOP;

  -- Update reservation with final total amount
  UPDATE reservations
  SET total_amount = v_total_amount
  WHERE id = v_reservation_id;

  -- Return reservation details
  RETURN QUERY
  SELECT v_reservation_id, v_expires_at, v_total_amount;
END;
$$;

-- ============================================================================
-- FUNCTION 2: convert_reservation_to_order (Payment Webhook Handler)
-- ============================================================================
-- Called by payment webhook after successful payment to atomically convert
-- a reservation into a completed order with tickets.
--
-- Flow:
--   1. Validate reservation exists and is active
--   2. Check idempotency (prevent duplicate order creation)
--   3. Create order record
--   4. Copy reservation_items to order_items
--   5. Create individual tickets with QR codes
--   6. Update ticket_types: decrement reserved_count, increment sold_count
--   7. Mark reservation as 'converted'
--
-- Returns: order_id and array of ticket IDs
-- Security: Called server-side only via service role key
-- Idempotency: Safe to call multiple times with same payment_session_id
-- ============================================================================

CREATE OR REPLACE FUNCTION convert_reservation_to_order(
  p_reservation_id UUID,
  p_payment_session_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  order_id UUID,
  ticket_ids UUID[]
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id UUID;
  v_reservation RECORD;
  v_item RECORD;
  v_ticket_ids UUID[] := ARRAY[]::UUID[];
  v_ticket_id UUID;
  v_i INT;
  v_price NUMERIC(10, 2);
  v_existing_order_id UUID;
BEGIN
  -- Lock and get reservation details
  SELECT *
  INTO v_reservation
  FROM reservations
  WHERE id = p_reservation_id
  FOR UPDATE;

  -- Validate reservation exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found: %', p_reservation_id;
  END IF;

  -- IDEMPOTENCY CHECK: If payment_session_id exists, check if order already created
  IF p_payment_session_id IS NOT NULL THEN
    SELECT id INTO v_existing_order_id
    FROM orders
    WHERE payment_session_id = p_payment_session_id
    LIMIT 1;

    -- If order exists, return it (idempotent)
    IF FOUND THEN
      SELECT COALESCE(array_agg(id), ARRAY[]::UUID[]) INTO v_ticket_ids
      FROM tickets
      WHERE order_id = v_existing_order_id;

      RETURN QUERY
      SELECT v_existing_order_id, v_ticket_ids;
      RETURN;
    END IF;
  END IF;

  -- Validate reservation status
  IF v_reservation.status = 'converted' THEN
    -- Reservation already converted, find and return existing order
    SELECT id INTO v_existing_order_id
    FROM orders
    WHERE user_id = v_reservation.user_id
      AND event_id = v_reservation.event_id
      AND payment_session_id = v_reservation.payment_session_id
    ORDER BY created_at DESC
    LIMIT 1;

    IF FOUND THEN
      SELECT COALESCE(array_agg(id), ARRAY[]::UUID[]) INTO v_ticket_ids
      FROM tickets
      WHERE order_id = v_existing_order_id;

      RETURN QUERY
      SELECT v_existing_order_id, v_ticket_ids;
      RETURN;
    END IF;
  END IF;

  IF v_reservation.status != 'active' THEN
    RAISE EXCEPTION 'Reservation is not active. Status: %', v_reservation.status;
  END IF;

  -- Check if reservation is expired
  IF v_reservation.expires_at < NOW() THEN
    RAISE EXCEPTION 'Reservation has expired at %', v_reservation.expires_at;
  END IF;

  -- Create order
  INSERT INTO orders (
    user_id,
    event_id,
    total_amount,
    service_fee,
    payment_status,
    payment_session_id,
    created_at,
    paid_at
  ) VALUES (
    v_reservation.user_id,
    v_reservation.event_id,
    v_reservation.total_amount,
    0, -- Calculate service fee if needed (e.g., total_amount * 0.05)
    'paid',
    COALESCE(p_payment_session_id, v_reservation.payment_session_id),
    NOW(),
    NOW()
  )
  RETURNING id INTO v_order_id;

  -- Process each reservation item
  FOR v_item IN
    SELECT * FROM reservation_items
    WHERE reservation_id = p_reservation_id
  LOOP
    -- Get ticket type price for order item
    SELECT price INTO v_price
    FROM ticket_types
    WHERE id = v_item.ticket_type_id;

    -- Create order item
    INSERT INTO order_items (
      order_id,
      ticket_type_id,
      quantity,
      price_per_ticket,
      subtotal,
      created_at
    ) VALUES (
      v_order_id,
      v_item.ticket_type_id,
      v_item.quantity,
      v_price,
      v_price * v_item.quantity,
      NOW()
    );

    -- Create individual tickets with unique QR codes
    FOR v_i IN 1..v_item.quantity
    LOOP
      -- Generate unique ticket ID
      v_ticket_id := gen_random_uuid();

      INSERT INTO tickets (
        id,
        order_id,
        reservation_id,
        ticket_type_id,
        user_id,
        qr_code,
        status,
        created_at
      ) VALUES (
        v_ticket_id,
        v_order_id,
        p_reservation_id,
        v_item.ticket_type_id,
        v_reservation.user_id,
        -- Generate secure QR code: SHA256 hash of ticket_id + user_id + timestamp
        encode(digest(v_ticket_id::TEXT || v_reservation.user_id || NOW()::TEXT, 'sha256'), 'hex'),
        'valid',
        NOW()
      );

      -- Add to ticket IDs array
      v_ticket_ids := array_append(v_ticket_ids, v_ticket_id);
    END LOOP;

    -- Atomically update ticket_types:
    -- - Decrement reserved_count
    -- - Increment sold_count
    -- This maintains the CHECK constraint: sold_count + reserved_count <= capacity
    UPDATE ticket_types
    SET
      reserved_count = reserved_count - v_item.quantity,
      sold_count = sold_count + v_item.quantity,
      updated_at = NOW()
    WHERE id = v_item.ticket_type_id;
  END LOOP;

  -- Mark reservation as converted
  UPDATE reservations
  SET status = 'converted'
  WHERE id = p_reservation_id;

  -- Return order details
  RETURN QUERY
  SELECT v_order_id, v_ticket_ids;
END;
$$;

-- ============================================================================
-- FUNCTION 3: expire_reservations (Cleanup Expired Holds)
-- ============================================================================
-- Called by a cron job (e.g., every 1-5 minutes) to release expired reservations
-- back to available inventory.
--
-- Flow:
--   1. Find all reservations with status='active' AND expires_at < NOW()
--   2. For each expired reservation:
--      - Decrement reserved_count on ticket_types
--      - Mark reservation as 'expired'
--
-- Returns: count of expired reservations and released tickets
-- Security: Called by cron job via API route with service role key
-- Concurrency: Uses SKIP LOCKED to prevent conflicts if multiple workers run
-- ============================================================================

CREATE OR REPLACE FUNCTION expire_reservations()
RETURNS TABLE(
  expired_count INT,
  released_tickets INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expired_count INT := 0;
  v_released_tickets INT := 0;
  v_reservation RECORD;
  v_item RECORD;
BEGIN
  -- Find and lock all expired active reservations
  FOR v_reservation IN
    SELECT id, user_id, event_id, expires_at
    FROM reservations
    WHERE status = 'active' AND expires_at < NOW()
    FOR UPDATE SKIP LOCKED -- Skip if another process is handling this
  LOOP
    -- Process each reservation item
    FOR v_item IN
      SELECT ticket_type_id, quantity
      FROM reservation_items
      WHERE reservation_id = v_reservation.id
    LOOP
      -- Atomically release the reserved tickets
      UPDATE ticket_types
      SET
        reserved_count = reserved_count - v_item.quantity,
        updated_at = NOW()
      WHERE id = v_item.ticket_type_id;

      v_released_tickets := v_released_tickets + v_item.quantity;
    END LOOP;

    -- Mark reservation as expired
    UPDATE reservations
    SET status = 'expired'
    WHERE id = v_reservation.id;

    v_expired_count := v_expired_count + 1;
  END LOOP;

  RETURN QUERY SELECT v_expired_count, v_released_tickets;
END;
$$;

-- ============================================================================
-- FUNCTION 4: cancel_reservation (User-Initiated Cancellation)
-- ============================================================================
-- Allows users to manually cancel their reservation before it expires or
-- before completing payment.
--
-- Security: Validates user_id to ensure users can only cancel their own reservations
-- ============================================================================

CREATE OR REPLACE FUNCTION cancel_reservation(
  p_reservation_id UUID,
  p_user_id TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation RECORD;
  v_item RECORD;
BEGIN
  -- Lock and get reservation
  SELECT *
  INTO v_reservation
  FROM reservations
  WHERE id = p_reservation_id AND user_id = p_user_id
  FOR UPDATE;

  -- Validate reservation exists and belongs to user
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reservation not found or unauthorized';
  END IF;

  -- Only allow cancelling active reservations
  IF v_reservation.status != 'active' THEN
    RAISE EXCEPTION 'Can only cancel active reservations. Current status: %', v_reservation.status;
  END IF;

  -- Release reserved tickets
  FOR v_item IN
    SELECT ticket_type_id, quantity
    FROM reservation_items
    WHERE reservation_id = p_reservation_id
  LOOP
    UPDATE ticket_types
    SET
      reserved_count = reserved_count - v_item.quantity,
      updated_at = NOW()
    WHERE id = v_item.ticket_type_id;
  END LOOP;

  -- Mark as cancelled
  UPDATE reservations
  SET status = 'cancelled'
  WHERE id = p_reservation_id;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- FUNCTION 5: get_ticket_availability (Real-time Availability Check)
-- ============================================================================
-- Returns current availability for all ticket types of an event.
-- This is safe to call frequently as it only reads data (no locks needed).
--
-- Returns: Detailed availability info including computed 'available' count
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
    tt.reserved_count,
    (tt.capacity - tt.sold_count - tt.reserved_count) AS available,
    tt.min_per_order,
    tt.max_per_order,
    tt.sale_start,
    tt.sale_end,
    (
      tt.capacity - tt.sold_count - tt.reserved_count > 0 AND
      (tt.sale_start IS NULL OR NOW() >= tt.sale_start) AND
      (tt.sale_end IS NULL OR NOW() <= tt.sale_end)
    ) AS is_available,
    (tt.capacity - tt.sold_count - tt.reserved_count = 0) AS is_sold_out
  FROM ticket_types tt
  WHERE tt.event_id = p_event_id
  ORDER BY tt.price ASC, tt.name ASC;
END;
$$;

-- ============================================================================
-- FUNCTION 6: refund_order (Handle Refunds)
-- ============================================================================
-- Atomically process refunds and return tickets to inventory.
-- This should be called AFTER processing the refund with the payment provider.
--
-- Flow:
--   1. Validate order is paid
--   2. Mark all tickets as cancelled
--   3. Decrement sold_count (return to available inventory)
--   4. Mark order as refunded
--
-- Note: Does NOT process payment refund - that should be done separately
-- ============================================================================

CREATE OR REPLACE FUNCTION refund_order(
  p_order_id UUID,
  p_refund_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
BEGIN
  -- Lock order
  SELECT *
  INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  IF v_order.payment_status != 'paid' THEN
    RAISE EXCEPTION 'Can only refund paid orders. Current status: %', v_order.payment_status;
  END IF;

  -- Mark all tickets as cancelled
  UPDATE tickets
  SET status = 'cancelled'
  WHERE order_id = p_order_id AND status != 'cancelled';

  -- Return tickets to inventory (decrement sold_count)
  FOR v_item IN
    SELECT ticket_type_id, quantity
    FROM order_items
    WHERE order_id = p_order_id
  LOOP
    UPDATE ticket_types
    SET
      sold_count = sold_count - v_item.quantity,
      updated_at = NOW()
    WHERE id = v_item.ticket_type_id;
  END LOOP;

  -- Mark order as refunded
  UPDATE orders
  SET payment_status = 'refunded'
  WHERE id = p_order_id;

  RETURN TRUE;
END;
$$;

-- ============================================================================
-- FUNCTION 7: get_user_reservations (User's Active/Pending Reservations)
-- ============================================================================
-- Get all active reservations for a user (useful for "My Cart" view in checkout)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_reservations(
  p_user_id TEXT,
  p_status TEXT DEFAULT 'active'
)
RETURNS TABLE(
  reservation_id UUID,
  event_id UUID,
  event_name TEXT,
  total_amount NUMERIC(10, 2),
  expires_at TIMESTAMPTZ,
  status TEXT,
  payment_session_id TEXT,
  created_at TIMESTAMPTZ,
  items JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id AS reservation_id,
    r.event_id,
    e.name AS event_name,
    r.total_amount,
    r.expires_at,
    r.status::TEXT,
    r.payment_session_id,
    r.created_at,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'ticket_type_id', ri.ticket_type_id,
          'ticket_name', tt.name,
          'quantity', ri.quantity,
          'price', tt.price
        )
      )
      FROM reservation_items ri
      JOIN ticket_types tt ON tt.id = ri.ticket_type_id
      WHERE ri.reservation_id = r.id
    ) AS items
  FROM reservations r
  JOIN events e ON e.id = r.event_id
  WHERE r.user_id = p_user_id
    AND (p_status IS NULL OR r.status = p_status::reservation_status)
  ORDER BY r.created_at DESC;
END;
$$;

-- ============================================================================
-- INDEXES for Function Performance
-- ============================================================================

-- Composite index for active reservations expiry check (used by expire_reservations)
CREATE INDEX IF NOT EXISTS idx_reservations_status_expires
ON reservations(status, expires_at)
WHERE status = 'active';

-- Partial index for available ticket types (optimization for availability checks)
CREATE INDEX IF NOT EXISTS idx_ticket_types_availability
ON ticket_types(event_id, (capacity - sold_count - reserved_count))
WHERE (capacity - sold_count - reserved_count) > 0;

-- Index for user's active reservations
CREATE INDEX IF NOT EXISTS idx_reservations_user_status
ON reservations(user_id, status, created_at DESC);

-- Index for idempotency checks in convert_reservation_to_order
CREATE INDEX IF NOT EXISTS idx_orders_payment_session
ON orders(payment_session_id)
WHERE payment_session_id IS NOT NULL;

-- ============================================================================
-- FUNCTION COMMENTS (Documentation)
-- ============================================================================

COMMENT ON FUNCTION create_reservation IS
'Atomically reserve tickets with FOR UPDATE locking to prevent race conditions. Called when user clicks Checkout button. Returns reservation_id, expiry time, and total amount.';

COMMENT ON FUNCTION convert_reservation_to_order IS
'Convert paid reservation to order with tickets. Called by payment webhook after successful payment. Atomically moves inventory from reserved to sold. Idempotent: safe to call multiple times.';

COMMENT ON FUNCTION expire_reservations IS
'Cleanup function to expire abandoned reservations and return tickets to available inventory. Should be called by cron job every 1-5 minutes via API route.';

COMMENT ON FUNCTION cancel_reservation IS
'User-initiated reservation cancellation. Validates user ownership and returns tickets to available inventory. Only works on active reservations.';

COMMENT ON FUNCTION get_ticket_availability IS
'Get real-time availability for all ticket types of an event. Accounts for sold and reserved counts. Safe to call frequently (read-only).';

COMMENT ON FUNCTION refund_order IS
'Process order refund and return tickets to inventory. Updates sold_count and ticket status. Should be called AFTER processing payment refund with provider.';

COMMENT ON FUNCTION get_user_reservations IS
'Get user reservations with full details including items. Useful for checkout confirmation views.';

-- ============================================================================
-- Grant execute permissions (via service role in practice)
-- ============================================================================
-- Make grants conditional to support non-Supabase Postgres instances

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    GRANT EXECUTE ON FUNCTION create_reservation TO authenticated;
    GRANT EXECUTE ON FUNCTION convert_reservation_to_order TO authenticated;
    GRANT EXECUTE ON FUNCTION expire_reservations TO authenticated;
    GRANT EXECUTE ON FUNCTION cancel_reservation TO authenticated;
    GRANT EXECUTE ON FUNCTION get_ticket_availability TO authenticated;
    GRANT EXECUTE ON FUNCTION refund_order TO authenticated;
    GRANT EXECUTE ON FUNCTION get_user_reservations TO authenticated;
  END IF;
END $$;
