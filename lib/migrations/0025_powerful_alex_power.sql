CREATE TABLE "event_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"name" text,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "ticket_types" ADD COLUMN "event_day_id" uuid;--> statement-breakpoint
ALTER TABLE "ticket_types" ADD COLUMN "is_addon" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tickets" ADD COLUMN "event_day_id" uuid;--> statement-breakpoint
ALTER TABLE "event_days" ADD CONSTRAINT "event_days_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_event_days_event" ON "event_days" USING btree ("event_id");--> statement-breakpoint
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_event_day_id_event_days_id_fk" FOREIGN KEY ("event_day_id") REFERENCES "public"."event_days"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_event_day_id_event_days_id_fk" FOREIGN KEY ("event_day_id") REFERENCES "public"."event_days"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "pos_fee";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "hex";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "priority";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "hex_text";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "guest_list";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "private_list";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "access_pass";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "guest_list_max_hour";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "guest_list_quantity";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "guest_list_info";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "hex_text_secondary";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "late_fee";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "guest_email";--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "guest_name";