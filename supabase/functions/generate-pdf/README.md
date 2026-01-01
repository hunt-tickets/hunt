# PDF Generator Edge Function

Generates ticket PDFs for Hunt Tickets orders using Supabase SDK.

## Features

- ✅ Uses Supabase SDK to query your database tables
- ✅ Inline QR code generation (no external service needed)
- ✅ Multi-ticket PDF support
- ✅ PDF caching (regenerates only if forced)
- ✅ Signed URLs with event-based expiration
- ✅ Comprehensive logging

## Setup

### 1. Create Storage Bucket

```sql
-- Run in Supabase SQL Editor
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-tickets', 'order-tickets', false);

-- Enable RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow service role to upload
CREATE POLICY "Service role can upload tickets"
ON storage.objects FOR INSERT
TO service_role
WITH CHECK (bucket_id = 'order-tickets');

-- Allow service role to read
CREATE POLICY "Service role can read tickets"
ON storage.objects FOR SELECT
TO service_role
USING (bucket_id = 'order-tickets');

-- Allow authenticated users to read their own tickets
CREATE POLICY "Users can read their tickets"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'order-tickets' AND
  auth.uid()::text IN (
    SELECT "userId"::text FROM orders WHERE id::text = (string_to_array(name, '/'))[1]
  )
);
```

### 2. Upload Static Assets

Upload your company logo to `default/logos/hunt_logo.png`:

- Navigate to Supabase Dashboard → Storage → default → logos
- Upload `hunt_logo.png` (recommended: PNG format, transparent background, ~160x50px)

If you want to use a different logo URL, update `CONFIG.DEFAULT_LOGO_URL` in `index.ts`

### 3. Deploy Edge Function

```bash
# Deploy the function
supabase functions deploy generate-pdf

# Verify deployment
supabase functions list
```

### 4. Test the Function

```bash
# Get a real order ID from your database
supabase db query "SELECT id FROM orders LIMIT 1;"

# Test the function
curl -i --location --request POST 'https://YOUR_PROJECT.supabase.co/functions/v1/generate-pdf' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"order_id":"paste-order-id-here"}'
```

### 5. Update Webhook

Update `app/api/mercadopago/route.ts` (lines 146-161):

```typescript
// Uncomment and update:
fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-pdf`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    order_id: order.order_id
  }),
}).catch((error) => {
  console.error("[Webhook] ⚠️ PDF generation failed (non-blocking):", error);
});
```

## API Reference

### POST /generate-pdf

Generate PDF for an order.

**Request:**
```json
{
  "order_id": "uuid-here",
  "force_regenerate": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "pdf_url": "https://...signed-url...",
  "expires_at": "2025-01-31T12:00:00Z",
  "cached": false,
  "stats": {
    "processing_time": 2500,
    "ticket_count": 5,
    "pdf_size": 1234567
  }
}
```

### GET /generate-pdf/health

Health check.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-01T12:00:00Z",
  "service": "pdf_generator",
  "version": "1.0.0"
}
```

## Monitoring

```bash
# Tail logs in real-time
supabase functions logs generate-pdf --tail

# View recent logs
supabase functions logs generate-pdf --limit 100
```

## Database Tables Used

The function queries these tables via Supabase SDK:

- `orders` - Order records (`eventId`, `userId`)
- `tickets` - Individual tickets (`orderId`, `ticketTypeId`, `qrCode`)
- `ticket_types` - Ticket definitions (`name`)
- `events` - Event records (`venueId`, `name`, `date`, `flyer`)
- `venues` - Venue info (`timezoneId`, `name`, `address`)
- `user` - User records (`email`, `name`)

## Troubleshooting

### "Order not found"
```sql
-- Verify order exists
SELECT * FROM orders WHERE id = 'your-uuid';
```

### "No tickets found"
```sql
-- Check tickets were created
SELECT * FROM tickets WHERE "orderId" = 'your-order-uuid';
```

### "Event not found"
```sql
-- Check event link
SELECT o.id, o."eventId", e.name
FROM orders o
LEFT JOIN events e ON e.id = o."eventId"
WHERE o.id = 'your-order-uuid';
```

### Function won't deploy
```bash
# Check for syntax errors
deno check supabase/functions/generate-pdf/index.ts

# Or deploy with --debug
supabase functions deploy generate-pdf --debug
```

## Performance

- **Processing time:** 2-5 seconds for 5 tickets
- **QR generation:** ~200ms per ticket
- **Image loading:** ~1-2 seconds (cached)
- **Caching:** Subsequent requests instant (cached PDF)
