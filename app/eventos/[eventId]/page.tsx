import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getEventById } from "@/lib/supabase/queries/server/events";
import { ShareButton } from "@/components/share-button";
import { TicketsContainer } from "@/components/tickets-container";

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
  const event = await getEventById(eventId);

  if (!event) {
    return {
      title: "Evento no encontrado",
    };
  }

  return {
    title: `${event.name} | Hunt Tickets`,
    description:
      event.description ||
      `Compra tickets para ${event.name} en ${event.venue_city}`,
    openGraph: {
      title: event.name,
      description: event.description || `Evento en ${event.venue_city}`,
      images: [
        {
          url: event.flyer || "/placeholder.svg",
          width: 1200,
          height: 630,
          alt: event.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: event.name,
      description: event.description || `Evento en ${event.venue_city}`,
      images: [event.flyer || "/placeholder.svg"],
    },
  };
}
// Static Event Route
export default async function EventPage({ params }: EventPageProps) {
  // Await params to get the eventId
  const { eventId } = await params;

  // Fetch event data from the server
  const event = await getEventById(eventId);

  // If event not found, show 404 page
  if (!event) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Image - Full width on mobile */}
      <div className="relative w-full aspect-[3/4] sm:aspect-[16/9] lg:aspect-[21/9] bg-muted">
        <Image
          src={event.flyer || "/placeholder.svg"}
          alt={event.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-top"
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
            {event.name}
          </h1>

          {/* Key Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            {/* Date */}
            <div className="flex gap-3 p-4 rounded-xl bg-muted/50">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">Fecha</p>
                <p
                  className="font-semibold text-sm sm:text-base"
                  suppressHydrationWarning
                >
                  {new Date(event.date).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-xs text-muted-foreground">
                  {event.hour} - {event.end_hour}
                </p>
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
                variableFee={event.variable_fee}
              />
            </div>
          </div>
        </section>
      )}

      {/* Producers section */}
      {event.producers && event.producers.length > 0 && (
        <section className="mt-6">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="bg-background border border-border rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                Organizadores
              </h2>
              <div className="flex flex-wrap gap-4">
                {event.producers.map((producer, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50"
                  >
                    {producer.logo && (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={producer.logo}
                          alt={producer.name}
                          width={40}
                          height={40}
                          className="object-cover"
                        />
                      </div>
                    )}
                    <p className="font-semibold text-sm sm:text-base">
                      {producer.name}
                    </p>
                  </div>
                ))}
              </div>
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
