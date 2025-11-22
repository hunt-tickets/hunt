-- Create gender enum type
CREATE TYPE "public"."gender_type" AS ENUM('masculino', 'femenino', 'otro', 'prefiero_no_decir');--> statement-breakpoint

-- Create countries table
CREATE TABLE "countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_name" text NOT NULL,
	"country_code" text,
	"currency" text NOT NULL,
	CONSTRAINT "countries_country_name_key" UNIQUE("country_name")
);
--> statement-breakpoint

-- Create document_type table
CREATE TABLE "document_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_id" uuid NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint

-- Add new user profile fields
ALTER TABLE "user" ADD COLUMN "document_id" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "document_type_id" uuid;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "gender" "gender_type";--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "birthdate" timestamp with time zone;--> statement-breakpoint

-- Add foreign key constraints for new tables
ALTER TABLE "document_type" ADD CONSTRAINT "document_type_country_id_countries_id_fk" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_document_type_id_document_type_id_fk" FOREIGN KEY ("document_type_id") REFERENCES "public"."document_type"("id") ON DELETE no action ON UPDATE no action;
