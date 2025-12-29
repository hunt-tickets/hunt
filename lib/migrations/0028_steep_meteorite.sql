ALTER TABLE "events" ALTER COLUMN "category" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."event_category";--> statement-breakpoint
CREATE TYPE "public"."event_category" AS ENUM('fiestas', 'conciertos', 'festivales', 'bienestar', 'clases', 'ferias', 'deportes', 'teatro');--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "category" SET DATA TYPE "public"."event_category" USING "category"::"public"."event_category";