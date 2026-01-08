# Event Management Safeguards - Remaining Tasks

## ✅ Completed

1. **Database Schema Updates** (schema.ts)
   - ✅ Added `eventLifecycleStatus` enum (active, cancelled, archived)
   - ✅ Added lifecycle fields to events table (lifecycleStatus, cancellationReason, cancelledBy, cancelledAt, deletedAt, modificationLocked)
   - ✅ Created `eventAuditLog` table for tracking administrative actions
   - ✅ Updated `emailLogs` table to support event notifications (added eventId field, made orderId optional)
   - ✅ Changed CASCADE to RESTRICT on critical foreign keys (prevents accidental data loss):
     - `eventDays.eventId`
     - `ticketTypes.eventId`
     - `reservations.eventId`
     - `orders.eventId` **← CRITICAL: Users can't lose money anymore!**
   - ✅ Generated and applied Drizzle migration to Supabase

---

## 🚧 In Progress / To Do

### Phase 1: PostgreSQL Functions (Supabase SQL Editor)

**Status:** Not started - User will add these directly in Supabase SQL editor

Create the following PostgreSQL functions:

#### 1. `cancel_event(p_event_id, p_cancelled_by, p_cancellation_reason)`
**Purpose:** Atomically cancel an event and prepare refunds

**Logic:**
```sql
BEGIN
  -- Update event status
  UPDATE events SET
    lifecycle_status = 'cancelled',
    cancelled_by = p_cancelled_by,
    cancelled_at = NOW(),
    cancellation_reason = p_cancellation_reason,
    deleted_at = NOW()  -- Soft delete
  WHERE id = p_event_id;

  -- Mark all paid orders for refund
  UPDATE orders SET
    payment_status = 'refunded'
  WHERE event_id = p_event_id
    AND payment_status = 'paid';

  -- Cancel all tickets
  UPDATE tickets SET
    status = 'cancelled'
  WHERE order_id IN (
    SELECT id FROM orders WHERE event_id = p_event_id
  );

  -- Restore inventory (decrease sold_count, increase available)
  UPDATE ticket_types SET
    sold_count = 0,
    reserved_count = 0
  WHERE event_id = p_event_id;

  RETURN TRUE;
END;
```

#### 2. `archive_event(p_event_id, p_archived_by)`
**Purpose:** Archive events without sales

**Logic:**
```sql
BEGIN
  -- Check no orders exist
  IF EXISTS (SELECT 1 FROM orders WHERE event_id = p_event_id) THEN
    RAISE EXCEPTION 'Cannot archive event with existing orders';
  END IF;

  -- Update event status
  UPDATE events SET
    lifecycle_status = 'archived',
    deleted_at = NOW()
  WHERE id = p_event_id;

  RETURN TRUE;
END;
```

#### 3. `can_modify_event_critically(p_event_id)`
**Purpose:** Check if critical fields can be modified

**Returns:** `{ allowed: boolean, paid_orders: integer }`

**Logic:**
```sql
SELECT
  CASE
    WHEN COUNT(*) = 0 THEN TRUE
    ELSE FALSE
  END as allowed,
  COUNT(*) as paid_orders
FROM orders
WHERE event_id = p_event_id
  AND payment_status = 'paid';
```

#### 4. `count_paid_orders(p_event_id)`
**Purpose:** Get count of paid orders for an event

**Logic:**
```sql
SELECT COUNT(*) FROM orders
WHERE event_id = p_event_id
  AND payment_status = 'paid';
```

#### 5. `get_event_affected_users(p_event_id)`
**Purpose:** Get list of users who will be affected by event cancellation

**Logic:**
```sql
SELECT DISTINCT
  u.id,
  u.email,
  u.name,
  COUNT(o.id) as order_count,
  SUM(o.total_amount) as total_spent
FROM users u
JOIN orders o ON u.id = o.user_id
WHERE o.event_id = p_event_id
  AND o.payment_status = 'paid'
GROUP BY u.id, u.email, u.name;
```

---

### Phase 2: Backend - Server Actions

**File:** `/actions/event-management.ts` (not yet created)

**Actions to implement:**

1. **`cancelEvent(prevState, formData)`**
   - Validate user permissions (owner/admin only)
   - Validate reason (min 10 chars)
   - Call `cancel_event()` PostgreSQL function
   - Log to event_audit_log
   - Return success/error state
   - Revalidate cache paths

2. **`archiveEvent(prevState, formData)`**
   - Validate user permissions
   - Check no orders exist (client-side + server-side)
   - Call `archive_event()` PostgreSQL function
   - Log to event_audit_log
   - Return success/error state

3. **`getEventCancellationImpact(eventId, organizationId)`**
   - Query orders, tickets, customers for event
   - Return statistics: {
     - totalOrders
     - totalTickets
     - totalRevenue
     - affectedCustomers
     - paidOrders
     - refundAmount
   }
   - Used by cancel dialog to show preview

4. **`checkCriticalModificationAllowed(eventId, organizationId)`**
   - Check modification_locked field
   - Count paid orders
   - Return { allowed: boolean, reason?: string, paidOrders?: number }

---

### Phase 3: Email Notification System

**File:** `/lib/helpers/email-notifications.ts` (not yet created)

**Functions to implement:**

1. **`sendEventCancellationEmail(userId, eventData, orderData)`**
   - Beautiful HTML template with event details
   - Refund information
   - Apology message
   - Support contact info

2. **`sendEventModificationEmail(userId, eventData, changes)`**
   - Show what changed (date, time, venue)
   - Option to request refund if desired
   - Updated event details

3. **`sendBulkCancellationEmails(eventId)`**
   - Get all affected users via `get_event_affected_users()`
   - Send emails in batches (avoid rate limits)
   - Log to email_logs table
   - Non-blocking (don't wait for completion)
   - Deduplicate by email address

**Email Service:** Use existing Resend integration

**Templates:** Use React Email components for beautiful emails

---

### Phase 4: UI Components

#### 1. `/components/event-cancel-dialog.tsx` (not yet created)

**Features:**
- Dialog with cancellation form
- Impact preview section showing:
  - Number of affected customers
  - Total tickets that will be cancelled
  - Refund amount
  - Warning messages in red
- Reason textarea (required, min 10 chars)
- Confirmation checkbox: "Entiendo que esta acción enviará reembolsos automáticos"
- Cancel/Confirm buttons
- Loading states during submission
- Success/error toast messages

**Props:**
```typescript
{
  eventId: string;
  organizationId: string;
  onSuccess?: () => void;
}
```

#### 2. `/components/event-archive-dialog.tsx` (not yet created)

**Features:**
- Simple confirmation dialog
- Show warning if event has sales (shouldn't happen due to checks)
- Explain difference between archive and cancel
- Confirm button
- Success/error handling

**Props:**
```typescript
{
  eventId: string;
  organizationId: string;
  onSuccess?: () => void;
}
```

#### 3. **Update** `/components/event-options-menu.tsx`

**Current state:** Has placeholder console.log() functions

**Changes needed:**
- Wire up "Cancelar evento" → Opens EventCancelDialog
- Wire up "Archivar evento" → Opens EventArchiveDialog
- Wire up "Editar evento" → Check if modifications allowed first
- Show/hide options based on event lifecycle_status:
  - Hide cancel if already cancelled
  - Hide archive if event has sales
  - Show "Restaurar" option for archived events (future feature)

---

### Phase 5: Permissions Update

**File:** `/lib/auth-permissions.ts` (needs update)

**Changes:**
```typescript
const statement = {
  ...defaultStatements,
  event: ["create", "update", "delete", "sell", "cancel", "archive"], // ← Add these
  // ...
}

// Update role permissions
const administrator = ac.newRole({
  // ...
  event: ["create", "update", "delete", "sell", "cancel", "archive"],
  // ...
});

const owner = ac.newRole({
  // ...
  event: ["create", "update", "delete", "sell", "cancel", "archive"],
  // ...
});

// Sellers cannot cancel/archive
const seller = ac.newRole({
  event: ["sell"], // ← No cancel/archive
});
```

---

### Phase 6: Event Update Safeguards

**File:** `/actions/events.ts` (needs update)

**Function:** `updateEventConfiguration()` or similar

**Add safeguards:**
1. Before allowing date/venue/time changes:
   - Call `checkCriticalModificationAllowed(eventId)`
   - If not allowed, return error with reason
   - Show user how many tickets sold

2. If critical changes are made:
   - Log to event_audit_log with metadata: { changedFields: [...], oldValues: {...}, newValues: {...} }
   - Queue modification notification emails
   - Set modification_locked = true after first paid order

3. Non-critical changes (description, images, FAQs):
   - Allow without restrictions
   - Still log to audit trail

---

## 📋 PostgreSQL Functions Summary

Create these in Supabase SQL Editor:

| Function | Purpose | Priority |
|----------|---------|----------|
| `cancel_event()` | Atomic event cancellation + refunds | **CRITICAL** |
| `archive_event()` | Archive draft events | HIGH |
| `can_modify_event_critically()` | Check modification permissions | HIGH |
| `count_paid_orders()` | Get paid order count | MEDIUM |
| `get_event_affected_users()` | Get users for email notifications | HIGH |

---

## 🔄 Implementation Order

**Recommended sequence:**

1. ✅ **Phase 1: Database** - Done! ✨
   - Schema updated
   - Migration applied
   - CASCADE → RESTRICT fixed

2. **Phase 1B: PostgreSQL Functions** (Do this next!)
   - Create the 5 functions above in Supabase SQL editor
   - Test each function manually with sample data

3. **Phase 2: Backend**
   - Create `/actions/event-management.ts`
   - Test server actions work correctly

4. **Phase 3: Emails**
   - Create `/lib/helpers/email-notifications.ts`
   - Design beautiful email templates
   - Test email sending

5. **Phase 4: UI**
   - Create cancel dialog
   - Create archive dialog
   - Update event options menu
   - Test full user flow

6. **Phase 5: Permissions**
   - Update `/lib/auth-permissions.ts`
   - Test permission checks work

7. **Phase 6: Safeguards**
   - Update `/actions/events.ts`
   - Add modification checks
   - Test edge cases

---

## 🧪 Testing Checklist

After implementation, test:

- [ ] Event cancellation works (calls function, updates DB, logs audit)
- [ ] Refund status updates correctly
- [ ] Inventory restored (sold_count decreases)
- [ ] Tickets marked as cancelled
- [ ] Emails sent to affected users
- [ ] Archive only works for events without sales
- [ ] Archive fails with helpful error if sales exist
- [ ] Critical modifications blocked after sales
- [ ] Non-critical modifications still allowed
- [ ] Audit log records all actions
- [ ] Permissions enforced (sellers can't cancel/archive)
- [ ] CASCADE RESTRICT prevents accidental deletes
- [ ] Concurrent cancellations don't cause issues
- [ ] Email failures don't block cancellation

---

## 🎯 Success Criteria

- ✅ No user can ever lose money from event operations
- ✅ All financial data preserved (soft delete only)
- ✅ Users notified of cancellations/modifications
- ✅ Clear audit trail of all administrative actions
- ✅ Permissions properly enforced
- ✅ Database constraints prevent data loss
- ✅ UI shows impact before destructive actions
- ✅ Graceful error handling throughout

---

## 📝 Notes

- **Mercado Pago Refund API:** Out of scope for now. Orders marked as "refunded" in DB, but actual MP refund API call will be separate task.
- **Event Restoration:** Not implemented yet. Future feature to restore archived events.
- **Partial Refunds:** Not implemented. All or nothing for now.
- **Email Rate Limiting:** Consider adding delays between bulk emails to avoid Resend rate limits.

---

**Last Updated:** 2026-01-07
**Status:** Phase 1 complete, Phase 1B (PostgreSQL functions) next
