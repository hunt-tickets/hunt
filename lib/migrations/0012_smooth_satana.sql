CREATE TYPE "public"."order_payment_status" AS ENUM('pending', 'paid', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('active', 'expired', 'converted', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('valid', 'used', 'cancelled', 'transferred');--> statement-breakpoint
CREATE TABLE "email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"email_type" text NOT NULL,
	"recipient_email" text NOT NULL,
	"email_service_id" text,
	"status" text DEFAULT 'sent' NOT NULL,
	"metadata" jsonb,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"ticket_type_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"price_per_ticket" numeric(10, 2) NOT NULL,
	"subtotal" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"event_id" uuid NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"service_fee" numeric(10, 2) DEFAULT '0' NOT NULL,
	"payment_status" "order_payment_status" DEFAULT 'pending' NOT NULL,
	"payment_session_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "reservation_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reservation_id" uuid NOT NULL,
	"ticket_type_id" uuid NOT NULL,
	"quantity" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"event_id" uuid NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"status" "reservation_status" DEFAULT 'active' NOT NULL,
	"payment_session_id" text,
	"payment_processor" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_payment_session_id_unique" UNIQUE("payment_session_id")
);
--> statement-breakpoint
CREATE TABLE "ticket_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" numeric(10, 2) NOT NULL,
	"capacity" integer NOT NULL,
	"sold_count" integer DEFAULT 0 NOT NULL,
	"reserved_count" integer DEFAULT 0 NOT NULL,
	"min_per_order" integer DEFAULT 1 NOT NULL,
	"max_per_order" integer DEFAULT 10 NOT NULL,
	"sale_start" timestamp with time zone,
	"sale_end" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"reservation_id" uuid,
	"ticket_type_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"qr_code" text NOT NULL,
	"status" "ticket_status" DEFAULT 'valid' NOT NULL,
	"scanned_at" timestamp with time zone,
	"scanned_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tickets_qr_code_unique" UNIQUE("qr_code")
);
--> statement-breakpoint
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_items" ADD CONSTRAINT "reservation_items_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation_items" ADD CONSTRAINT "reservation_items_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_types" ADD CONSTRAINT "ticket_types_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_reservation_id_reservations_id_fk" FOREIGN KEY ("reservation_id") REFERENCES "public"."reservations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_ticket_type_id_ticket_types_id_fk" FOREIGN KEY ("ticket_type_id") REFERENCES "public"."ticket_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_scanned_by_user_id_fk" FOREIGN KEY ("scanned_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_email_logs_order" ON "email_logs" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_email_logs_recipient" ON "email_logs" USING btree ("recipient_email");--> statement-breakpoint
CREATE INDEX "idx_email_logs_service_id" ON "email_logs" USING btree ("email_service_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_order" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_items_ticket_type" ON "order_items" USING btree ("ticket_type_id");--> statement-breakpoint
CREATE INDEX "idx_orders_user" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_orders_event" ON "orders" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_orders_payment_status" ON "orders" USING btree ("payment_status");--> statement-breakpoint
CREATE INDEX "idx_reservation_items_reservation" ON "reservation_items" USING btree ("reservation_id");--> statement-breakpoint
CREATE INDEX "idx_reservation_items_ticket_type" ON "reservation_items" USING btree ("ticket_type_id");--> statement-breakpoint
CREATE INDEX "idx_reservations_user" ON "reservations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_reservations_event" ON "reservations" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_reservations_expires" ON "reservations" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_reservations_payment_session" ON "reservations" USING btree ("payment_session_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_types_event" ON "ticket_types" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_order" ON "tickets" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_reservation" ON "tickets" USING btree ("reservation_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_ticket_type" ON "tickets" USING btree ("ticket_type_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_user" ON "tickets" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_qr_code" ON "tickets" USING btree ("qr_code");--> statement-breakpoint

-- CHECK constraints for data integrity and preventing overselling
ALTER TABLE "ticket_types" ADD CONSTRAINT "check_capacity_not_exceeded"
  CHECK (sold_count + reserved_count <= capacity);--> statement-breakpoint

ALTER TABLE "ticket_types" ADD CONSTRAINT "check_counts_non_negative"
  CHECK (sold_count >= 0 AND reserved_count >= 0 AND capacity > 0);--> statement-breakpoint

ALTER TABLE "ticket_types" ADD CONSTRAINT "check_order_limits"
  CHECK (min_per_order > 0 AND max_per_order >= min_per_order);