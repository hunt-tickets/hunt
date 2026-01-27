"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { extractSupabasePath } from "@/supabase-image-loader";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { useImageBrightness } from "@/hooks/use-image-brightness";

interface EventData {
  id: string;
  name: string;
  date: string;
  flyer: string | null;
  venues: { name: string; city: string } | null;
}

interface TicketsByEvent {
  [eventId: string]: {
    event: EventData | null;
    tickets: { id: string }[];
  };
}

interface TicketsListProps {
  ticketsByEvent: TicketsByEvent;
  userId: string;
}

interface EventCardProps {
  eventId: string;
  event: EventData | null;
  ticketCount: number;
  userId: string;
}

function EventCard({ eventId, event, ticketCount, userId }: EventCardProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isThemeDark = mounted ? resolvedTheme === "dark" : false;

  // Prepare image
  const safeImage = event?.flyer && typeof event.flyer === "string" && event.flyer.trim() !== "" ? event.flyer : null;
  const supabasePath = safeImage && safeImage.includes("/storage/v1/object/public/") ? extractSupabasePath(safeImage) : "";
  const isSupabaseImage = supabasePath.length > 0;
  const finalSrc = isSupabaseImage ? supabasePath : "/event-placeholder.svg";

  // Analyze image brightness
  const imageForAnalysis = !isThemeDark && isSupabaseImage
    ? `https://db.hunt-tickets.com/storage/v1/render/image/public/${supabasePath}?width=400&quality=75`
    : !isThemeDark ? event?.flyer : null;

  const { isDark: isImageLight } = useImageBrightness(
    imageForAnalysis,
    { sampleHeight: 0.35, threshold: 140 },
  );

  return (
    <Link
      href={`/profile/${userId}/entradas/${eventId}`}
      className="block"
    >
      {/* Event Card */}
      <div className="relative aspect-[3/4] rounded-[20px] overflow-hidden cursor-pointer bg-white/8 border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all group max-w-sm mx-auto w-full">
        {/* Event image */}
        <Image
          src={finalSrc}
          alt={event?.name || "Evento"}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          unoptimized={!isSupabaseImage}
        />

        {/* Tickets count badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-black/40 backdrop-blur-sm border border-gray-400/50 rounded-xl px-3 py-2">
            <div className="text-sm font-bold text-white leading-none">
              {ticketCount} {ticketCount === 1 ? "entrada" : "entradas"}
            </div>
          </div>
        </div>

        {/* Gradient overlay */}
        {isThemeDark ? (
          <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        ) : (
          <ProgressiveBlur
            className="pointer-events-none absolute bottom-0 left-0 h-[30%] w-full"
            direction="bottom"
            blurIntensity={4}
            blurLayers={10}
          />
        )}

        {/* Event info */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 z-10">
          <h2
            className={`text-xl sm:text-lg md:text-xl font-bold text-balance mb-3 line-clamp-2 ${
              isThemeDark ? "text-white" : isImageLight ? "text-zinc-900" : "text-white"
            }`}
          >
            {event?.name || "Evento"}
          </h2>

          <div
            className={`flex items-center gap-2 text-base ${
              isThemeDark ? "text-white/90" : isImageLight ? "text-zinc-700" : "text-white/90"
            }`}
          >
            {event?.venues && <span className="line-clamp-1">{event.venues.city}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function TicketsList({ ticketsByEvent, userId }: TicketsListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(ticketsByEvent).map(([eventId, { event, tickets }]) => (
        <EventCard
          key={eventId}
          eventId={eventId}
          event={event}
          ticketCount={tickets.length}
          userId={userId}
        />
      ))}
    </div>
  );
}
