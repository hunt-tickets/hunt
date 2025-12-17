ALTER TABLE "payment_processor_account" ALTER COLUMN "organization_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "tipo_organizacion" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "nombres" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "apellidos" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "tipo_documento" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "numero_documento" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "nit" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "direccion" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "numero_telefono" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "correo_electronico" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "rut_url" text;--> statement-breakpoint
ALTER TABLE "organization" ADD COLUMN "cerl_url" text;--> statement-breakpoint
ALTER TABLE "ticket_types" ADD COLUMN "active" boolean;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "tipo_persona" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "nombres" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "apellidos" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "razon_social" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "nit" text;