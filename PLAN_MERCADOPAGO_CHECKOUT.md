# MercadoPago Marketplace Checkout Implementation Plan

## Overview

When a user clicks "Proceder al pago", the system will:
1. Validate the event and ticket availability
2. Create a reservation (locks tickets for 10 minutes)
3. Fetch the organization's MercadoPago access token
4. Create a MercadoPago preference with marketplace fees
5. Return the checkout URL to open MercadoPago's checkout

## What Already Exists

### ✅ Infrastructure Ready
- **MercadoPago SDK configured** (`lib/mercadopago.ts`)
- **OAuth flow for sellers** (`/api/mercadopago/connect`)
- **Payment processor account table** - stores organization's MP credentials
- **Reservation system** (`lib/reservations.ts`) - atomic ticket locking with PostgreSQL functions
- **Webhook handler** (`/api/mercadopago/route.ts`) - processes payment notifications
- **Checkout server action** (`actions/checkout.ts`) - creates preference with marketplace fee
- **Environment variables** - MP_ACCESS_TOKEN, MP_CLIENT_SECRET, etc.

### ❌ What Needs to Be Connected
- The `TicketSummaryDrawer` needs to call the checkout action
- Handle the checkout URL response and redirect to MercadoPago

---

## Implementation Steps

### Step 1: Update TicketSummaryDrawer to Call Checkout Action

**File:** `components/ticket-summary-drawer.tsx`

**Changes:**
1. Import the `checkoutAction` from `@/actions/checkout`
2. Get `organizationId` from event data (need to pass it as prop)
3. In `handlePayment`:
   - Call `checkoutAction(eventId, organizationId, items)`
   - If successful, redirect to `checkoutUrl` using `window.location.href`
   - If error, display the error message

**Props to add:**
- `organizationId: string` - needed for fetching MP credentials

---

### Step 2: Pass organizationId Through Component Chain

**Files to update:**

1. **`app/eventos/[eventId]/page.tsx`**
   - Fetch `organization_id` in `getEventById` query
   - Pass it to `TicketsContainer`

2. **`lib/supabase/actions/events.ts`**
   - Update `getEventById` to include `organization_id` in the response
   - Update `EventDetail` type

3. **`components/tickets-container.tsx`**
   - Add `organizationId` prop
   - Pass it to `TicketSummaryDrawer`

4. **`components/ticket-summary-drawer.tsx`**
   - Add `organizationId` prop
   - Use it when calling `checkoutAction`

---

### Step 3: Verify Checkout Action Works

**File:** `actions/checkout.ts`

**Verify/Update:**
1. Ensure it properly fetches the organization's MP access token from `payment_processor_account`
2. Verify the preference creation includes:
   - `items` array with ticket details
   - `back_urls` for success/failure/pending redirects
   - `notification_url` for webhook
   - `metadata` with reservation_id, event_id, user_id
   - `marketplace_fee` for platform commission
   - `expires` matching reservation window
3. Return the `init_point` URL (checkout URL)

---

### Step 4: Create Success/Failure/Pending Pages

**New files:**
- `app/checkout/success/page.tsx` - Show success message, ticket details
- `app/checkout/failure/page.tsx` - Show error, retry option
- `app/checkout/pending/page.tsx` - Show pending status, instructions

These are the redirect URLs after MercadoPago payment.

---

### Step 5: Verify Webhook Handler

**File:** `app/api/mercadopago/route.ts`

**Ensure it:**
1. Receives payment notification from MercadoPago
2. Fetches payment details using `Payment.get()`
3. Extracts `reservation_id` from payment metadata
4. Calls `convertReservationToOrder()` if payment is approved
5. Creates tickets with QR codes
6. Returns 200 OK

---

## Data Flow Diagram

```
User clicks "Proceder al pago"
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ TicketSummaryDrawer.handlePayment()                        │
│   - Prepare items: [{ticket_type_id, quantity}]            │
│   - Call checkoutAction(eventId, organizationId, items)    │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ actions/checkout.ts - checkoutAction()                      │
│   1. Authenticate user (Better Auth)                        │
│   2. Validate cart items                                    │
│   3. createReservation() → locks tickets, returns res_id    │
│   4. Get org's MP access_token from payment_processor_account│
│   5. Calculate marketplace_fee                              │
│   6. Create MercadoPago Preference with:                    │
│      - items, back_urls, notification_url                   │
│      - metadata: {reservation_id, event_id, user_id}        │
│      - marketplace_fee                                      │
│   7. Update reservation with payment_session_id             │
│   8. Return {checkoutUrl, reservation}                      │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ Redirect to MercadoPago Checkout (init_point URL)           │
│   User completes payment on MercadoPago                     │
└─────────────────────────────────────────────────────────────┘
         │
         ├─────────────────────┐
         ▼                     ▼
┌─────────────────┐    ┌─────────────────────────────────────┐
│ Redirect to     │    │ MercadoPago Webhook → /api/mercadopago│
│ /checkout/success│    │   1. Verify payment status           │
│ or /failure     │    │   2. Get reservation_id from metadata │
└─────────────────┘    │   3. convertReservationToOrder()      │
                       │   4. Create tickets with QR codes     │
                       │   5. TODO: Send confirmation email    │
                       └─────────────────────────────────────┘
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `lib/supabase/actions/events.ts` | Add `organization_id` to `getEventById` and `EventDetail` type |
| `app/eventos/[eventId]/page.tsx` | Pass `organizationId` to `TicketsContainer` |
| `components/tickets-container.tsx` | Add `organizationId` prop, pass to drawer |
| `components/ticket-summary-drawer.tsx` | Import & call `checkoutAction`, handle redirect |

## Files to Create

| File | Purpose |
|------|---------|
| `app/checkout/success/page.tsx` | Success redirect page |
| `app/checkout/failure/page.tsx` | Failure redirect page |
| `app/checkout/pending/page.tsx` | Pending redirect page |

## Files to Verify (no changes expected)

| File | Verify |
|------|--------|
| `actions/checkout.ts` | Correct preference creation with marketplace fee |
| `lib/reservations.ts` | Reservation creation and conversion work |
| `app/api/mercadopago/route.ts` | Webhook processes payments correctly |

---

## Edge Cases to Handle

1. **Organization has no connected MercadoPago account**
   - Show error: "Este evento no tiene pagos habilitados"

2. **Organization's MP account is inactive**
   - Check `status` field in `payment_processor_account`

3. **Tickets sell out during checkout**
   - `createReservation()` will throw an error
   - Display user-friendly message

4. **Reservation expires before payment**
   - MercadoPago preference also expires
   - User sees expired message, needs to restart

5. **User abandons checkout**
   - Cron job expires reservation after 10 min
   - Tickets become available again

---

## Testing Checklist

- [ ] Select tickets and click "Proceder al pago"
- [ ] Verify reservation is created in database
- [ ] Verify redirect to MercadoPago checkout
- [ ] Complete test payment in MercadoPago sandbox
- [ ] Verify webhook is received
- [ ] Verify order and tickets are created
- [ ] Verify redirect to success page
- [ ] Test failure scenario
- [ ] Test reservation expiration
