ALTER TABLE "orders" ADD COLUMN "currency" text DEFAULT 'COP' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "net_amount" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "service_fee";