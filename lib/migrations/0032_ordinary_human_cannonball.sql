ALTER TYPE "public"."order_payment_status" ADD VALUE 'refund_failed';--> statement-breakpoint
CREATE TABLE "refunds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"event_id" uuid NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'COP' NOT NULL,
	"reason" text NOT NULL,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL,
	"requested_by" text,
	"approved_at" timestamp with time zone,
	"approved_by" text,
	"processed_at" timestamp with time zone,
	"mp_refund_id" text,
	"mp_payment_id" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"failure_reason" text,
	"metadata" jsonb
);
--> statement-breakpoint
DROP INDEX "idx_events_cancelled";--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cancellation_initiated_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "cancellation_completed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_requested_by_user_id_fk" FOREIGN KEY ("requested_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_approved_by_user_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_refunds_order" ON "refunds" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_refunds_event" ON "refunds" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_refunds_status" ON "refunds" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_refunds_requested_at" ON "refunds" USING btree ("requested_at");--> statement-breakpoint
CREATE INDEX "idx_events_cancellation_initiated" ON "events" USING btree ("cancellation_initiated_at");--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN "cancelled_at";