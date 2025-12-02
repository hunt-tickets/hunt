ALTER TABLE "orders" ADD COLUMN "sold_by" text;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_sold_by_user_id_fk" FOREIGN KEY ("sold_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_orders_sold_by" ON "orders" USING btree ("sold_by");