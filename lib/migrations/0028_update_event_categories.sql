-- Migration: Update event_category enum to match frontend constants
-- This migration updates the event_category enum values to align with the UI

-- Step 1: Convert column to text (using the text representation of the enum value)
ALTER TABLE events
  ALTER COLUMN category TYPE text
  USING category::text;

-- Step 2: Map old values to new values (best effort mapping)
UPDATE events SET category =
  CASE
    WHEN category = 'musica' THEN 'conciertos'
    WHEN category = 'rumba' THEN 'fiestas'
    WHEN category = 'familiar' THEN 'fiestas'
    WHEN category = 'arte' THEN 'teatro'
    WHEN category = 'aire_libre' THEN 'festivales'
    WHEN category = 'gastronomia' THEN 'ferias'
    WHEN category = 'negocios' THEN 'clases'
    WHEN category = 'educacion' THEN 'clases'
    WHEN category = 'mercados' THEN 'ferias'
    WHEN category = 'otro' THEN 'festivales'
    -- Keep existing values that match
    WHEN category = 'deportes' THEN 'deportes'
    WHEN category = 'bienestar' THEN 'bienestar'
    -- Default fallback
    ELSE 'festivales'
  END
WHERE category IS NOT NULL;

-- Step 3: Drop old enum type
DROP TYPE IF EXISTS event_category;

-- Step 4: Create new enum type with updated values
CREATE TYPE event_category AS ENUM (
  'fiestas',
  'conciertos',
  'festivales',
  'bienestar',
  'clases',
  'ferias',
  'deportes',
  'teatro'
);

-- Step 5: Convert column to new enum type
ALTER TABLE events
  ALTER COLUMN category TYPE event_category
  USING category::event_category;
