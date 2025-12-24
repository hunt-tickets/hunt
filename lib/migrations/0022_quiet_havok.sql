-- Backfill existing NULL values to true (keep existing ticket types active)
UPDATE "ticket_types" SET "active" = true WHERE "active" IS NULL;

-- Now safe to add constraints
ALTER TABLE "ticket_types" ALTER COLUMN "active" SET DEFAULT false;
ALTER TABLE "ticket_types" ALTER COLUMN "active" SET NOT NULL;