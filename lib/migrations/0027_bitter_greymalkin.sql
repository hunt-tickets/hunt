ALTER TABLE "event_days" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "event_days" ADD COLUMN "flyer" text;--> statement-breakpoint
ALTER TABLE "event_days" ADD COLUMN "doors_open" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "event_days" ADD COLUMN "show_start" timestamp with time zone;