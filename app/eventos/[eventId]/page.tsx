import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEventById } from "@/lib/helpers/events";
import { ShareButton } from "@/components/share-button";
import { TicketsContainer } from "@/components/tickets-container";
import { db } from "@/lib/drizzle";
import { documentType, countries } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { extractSupabasePath } from "@/supabase-image-loader";
import EventPageImage from "@/components/event-page-image";

interface EventPageProps {
  params: Promise<{
    eventId: string;
  }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { eventId } = await params;
  const { data: event } = await getEventById(eventId);

  if (!event) {
    return {
      title: "Evento no encontrado",
    };
  }

  return {
    title: `${event.name || "Evento"} | Hunt Tickets`,
    description:
      event.description ||
      `Compra tickets para ${event.name || "este evento"} en ${event.venue_city}`,
    // openGraph: {
    //   title: event.name || "Evento",
    //   description: event.description || `Evento en ${event.venue_city}`,
    //   // images: [
    //   //   {
    //   //     url: event.flyer || "/event-placeholder.svg",
    //   //     width: 1200,
    //   //     height: 630,
    //   //     alt: event.name || "Evento",
    //   //   },
    //   // ],
    //   type: "website",
    // },
    // twitter: {
    //   card: "summary_large_image",
    //   title: event.name || "Evento",
    //   description: event.description || `Evento en ${event.venue_city}`,
    //   // images: [event.flyer || "/event-placeholder.svg"],
    // },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { eventId } = await params;

  const [{ data: event }, documentTypes] = await Promise.all([
    getEventById(eventId),

    // Fetch document types for billing form (Colombia)
    db
      .select({ id: documentType.id, name: documentType.name })
      .from(documentType)
      .innerJoin(countries, eq(documentType.countryId, countries.id))
      .where(eq(countries.countryCode, "CO")),
  ]);

  if (!event) {
    notFound();
  }

  // Single, reliable rule for how src is produced
  // Convert to RELATIVE PATH at render time (only for Supabase images)
  const safeImage =
    typeof event.flyer === "string" && event.flyer.trim() !== ""
      ? event.flyer
      : null;

  const supabasePath =
    safeImage && safeImage.includes("/storage/v1/object/public/")
      ? extractSupabasePath(safeImage)
      : "";

  const isSupabaseImage = supabasePath.length > 0;

  const finalSrc = isSupabaseImage ? supabasePath : "/event-placeholder.svg";

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Image - Full width on mobile */}
      <div className="relative w-full aspect-[3/4] sm:aspect-[16/9] lg:aspect-[21/9] bg-muted">
        <EventPageImage
          alt={event.name || "Evento"}
          isSupabaseImage={isSupabaseImage}
          relativePathSrc={finalSrc}
        />
        {/* Gradient overlay - only in dark mode */}
        <div className="absolute inset-0 dark:bg-gradient-to-t dark:from-background dark:via-background/60 dark:to-transparent" />
      </div>

      {/* Content Container */}
      <div className="container mx-auto max-w-4xl px-4 -mt-32 relative z-10">
        {/* Event Card */}
        <div className="bg-background/95 backdrop-blur-sm border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
          {/* Badge and Share Button */}
          <div className="flex items-center justify-between mb-4">
            <Badge className="bg-primary text-primary-foreground">Evento</Badge>
            <ShareButton variant="button" />
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-balance">
            {event.name || "Evento"}
          </h1>

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Date - different display for multi-day events */}
            <div className="flex gap-3 p-4 rounded-xl bg-muted/50">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">
                  {event.eventType === "multi_day" && event.eventDays.length > 0
                    ? "Fechas"
                    : "Fecha"}
                </p>
                {event.eventType === "multi_day" &&
                event.eventDays.length > 0 ? (
                  <>
                    <p
                      className="font-semibold text-sm sm:text-base"
                      suppressHydrationWarning
                    >
                      {event.eventDays[0].date.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                      {" - "}
                      {event.eventDays[
                        event.eventDays.length - 1
                      ].date.toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.eventDays.length} días
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className="font-semibold text-sm sm:text-base"
                      suppressHydrationWarning
                    >
                      {event.date
                        ? new Date(event.date).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "Fecha por confirmar"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {event.hour} - {event.end_hour}
                    </p>
                  </>
                )}
              </div>
            </div>
            {/* Location */}
            <div className="flex gap-3 p-4 rounded-xl bg-muted/50">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Lugar</p>
                <p className="font-semibold text-sm sm:text-base truncate">
                  {event.venue_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {event.venue_city}
                </p>
              </div>
            </div>
            {/* Age */}
            {event.age && (
              <div className="flex gap-3 p-4 rounded-xl bg-muted/50 sm:col-span-2">
                <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Edad mínima
                  </p>
                  <p className="font-semibold">{event.age}+ años</p>
                </div>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            className="w-full text-base h-12 sm:h-14"
            disabled={!event.tickets || event.tickets.length === 0}
            asChild={event.tickets && event.tickets.length > 0}
          >
            {event.tickets && event.tickets.length > 0 ? (
              <a href="#tickets">Comprar Tickets</a>
            ) : (
              <span>Sin tickets disponibles</span>
            )}
          </Button>
        </div>
      </div>

      {/* Event description section */}
      {event.description && (
        <section className="mt-6">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="bg-background border border-border rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                Acerca del evento
              </h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                {event.description}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Tickets section */}
      {event.tickets && event.tickets.length > 0 && (
        <section id="tickets" className="mt-6">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="bg-background border border-border rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-6">
                Tickets Disponibles
              </h2>
              {/*
                RSC Optimization: The Ticket[] array is sent in the RSC payload
                Since we need all ticket data (name, price, description) for the UI,
                we pass the full array. The optimization comes from:
                1. Server component wrapper (static HTML rendered on server)
                2. Client islands pattern (only interactive parts are client components)
                3. State managed in client only when needed (quantity selection)
              */}
              <TicketsContainer
                tickets={event.tickets}
                eventId={event.id}
                eventType={event.eventType}
                eventDays={event.eventDays}
                documentTypes={documentTypes}
              />
            </div>
          </div>
        </section>
      )}

      {/* Venue location section */}
      {event.venue_latitude && event.venue_longitude && (
        <section className="mt-6">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="bg-background border border-border rounded-2xl overflow-hidden">
              {/* Venue Info Header */}
              <div className="p-4 sm:p-6 border-b border-border">
                <h2 className="text-lg sm:text-xl font-bold mb-1">
                  {event.venue_name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {event.venue_city}
                </p>
              </div>

              {/* Google Maps embed */}
              <div className="relative w-full h-[300px] sm:h-[350px]">
                <iframe
                  src={`https://maps.google.com/maps?q=${event.venue_latitude},${event.venue_longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Mapa de ${event.venue_name}`}
                />
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
