-- Add tax withholding parameters to convert_reservation_to_order function
-- This updates the function to accept and store Colombian tax withholdings

CREATE OR REPLACE FUNCTION convert_reservation_to_order(
  p_reservation_id UUID,
  p_payment_session_id TEXT DEFAULT NULL,
  p_platform order_from DEFAULT 'web',
  p_currency TEXT DEFAULT 'COP',
  p_marketplace_fee NUMERIC(10, 2) DEFAULT 0,
  p_processor_fee NUMERIC(10, 2) DEFAULT 0,
  p_sold_by TEXT DEFAULT NULL,
  p_tax_withholding_ica NUMERIC(10, 2) DEFAULT 0,
  p_tax_withholding_fuente NUMERIC(10, 2) DEFAULT 0
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
    SELECT *
    INTO v_reservation
    FROM reservations
    WHERE id = p_reservation_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Reservation not found: %', p_reservation_id;
    END IF;

    IF p_payment_session_id IS NOT NULL THEN
      SELECT id INTO v_existing_order_id
      FROM orders
      WHERE payment_session_id = p_payment_session_id
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

    IF v_reservation.status = 'converted' THEN
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

    IF v_reservation.expires_at < NOW() THEN
      RAISE EXCEPTION 'Reservation has expired at %', v_reservation.expires_at;
    END IF;

    -- Updated INSERT to include tax withholdings
    INSERT INTO orders (
      user_id,
      event_id,
      total_amount,
      currency,
      marketplace_fee,
      processor_fee,
      tax_withholding_ica,
      tax_withholding_fuente,
      payment_status,
      payment_session_id,
      platform,
      sold_by,
      created_at,
      paid_at
    ) VALUES (
      v_reservation.user_id,
      v_reservation.event_id,
      v_reservation.total_amount,
      p_currency,
      p_marketplace_fee,
      p_processor_fee,
      p_tax_withholding_ica,
      p_tax_withholding_fuente,
      'paid',
      COALESCE(p_payment_session_id, v_reservation.payment_session_id),
      p_platform,
      p_sold_by,
      NOW(),
      NOW()
    )
    RETURNING id INTO v_order_id;

    FOR v_item IN
      SELECT * FROM reservation_items
      WHERE reservation_id = p_reservation_id
    LOOP
      SELECT price INTO v_price
      FROM ticket_types
      WHERE id = v_item.ticket_type_id;

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

      FOR v_i IN 1..v_item.quantity
      LOOP
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
          encode(extensions.digest((v_ticket_id::TEXT || v_reservation.user_id || NOW()::TEXT)::bytea, 'sha256'), 'hex'),
          'valid',
          p_platform,
          NOW()
        );

        v_ticket_ids := array_append(v_ticket_ids, v_ticket_id);
      END LOOP;

      UPDATE ticket_types
      SET
        sold_count = sold_count + v_item.quantity,
        updated_at = NOW()
      WHERE id = v_item.ticket_type_id;
    END LOOP;

    UPDATE reservations
    SET status = 'converted'
    WHERE id = p_reservation_id;

    RETURN QUERY
    SELECT v_order_id, v_ticket_ids;
  END;
$$;
