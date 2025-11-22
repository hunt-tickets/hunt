CREATE TYPE "public"."gender_type" AS ENUM('masculino', 'femenino', 'otro', 'prefiero_no_decir');--> statement-breakpoint
CREATE TABLE "countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_name" text NOT NULL,
	"country_code" text,
	"currency" text NOT NULL,
	CONSTRAINT "countries_country_name_key" UNIQUE("country_name")
);
--> statement-breakpoint
CREATE TABLE "document_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_id" uuid NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organization_id" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	"name" text,
	"description" text,
	"date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"status" boolean DEFAULT false,
	"city" text,
	"country" text,
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
CREATE TABLE "legacy_venues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"address" text NOT NULL,
	"city" uuid,
	"logo" text,
	"latitude" text,
	"longitude" text,
	"banner" text,
	"link" text,
	"static_map_url" text,
	"google_name" text,
	"google_street_number" text,
	"google_neighborhood" text,
	"google_route" text,
	"google_sublocality" text,
	"google_locality" text,
	"google_area_level_1" text,
	"google_area_level_2" text,
	"google_postal_code" text,
	"google_country" text,
	"google_country_code" text,
	"google_id" text,
	"google_maps_link" text,
	"timezone_id" text,
	"timezone_name" text,
	"utc_offset" numeric,
	"dts_offset" numeric,
	"google_total_reviews" text,
	"google_avg_rating" text,
	"google_website_url" text,
	"google_phone_number" text,
	"currency_code" text,
	"wheelchair_accessible" boolean,
	"venue_type" text,
	"ai_description" text,
	"instagram" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "venues" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"address" text,
	"city" text,
	"country" text,
	"postal_code" text,
	"state" text,
	"latitude" text,
	"longitude" text,
	"logo" text,
	"banner" text,
	"link" text,
	"static_map_url" text,
	"google_id" text,
	"google_name" text,
	"google_maps_link" text,
	"google_locality" text,
	"google_area_level_1" text,
	"google_postal_code" text,
	"google_country" text,
	"google_country_code" text,
	"google_phone_number" text,
	"google_website_url" text,
	"google_avg_rating" text,
	"google_total_reviews" text,
	"timezone_id" text,
	"timezone_name" text,
	"utc_offset" numeric,
	"dts_offset" numeric,
	"currency_code" text,
	"wheelchair_accessible" boolean,
	"venue_type" text,
	"ai_description" text,
	"instagram" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "document_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "document_type_id" uuid;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "gender" "gender_type";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "birthdate" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "document_type" ADD CONSTRAINT "document_type_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "document_type" ADD CONSTRAINT "document_type_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_venue_id_venues_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "legacy_events" ADD CONSTRAINT "legacy_events_legacy_venuId_fkey" FOREIGN KEY ("venue_id") REFERENCES "public"."legacy_venues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_events_organization_id" ON "events" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_events_date" ON "events" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_events_end_date" ON "events" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "idx_events_status_end_date" ON "events" USING btree ("status","end_date");--> statement-breakpoint
CREATE INDEX "idx_events_date_range" ON "events" USING btree ("date","end_date");--> statement-breakpoint
CREATE INDEX "idx_events_org_status_date" ON "events" USING btree ("organization_id","status","date");--> statement-breakpoint
CREATE INDEX "idx_legacy_events_date" ON "legacy_events" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_legacy_events_end_date" ON "legacy_events" USING btree ("end_date");--> statement-breakpoint
CREATE INDEX "idx_legacy_events_status_end_date" ON "legacy_events" USING btree ("status","end_date");--> statement-breakpoint
CREATE INDEX "idx_legacy_venues_name" ON "legacy_venues" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_venues_name" ON "venues" USING btree ("name");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_document_type_id_document_type_id_fk" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_type"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_document_type_id_fkey" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_type"("id") ON DELETE no action ON UPDATE no action;