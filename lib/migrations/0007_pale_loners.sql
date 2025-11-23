CREATE TABLE "legacy_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"name" text,
	"description" text,
	"date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"status" boolean DEFAULT false,
	"flyer" text,
	"venue_id" uuid,
	"variable_fee" numeric,
	"fixed_fee" numeric,
	"age" numeric,
	"cash" boolean DEFAULT false NOT NULL,
	"extra_info" text,
	"ics" text,
	"flyer_apple" text,
	"flyer_google" text,
	"flyer_overlay" text,
	"flyer_background" text,
	"flyer_banner" text,
	"pos_fee" numeric,
	"hex" text,
	"priority" boolean DEFAULT false NOT NULL,
	"hex_text" text,
	"guest_list" boolean DEFAULT false NOT NULL,
	"private_list" boolean DEFAULT false NOT NULL,
	"access_pass" boolean DEFAULT false NOT NULL,
	"guest_list_max_hour" timestamp with time zone,
	"guest_list_quantity" numeric,
	"guest_list_info" text,
	"hex_text_secondary" text DEFAULT 'A3A3A3' NOT NULL,
	"late_fee" numeric,
	"guest_email" text,
	"guest_name" text,
	"faqs" jsonb
);
--> statement-breakpoint
ALTER TABLE "legacy_events" ADD CONSTRAINT "legacy_events_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_legacy_events_date" ON "legacy_events" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_legacy_events_end_date" ON "legacy_events" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "idx_legacy_events_status_end_date" ON "legacy_events" USING btree ("status","end_date");