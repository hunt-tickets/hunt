-- Create gender enum type (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE "public"."gender_type" AS ENUM('masculino', 'femenino', 'otro', 'prefiero_no_decir');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

-- Create countries table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "countries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_name" text NOT NULL,
	"country_code" text,
	"currency" text NOT NULL,
	CONSTRAINT "countries_country_name_key" UNIQUE("country_name")
);
--> statement-breakpoint

-- Create document_type table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS "document_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"country_id" uuid NOT NULL,
	"name" text NOT NULL
);
--> statement-breakpoint

-- Add new user profile fields (only if they don't exist)
DO $$ BEGIN
    ALTER TABLE "user" ADD COLUMN "document_id" text;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "user" ADD COLUMN "document_type_id" uuid;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "user" ADD COLUMN "gender" "gender_type";
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "user" ADD COLUMN "birthdate" timestamp with time zone;
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;
--> statement-breakpoint

-- Add foreign key constraints (only if they don't exist)
DO $$ BEGIN
    ALTER TABLE "document_type" ADD CONSTRAINT "document_type_country_id_countries_id_fk"
        FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

DO $$ BEGIN
    ALTER TABLE "user" ADD CONSTRAINT "user_document_type_id_document_type_id_fk"
        FOREIGN KEY ("document_type_id") REFERENCES "public"."document_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
