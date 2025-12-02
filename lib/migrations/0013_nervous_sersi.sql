CREATE TYPE "public"."order_from" AS ENUM('cash', 'web', 'app');--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "order_from" "order_from" DEFAULT 'cash' NOT NULL;