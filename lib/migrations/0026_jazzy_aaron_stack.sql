CREATE TYPE "public"."event_type" AS ENUM('single', 'multi_day', 'recurring', 'slots');--> statement-breakpoint
ALTER TABLE "event_days" ADD COLUMN "end_date" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "type" "event_type" DEFAULT 'single';