CREATE TYPE "public"."event_lifecycle_status" AS ENUM('active', 'cancelled', 'archived');--> statement-breakpoint
CREATE TABLE "event_audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"action" text NOT NULL,
	"performed_by" text NOT NULL,
	"reason" text,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "event_days" DROP CONSTRAINT "event_days_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "ticket_types" DROP CONSTRAINT "ticket_types_event_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "email_logs" ALTER COLUMN "order_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "email_logs" ADD COLUMN "event_id" uuid;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "lifecycle_status" "event_lifecycle_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cancellation_reason" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cancelled_by" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cancelled_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "modification_locked" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "event_audit_log" ADD CONSTRAINT "event_audit_log_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_audit_log" ADD CONSTRAINT "event_audit_log_performed_by_user_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_event_audit_log_event" ON "event_audit_log" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_event_audit_log_action" ON "event_audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "idx_event_audit_log_created_at" ON "event_audit_log" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_days" ADD CONSTRAINT "event_days_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_cancelled_by_user_id_fk" FOREIGN KEY ("cancelled_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_email_logs_event" ON "email_logs" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_events_lifecycle_status" ON "events" USING btree ("lifecycle_status");--> statement-breakpoint
CREATE INDEX "idx_events_cancelled" ON "events" USING btree ("cancelled_at");--> statement-breakpoint
CREATE INDEX "idx_events_deleted" ON "events" USING btree ("deleted_at");