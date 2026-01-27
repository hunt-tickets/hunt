- Acceso a creacion de Organizaciones tiene que ser restringido (Book a demo)
- Webhook para facturacion
- Scanner
<!-- - Terminar event_days y Events
- Palcos, silla enum.
- Programa de referidos
- apple wallet -->
- Analytics de ruta de eventos (organizaciones)
- reembolsos con Oscar
- en /entradas hacer que salga el card del evento en vez del nombre, y al presionar salen todos los tiquetes comprados de ese tipo de evento
- tracking de comisiones a los vendedores en el tab de Vendedores

**** OPTIMIZE IMAGES AND BANDWITH TRANSFER (USE THE IMAGE COMPONENT (NEXTJS) AND THE CUSTOM SUPABASE LOADER)
SUPABASE TRANSFORMATIONS COUNT ONLY 1 PER IMAGE, NO MATTER THE DIFFERENT TIMES ITS TRANSFORMED DIFFERENTLY

RULES:
IMAGE TRANSFORMATIONS DONE WITH NEXTJS LOADER (GENERATES A URL SO THAT SUPABASE CAN MAKE THE TRANSFORMATION IN THE CDN AND CACHE THE IMAGE)
ALL COMMUNICATION WITH SUPABASE SERVER, EXCEPT PUBLIC IMAGES/FILES SHOULD BE DONE VIA THE SERVER, TO AVOID LEAKING ANON_KEY 


Notes
<!-- 41.1.1. Advantages of Using PL/pgSQL
SQL is the language PostgreSQL and most other relational databases use as query language. It's portable and easy to learn. But every SQL statement must be executed individually by the database server.

That means that your client application must send each query to the database server, wait for it to be processed, receive and process the results, do some computation, then send further queries to the server. All this incurs interprocess communication and will also incur network overhead if your client is on a different machine than the database server.

With PL/pgSQL you can group a block of computation and a series of queries inside the database server, thus having the power of a procedural language and the ease of use of SQL, but with considerable savings of client/server communication overhead.

Extra round trips between client and server are eliminated

Intermediate results that the client does not need do not have to be marshaled or transferred between server and client

Multiple rounds of query parsing can be avoided

This can result in a considerable performance increase as compared to an application that does not use stored functions.

Also, with PL/pgSQL you can use all the data types, operators and functions of SQL. -->


<!-- DECLARE
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

    INSERT INTO orders (
      user_id,
      event_id,
      total_amount,
      currency,
      marketplace_fee,
      processor_fee,
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
  END; -->


base64 converts binary to text
i.e.: Base64 encoded: 500 KB image = 667 KB in database (+33% larger!)                                                                                                                     
Format: "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQ..."       
 Base64 converts binary to text:                                                                                                                                                      
  Binary:    [0xFF, 0xD8, 0xFF]  (3 bytes)                                                                                                                                             
             ↓ Convert to Base64                                                                                                                                                       
  Base64:    "/9j/"              (4 characters)                                                                                                                                        
                                                                                                                                                                                       
  Every 3 bytes becomes 4 characters = 33% size increase   

  saving base64 in a sql table is not efficient since to qeury a row, the entire row must be searched and loaded to memory                                                                                                               

   Database Architecture:                                                                                                                                                               
  ┌─────────────────────────────────────────┐                                                                                                                                          
  │  PostgreSQL                             │                                                                                                                                          
  │                                         │                                                                                                                                          
  │  Table: users                           │                                                                                                                                          
  │  ┌─────────────────────────────────┐   │                                                                                                                                           
  │  │ Row 1:                          │   │                                                                                                                                           
  │  │ ├─ id: 1                        │   │                                                                                                                                           
  │  │ ├─ name: "John"                 │   │                                                                                                                                           
  │  │ └─ avatar: "/9j/4AAQSkZJ..."   │   │                                                                                                                                            
  │  │            (667 KB TEXT)        │   │                                                                                                                                           
  │  │                                 │   │                                                                                                                                           
  │  │ Problem: Entire row must be     │   │                                                                                                                                           
  │  │ loaded to query ANY field       │   │                                                                                                                                           
  │  └─────────────────────────────────┘   │                                                                                                                                           
  └─────────────────────────────────────────┘                                                                                                                                          
                                                 
 Real-World Example                                                                                                                                                                   
                                                                                                                                                                                       
  Scenario: Fetch user's email                                                                                                                                                         
                                                                                                                                                                                       
  With Base64 in Database:                                                                                                                                                             
  SELECT email FROM users WHERE id = 1;                                                                                                                                                
                                                                                                                                                                                       
  What PostgreSQL 
  does:                                                                                                                                                                
  1. Find row for user ID 1                                                                                                                                                            
  2. Load ENTIRE row into memory (including 667 KB avatar!)                                                                                                                            
  3. Extract just the 'email' field                                                                                                                                                    
  4. Return "john@example.com"                                                                                                                                                         
                                                                                                                                                                                       
  💀 Problem: Had to load 667 KB to get 20 bytes!                                                                                                                                      
                                                                                                                                                                                       
  With Object Storage:                                                                                                                                                                 
  SELECT email FROM users WHERE id = 1;                                                                                                                                                
                                                                                                                                                                                       
  What PostgreSQL does:                                                                                                                                                                
  1. Find row for user ID 1                                                                                                                                                            
  2. Load row (id, name, email, avatar_url)                                                                                                                                            
  3. Row size: ~100 bytes (just the URL string!)                                                                                                                                       
  4. Return "john@example.com"                                                                                                                                                         
                                                                                                                                                                                       
  ✅ Efficient: Only loaded 100 bytes!                                                                                                                                                 
                                                                                                                                                                                       
  ---                                       


  Base64 encoded images are typically 33% to 37% larger than the original binary file. 

This increase happens because Base64 converts binary data (8 bits per byte) into an ASCII string representation (6 bits per character, effectively using 8 bits to store them), resulting in roughly 4 bytes of text for every 3 bytes of original data. 


Generally no. Base64 will occupy more space than necessary to store those images. Depending on the size of your images and how frequently they’re accessed, it is generally not an optimal stress to put on the database.

You should store them on the file system or in something like Azure blob storage.


98
metaltyphoon
•
4y ago
To follow up on this, the only thing you store on your database is the URI of where the bytes are stored.

18

5 more replies
[deleted]
•
4y ago
Your probably better using a dedicated file storage like s3 or azure equivalent.

57

10 more replies
u/MrMasterplan avatar
MrMasterplan
•
4y ago
I’d keep it binary, but generally the idea is fine for small images. I’ve seen it done for avatars and icons. Just don’t go storing your photo collection like this.

39

1 more reply
u/StackedLasagna avatar
StackedLasagna
•
4y ago
I'd say that generally, you should store the images in the file system.

Create a folder structure that makes sense for you and then store the path of the file or the file name in the DB.