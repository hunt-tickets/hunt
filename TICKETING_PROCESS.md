# Ticketing System Architecture & Process Flow

**Generated:** 2025-11-24
**Purpose:** Complete documentation of the Hunt Tickets platform ticketing system

---

## 1. Data Model Overview

```
organizations → events → ticket_types
                   ↓
         reservations (cart holds)
                   ↓
         reservation_items
                   ↓
              orders (completed purchases)
                   ↓
            order_items + tickets (actual tickets)
```

---

## 2. The Complete Flow

### Phase 1: Event Setup

```sql
organization (producer/organizer)
  └─> events (concert, festival, etc.)
        └─> ticket_types (VIP, General, Palco, etc.)
              - price: NUMERIC(10,2)
              - capacity: INT
              - sold_count: INT (default 0)
              - reserved_count: INT (default 0)
              - min_per_order: INT (default 1)
              - max_per_order: INT (default 10)
              - sale_start/sale_end: TIMESTAMPTZ
```

**Key Constraint:**
```sql
CHECK (sold_count + reserved_count <= capacity)
```
This prevents overselling at the database level.

**Schema Location:** `lib/schema.ts:626-654`

---

### Phase 2: User Browses & Adds to Cart (Client-Side Only)

**User Journey:**
1. User visits `/eventos` → browses events (SSR)
2. Clicks event → sees ticket types with real-time availability
3. Selects quantity and adds to cart
4. Cart items stored in **client state only** (localStorage or React state)
5. User can continue browsing, modify cart, or proceed to checkout

**What happens in the database:**
- ✅ Client queries `ticket_types` table during SSR (read-only)
- ✅ Shows: `available = capacity - sold_count - reserved_count`
- ❌ **NO database writes** - cart lives entirely on the client
- ❌ **NO inventory locking** - tickets not reserved yet

**Implementation Details:**
- Page is server-rendered (RSC fetches ticket availability during SSR)
- Cart managed via client-side state (localStorage for persistence across sessions)
- No Supabase Realtime - availability refreshed on page navigation/reload
- User can browse for hours without affecting inventory

**Risk Consideration:**
User adds items to cart at 2:00 PM, browses for 30 minutes, attempts checkout at 2:30 PM - tickets might be sold out by then. User will receive immediate feedback when clicking "Checkout" if availability has changed.

---

### Phase 3: Checkout Initiation - Creating Reservation (10-min hold)

**IMPORTANT:** Reservation is **ONLY** created when user clicks "Checkout" or "Proceed to Payment" button.

**Trigger:** User clicks "Checkout" button

**Flow:**
```
1. User clicks "Checkout" with items in cart
   ↓
2. Server Action: Validate cart items + Create reservation (atomic)
   ↓
3. 10-minute timer starts NOW
   ↓
4. Create payment session with Mercado Pago
   ↓
5. Redirect user to payment provider
```

#### Database Operations:

**3.1. Create Reservation Record**
```sql
INSERT INTO reservations (
  user_id,           -- auth.uid from Better Auth
  event_id,
  total_amount,      -- calculated from ticket_type.price * quantity
  expires_at,        -- NOW() + 10 minutes
  status,            -- 'active'
  payment_session_id, -- NULL (will be set by payment provider)
  payment_processor  -- 'mercadopago' or 'stripe'
)
```

**3.2. Create Reservation Items**
```sql
INSERT INTO reservation_items (
  reservation_id,
  ticket_type_id,
  quantity           -- how many of this ticket type
)
```

**3.3. Lock Inventory**
```sql
UPDATE ticket_types
SET reserved_count = reserved_count + quantity
WHERE id = ticket_type_id
```

**⚠️ CURRENT PROBLEM:** This happens in server action without proper locking:

**Reference:** `lib/supabase/actions/tickets.ts:26`
```typescript
const { data, error } = await supabase.rpc("purchase_tickets", {
  p_user_id: user.id,
  p_ticket_tier_id: ticketTierId,
  p_quantity: quantity,
  p_payment_method_id: paymentMethodId,
});
```

This RPC function **doesn't exist yet** in migrations! This means:
- **No row-level locking** (`FOR UPDATE`)
- **Race condition risk**: Two users can simultaneously check availability and both think there are 10 tickets left when there are only 5
- The CHECK constraint will catch it, but one user will see a database error instead of a clean "sold out" message

---

### Phase 4: Payment Processing

#### 4.1. Create Payment Session

After reservation is created, backend creates payment session:

```typescript
// Create Mercado Pago preference or Stripe checkout session
const preference = await mercadopago.preferences.create({
  items: [{
    title: ticketName,
    quantity: quantity,
    unit_price: price,
  }],
  // ... other config
})

// Update reservation with payment session ID
UPDATE reservations
SET payment_session_id = preference.id
WHERE id = reservation_id
```

**Implementation:** `lib/mercadopago.ts` handles Mercado Pago integration

#### 4.2. User Redirected to Payment Provider
- User completes payment on Mercado Pago/Stripe
- Payment provider sends webhook to `/api/mercadopago`

---

### Phase 5: Payment Webhook (Critical Section)

**Webhook Handler:** `/app/api/mercadopago/route.ts`

**Expected Flow:**
```typescript
POST /api/mercadopago
{
  "type": "payment",
  "data": { "id": "payment_id" }
}

1. Verify webhook signature (IMPORTANT!)
2. Fetch payment details from Mercado Pago API
3. Find reservation by payment_session_id
4. Convert reservation → order + tickets
```

#### Database Operations:

**5.1. Create Order**
```sql
INSERT INTO orders (
  user_id,
  event_id,
  total_amount,
  service_fee,
  payment_status,    -- 'paid'
  payment_session_id,
  created_at,
  paid_at            -- NOW()
)
```

**Schema Reference:** `lib/schema.ts:730-758`

**5.2. Create Order Items**
```sql
INSERT INTO order_items (
  order_id,
  ticket_type_id,
  quantity,
  price_per_ticket,  -- snapshot at time of purchase
  subtotal
)
SELECT
  v_order_id,
  ticket_type_id,
  quantity,
  (SELECT price FROM ticket_types WHERE id = ticket_type_id),
  quantity * price
FROM reservation_items
WHERE reservation_id = v_reservation_id
```

**Schema Reference:** `lib/schema.ts:761-785`

**5.3. Create Individual Tickets**
```sql
-- For EACH quantity, create a unique ticket
FOR i IN 1..quantity LOOP
  INSERT INTO tickets (
    order_id,
    reservation_id,    -- audit trail
    ticket_type_id,
    user_id,
    qr_code,           -- UNIQUE hash for scanning
    status,            -- 'valid'
    created_at
  )
END LOOP
```

**Schema Reference:** `lib/schema.ts:788-817`

**5.4. Update Inventory (Move from reserved → sold)**
```sql
UPDATE ticket_types
SET
  reserved_count = reserved_count - quantity,  -- release hold
  sold_count = sold_count + quantity,          -- mark as sold
  updated_at = NOW()
WHERE id = ticket_type_id
```

**5.5. Mark Reservation as Converted**
```sql
UPDATE reservations
SET status = 'converted'
WHERE id = reservation_id
```

**⚠️ CURRENT PROBLEM:** If webhook is called twice (common with webhooks!), you could:
- Create duplicate orders
- Create duplicate tickets
- Double-decrement `reserved_count` (violates CHECK constraint → error)

**Solution Needed:** Idempotency checking by `payment_session_id`

---

### Phase 6: Ticket Delivery

**After successful conversion:**

#### 6.1. Send Email
```sql
INSERT INTO email_logs (
  order_id,
  email_type,        -- 'purchase_confirmation', 'ticket_delivery'
  recipient_email,
  email_service_id,  -- Resend message ID
  status,            -- 'sent'
  metadata,          -- JSON with ticket URLs, QR codes
  sent_at
)
```

**Schema Reference:** `lib/schema.ts:820-839`

#### 6.2. User Receives:
- Email with tickets (PDF or HTML)
- Each ticket has unique QR code
- QR code = SHA256 hash of `ticket_id + user_id + timestamp`

**Email Service:** Resend (configured in Better Auth)

---

## 3. Inventory Management States

### Ticket Type Capacity Breakdown

```
capacity = 100 tickets total

sold_count = 30       (paid orders, tickets issued)
reserved_count = 20   (active carts, 10-min holds)
available = 50        (capacity - sold - reserved)
```

### State Enums

**Reservation States:**
```sql
reservation_status ENUM:
- 'active'     → User in checkout, has 10-min hold
- 'expired'    → Time ran out, tickets released
- 'converted'  → Payment succeeded, order created
- 'cancelled'  → User cancelled before payment
```

**Schema Reference:** `lib/schema.ts:131-136`

**Order Payment States:**
```sql
order_payment_status ENUM:
- 'pending'    → Shouldn't happen (we create orders after payment)
- 'paid'       → Normal state
- 'failed'     → Payment failed
- 'refunded'   → Tickets returned to inventory
```

**Schema Reference:** `lib/schema.ts:138-143`

**Ticket States:**
```sql
ticket_status ENUM:
- 'valid'       → Can be used for entry
- 'used'        → Already scanned at venue
- 'cancelled'   → Refunded or order cancelled
- 'transferred' → Transferred to another user
```

**Schema Reference:** `lib/schema.ts:145-150`

---

## 4. Architecture: Multi-Client Support

### Current Stack

```
┌─────────────────┐         ┌─────────────────┐
│   Expo App      │         │  Next.js App    │
│                 │         │                 │
│  Better Auth    │         │  Better Auth    │
│  (via API)      │         │  (native)       │
└────────┬────────┘         └────────┬────────┘
         │                           │
         └─────────┬─────────────────┘
                   ▼
         ┌────────────────────┐
         │  Next.js Backend   │
         │  • Server Actions  │
         │  • API Routes      │
         └─────────┬──────────┘
                   ▼
         ┌────────────────────┐
         │  Supabase/Postgres │
         │  (Service Role Key)│
         │  RLS enabled,      │
         │  but NO policies   │
         └────────────────────┘
```

### Key Points

- **Authentication:** Better Auth for both web and mobile
- **Database Access:** Always through backend with service role key
- **Security:** RLS enabled on all tables, but no policies (server-side auth)
- **Clients never access database directly:** All operations via Next.js API

---

## 5. Missing Pieces (Implementation Gaps)

### Gap 1: No Atomic Reservation Function ❌

**Current Issue:**
Server action references:
```typescript
await supabase.rpc("purchase_tickets", {...})
```

But this function **doesn't exist** in migrations!

**What's Needed:**
```sql
CREATE FUNCTION create_reservation(...)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Lock ticket_types row with FOR UPDATE
  -- Check availability
  -- Atomically increment reserved_count
  -- Create reservation + items
END;
$$;
```

**Impact:** Race conditions can cause database constraint errors instead of clean "sold out" messages

---

### Gap 2: No Cleanup for Expired Reservations ❌

**Current Issue:**
If a user abandons checkout:
- Their reservation sits with `status='active'`
- `reserved_count` stays incremented
- Tickets appear sold out even though they're not

**What's Needed:**
- Cron job calling `expire_reservations()` every 1-5 minutes
- Or: Vercel Cron hitting `/api/cron/expire-reservations`

**Implementation:**
```sql
CREATE FUNCTION expire_reservations()
RETURNS TABLE(expired_count INT, released_tickets INT)
AS $$
BEGIN
  -- Find reservations with status='active' AND expires_at < NOW()
  -- Decrement reserved_count
  -- Mark as 'expired'
END;
$$;
```

---

### Gap 3: No Idempotency for Webhooks ❌

**Current Issue:**
Mercado Pago can send duplicate webhooks

**What's Needed:**
```typescript
// Check if already processed
const existingOrder = await db.query(`
  SELECT id FROM orders
  WHERE payment_session_id = $1
`, [paymentSessionId])

if (existingOrder) {
  return { success: true, order_id: existingOrder.id }
}
```

**Implementation Location:** `/app/api/mercadopago/route.ts`

---

### Gap 4: Race Conditions Without Locking ❌

**Current Issue:**
Without `FOR UPDATE SKIP LOCKED`, two simultaneous purchases can:
1. Both read `available = 5`
2. Both try to reserve 5
3. CHECK constraint fails for one user
4. User sees database error instead of "sold out"

**What's Needed:**
PostgreSQL function with:
```sql
SELECT * FROM ticket_types
WHERE id = ticket_type_id
FOR UPDATE;  -- Locks the row until transaction commits
```

---

## 6. Complete Flow Summary

```
1. Setup:
   ✅ organization → event → ticket_types (capacity=100)
   Schema: lib/schema.ts:562-654

2. Browse & Add to Cart (Client-Side Only):
   ✅ User queries ticket_types via SSR, sees available=100
   ✅ User adds items to cart (localStorage/React state)
   ✅ NO database writes - cart is purely client-side
   ✅ NO inventory locking during browsing
   Implementation: Frontend components with client state management

3. Checkout Initiation (User clicks "Checkout" button):
   ✅ Server validates cart items against current availability
   ✅ Create reservation (status=active, expires_at=NOW()+10min)
   ✅ Create reservation_items
   ✅ UPDATE reserved_count += quantity (inventory locked NOW)
   ❌ Missing: Atomic locking to prevent race conditions
   Schema: lib/schema.ts:679-727

4. Payment:
   ✅ Create payment session with Mercado Pago
   ✅ User redirected to payment
   ✅ Webhook received
   Implementation: lib/mercadopago.ts, /app/api/mercadopago/route.ts

5. Fulfillment:
   ✅ Create order (status=paid)
   ✅ Create order_items
   ✅ Create tickets with QR codes
   ✅ UPDATE: reserved_count -= qty, sold_count += qty
   ✅ Mark reservation as converted
   ❌ Missing: Idempotency check
   ❌ Missing: Proper error handling for race conditions
   Schema: lib/schema.ts:730-817

6. Cleanup:
   ❌ Missing: Expire old reservations
   ❌ Missing: Release reserved_count for abandoned carts

7. Refunds:
   ✅ Schema supports it
   ❌ Missing: refund_order() function
```

---

## 7. Database Schema Files

### Main Schema
- **File:** `lib/schema.ts`
- **ORM:** Drizzle ORM
- **Lines:** 866 total

### Latest Migration
- **File:** `lib/migrations/0012_smooth_satana.sql`
- **Created:** Latest ticketing system tables
- **Includes:** reservations, orders, tickets, email_logs

### Key Constraints
```sql
-- Prevent overselling
ALTER TABLE "ticket_types" ADD CONSTRAINT "check_capacity_not_exceeded"
  CHECK (sold_count + reserved_count <= capacity);

-- Ensure non-negative counts
ALTER TABLE "ticket_types" ADD CONSTRAINT "check_counts_non_negative"
  CHECK (sold_count >= 0 AND reserved_count >= 0 AND capacity > 0);

-- Validate order limits
ALTER TABLE "ticket_types" ADD CONSTRAINT "check_order_limits"
  CHECK (min_per_order > 0 AND max_per_order >= min_per_order);
```

**Location:** `lib/migrations/0012_smooth_satana.sql:125-133`

---

## 8. Next Steps for Production Readiness

### Critical (Must Have)
1. ✅ Create atomic PostgreSQL functions:
   - `create_reservation()` with FOR UPDATE locking
   - `convert_reservation_to_order()` with idempotency
   - `expire_reservations()` for cleanup

2. ✅ Implement cleanup cron job:
   - Vercel Cron or external scheduler
   - Call `/api/cron/expire-reservations` every 1-5 minutes

3. ✅ Add idempotency to webhook handler:
   - Check `payment_session_id` before creating order
   - Store provider event IDs to detect duplicates

### Important (Should Have)
4. Add monitoring functions:
   - `get_ticket_availability()` for real-time availability
   - `get_user_reservations()` for cart views

5. Implement refund flow:
   - `refund_order()` function
   - Update `sold_count` when refunding

6. Add comprehensive error handling:
   - Clean error messages for sold-out scenarios
   - Retry logic for transient failures

### Nice to Have
7. Add audit logging:
   - Track all inventory changes
   - Log payment webhook events

8. Performance optimization:
   - Partial indexes for common queries
   - Connection pooling (already using Drizzle)

---

## 9. Security Considerations

### Current Security Model
- ✅ RLS enabled on all tables
- ✅ No RLS policies (server-side auth only)
- ✅ All database access via service role key
- ✅ Better Auth handles authentication
- ✅ Server actions validate user ownership

### Additional Security Needed
- ⚠️ Webhook signature verification (Mercado Pago)
- ⚠️ Rate limiting on reservation creation
- ⚠️ Input validation on quantities and user IDs
- ⚠️ SQL injection prevention (using parameterized queries)

---

## 10. Related Files Reference

### Backend
- `lib/schema.ts` - Database schema (Drizzle ORM)
- `lib/drizzle.ts` - Database connection
- `lib/auth.ts` - Better Auth configuration
- `lib/mercadopago.ts` - Payment integration
- `lib/supabase/actions/tickets.ts` - Server actions (incomplete)

### Migrations
- `lib/migrations/0012_smooth_satana.sql` - Latest ticketing tables
- `lib/migrations/0013_high_concurrency_functions.sql` - To be created

### API Routes
- `/app/api/mercadopago/route.ts` - Payment webhook handler
- `/app/api/cron/expire-reservations/route.ts` - To be created

### Frontend
- `/app/eventos/` - Event listing
- `/app/payment/` - Payment confirmation

---

**End of Documentation**
