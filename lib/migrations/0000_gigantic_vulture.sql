-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."account_type_enum" AS ENUM('savings', 'checking', 'business', 'other');--> statement-breakpoint
CREATE TYPE "public"."adjustment_type" AS ENUM('debit', 'credit', 'refund', 'fee', 'penalty', 'bonus');--> statement-breakpoint
CREATE TYPE "public"."discount_code_type" AS ENUM('percentage', 'fixed_amount');--> statement-breakpoint
CREATE TYPE "public"."discount_type" AS ENUM('percentage', 'fixed_amount', 'free');--> statement-breakpoint
CREATE TYPE "public"."document_type_enum" AS ENUM('CC', 'CE', 'DNI', 'RUT', 'RFC', 'CPF', 'PASSPORT', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."event_language" AS ENUM('en', 'es', 'fr', 'pt', 'it', 'de');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('draft', 'published', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."event_status_type" AS ENUM('draft', 'active', 'inactive', 'sold_out', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."fee_payment_type" AS ENUM('absorver_fees', 'dividir_fee', 'pasar_fees');--> statement-breakpoint
CREATE TYPE "public"."frequency_type" AS ENUM('single', 'recurring');--> statement-breakpoint
CREATE TYPE "public"."language_type" AS ENUM('es', 'en', 'pt', 'fr');--> statement-breakpoint
CREATE TYPE "public"."payment_processor_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."payment_processor_type" AS ENUM('stripe', 'mercadopago');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."privacy_type" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('pending', 'accepted', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('seller', 'admin', 'owner');--> statement-breakpoint
CREATE TYPE "public"."theme_mode_type" AS ENUM('light', 'dark', 'adaptive');--> statement-breakpoint
CREATE TYPE "public"."ticket_trigger_type" AS ENUM('automatic', 'manually');--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"role" text,
	"banned" boolean,
	"banReason" text,
	"banExpires" timestamp with time zone,
	"isAnonymous" boolean,
	"phoneNumber" text,
	"phoneNumberVerified" boolean,
	"userMetadata" jsonb,
	"appMetadata" jsonb,
	"invitedAt" timestamp with time zone,
	"lastSignInAt" timestamp with time zone,
	CONSTRAINT "user_email_key" UNIQUE("email"),
	CONSTRAINT "user_phoneNumber_key" UNIQUE("phoneNumber")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"userId" text NOT NULL,
	"impersonatedBy" text,
	CONSTRAINT "session_token_key" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"userId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"idToken" text,
	"accessTokenExpiresAt" timestamp with time zone,
	"refreshTokenExpiresAt" timestamp with time zone,
	"scope" text,
	"password" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
*/