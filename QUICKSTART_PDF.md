# Quick Start: PDF Generator

## Steps to Deploy

### 1. Create Storage Bucket

In Supabase Dashboard → Storage → Create bucket:
- Name: `order-tickets`
- Public: **No** (keep private)

Or run this SQL:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('order-tickets', 'order-tickets', false);
```

### 2. Upload Logo

Upload your logo to:
- Path: `default/logos/hunt_logo.png`
- Format: PNG with transparent background
- Size: ~160x50px recommended

### 3. Deploy Edge Function

```bash
supabase functions deploy generate-pdf
```

### 4. Test It

```bash
# Get an order ID from your database
psql "your-connection-string" -c "SELECT id FROM orders LIMIT 1;"

# Test the function
curl -i --location POST 'https://YOUR_PROJECT.supabase.co/functions/v1/generate-pdf' \
  --header 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"order_id":"paste-order-id-here"}'
```

### 5. Monitor Logs

```bash
supabase functions logs generate-pdf --tail
```

## That's It!

The webhook is already updated to call the PDF generator automatically when orders are created.
