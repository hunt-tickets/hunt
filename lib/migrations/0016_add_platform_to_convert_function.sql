-- Migration: Add platform parameter to convert_reservation_to_order function
-- Purpose: Allow specifying the platform (web/app/cash) when converting a reservation to an order
-- This fixes the error: column "platform" is of type order_from but expression is of type text

CREATE OR REPLACE FUNCTION convert_reservation_to_order(
  p_reservation_id UUID,
  p_payment_session_id TEXT DEFAULT NULL,
  p_platform order_from DEFAULT 'web'
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

  -- Create order with platform
  INSERT INTO orders (
    user_id,
    event_id,
    total_amount,
    service_fee,
    payment_status,
    payment_session_id,
    platform,
    created_at,
    paid_at
  ) VALUES (
    v_reservation.user_id,
    v_reservation.event_id,
    v_reservation.total_amount,
    0, -- Calculate service fee if needed (e.g., total_amount * 0.05)
    'paid',
    COALESCE(p_payment_session_id, v_reservation.payment_session_id),
    p_platform,
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

    -- Create individual tickets with unique QR codes and platform
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
        platform,
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
        p_platform,
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

-- Update function comment
COMMENT ON FUNCTION convert_reservation_to_order IS
'Convert paid reservation to order with tickets. Called by payment webhook after successful payment. Atomically moves inventory from reserved to sold. Idempotent: safe to call multiple times. Accepts platform parameter (web/app/cash) for tracking order source.';
