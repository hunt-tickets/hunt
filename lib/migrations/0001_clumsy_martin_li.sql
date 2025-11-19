CREATE TABLE "passkey" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"publicKey" text NOT NULL,
	"userId" text NOT NULL,
	"credentialID" text NOT NULL,
	"counter" integer NOT NULL,
	"deviceType" text NOT NULL,
	"backedUp" boolean NOT NULL,
	"transports" text,
	"createdAt" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"aaguid" text,
	CONSTRAINT "passkey_credentialID_key" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE "payment_processor_account" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"processor_type" "payment_processor_type" NOT NULL,
	"processor_account_id" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"token_expires_at" timestamp,
	"scope" text,
	"status" "payment_processor_status" DEFAULT 'active' NOT NULL,
	"metadata" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "passkey" ADD CONSTRAINT "passkey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_processor_account" ADD CONSTRAINT "payment_processor_account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;how