"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { useImageBrightness } from "@/hooks/use-image-brightness";
import { EVENT_CATEGORY_LABELS, type EventCategory } from "@/constants/event-categories";
import {
  Music2,
  Trophy,
  UtensilsCrossed,
  PartyPopper,
  Users,
  Palette,
  TreePine,
  Heart,
  Briefcase,
  GraduationCap,
  Store,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICONS: Record<EventCategory, LucideIcon> = {
  musica: Music2,
  deportes: Trophy,
  gastronomia: UtensilsCrossed,
  rumba: PartyPopper,
  familiar: Users,
  arte: Palette,
  aire_libre: TreePine,
  bienestar: Heart,
  negocios: Briefcase,
  educacion: GraduationCap,
  mercados: Store,
  otro: MoreHorizontal,
};

interface EventCardProps {
  id: string; // Event ID for navigation
  title: string;
  date: string; // Date string from API
  location: string;
  image: string;
  href?: string; // Optional custom URL (defaults to /eventos/{id})
  onClick?: () => void; // Optional callback when card is clicked
  status?: boolean | null; // Event status: true = active, false = draft
  category?: string | null; // Event category
}

export function EventCard({
  id,
  title,
  date,
  location,
  image,
  href,
  onClick,
  status,
  category,
}: EventCardProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use false (light mode) as default on server to avoid hydration mismatch
  const isThemeDark = mounted ? resolvedTheme === "dark" : false;

  // Analyze image brightness to determine text color (only in light mode)
  const { isDark: isImageLight } = useImageBrightness(
    !isThemeDark ? image : null,
    { sampleHeight: 0.35, threshold: 140 }
  );

  // Parse date and convert from UTC to browser's timezone
  // Handle multiple formats: "2025-11-15 20:00:00+00", "2025-11-15T20:00:00Z", or "2025-11-15"

  let localDate: Date;

  // Check if date is valid and not empty
  if (!date || typeof date !== 'string' || date.trim() === '') {
    localDate = new Date();
  } else {
    // Check if date includes time (has ':' character)
    const hasTime = date.includes(':');

    if (!hasTime) {
      // Date only format: "2025-11-15"
      // Treat as local date, no timezone conversion needed
      localDate = new Date(date + 'T00:00:00');
    } else if (date.includes(' ') && date.includes('+')) {
      // Format: "2025-11-15 20:00:00+00"
      const dateTimeParts = date.split('+')[0].split(' ');
      const isoDateString = `${dateTimeParts[0]}T${dateTimeParts[1]}Z`;
      localDate = new Date(isoDateString);
    } else {
      // Standard ISO format with time
      // Check if it already has timezone info (Z or +/-HH:MM)
      const hasTimezone = date.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(date);
      const dateString = hasTimezone ? date : `${date}Z`;
      localDate = new Date(dateString);
    }

    // Validate the parsed date - if invalid, use current date as fallback
    if (isNaN(localDate.getTime())) {
      console.error(`[EventCard] Invalid date for event "${title}": "${date}"`);
      localDate = new Date();
    }
  }

  // Extract day and month from the date
  const day = localDate.getDate();
  const month = localDate.toLocaleDateString('es-ES', { month: 'short' });

  return (
    <Link
      href={href || `/eventos/${id}`}
      className="block"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] rounded-[20px] overflow-hidden group cursor-pointer bg-white/8 border border-white/10 hover:border-white/20 backdrop-blur-sm">
        {/* Event image with hover effect */}
        <Image
          src={image || "/event-placeholder.svg"}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Status badge in top left corner - only show when status is provided (admin view) */}
        {status !== undefined && (
          <div className="absolute top-4 left-4 z-10">
            <div className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
              status
                ? "bg-emerald-500/90 text-white"
                : "bg-zinc-800/80 text-zinc-300 border border-zinc-600/50"
            }`}>
              {status ? "Activo" : "Borrador"}
            </div>
          </div>
        )}

        {/* Category icon in top left corner - only show on public view (no status) */}
        {status === undefined && category && CATEGORY_ICONS[category as EventCategory] && (() => {
          const CategoryIcon = CATEGORY_ICONS[category as EventCategory];
          const categoryLabel = EVENT_CATEGORY_LABELS[category as EventCategory] || category;
          return (
            <div
              className="absolute top-4 left-4 z-10"
              title={categoryLabel}
            >
              <div className="p-2 rounded-full bg-black/50 backdrop-blur-sm border border-white/20">
                <CategoryIcon className="h-4 w-4 text-white" />
              </div>
            </div>
          );
        })()}

        {/* Date badge in top right corner */}
        <div className="absolute top-4 right-4 z-10">
          <div className={
            isThemeDark
              ? "bg-black/40 backdrop-blur-sm border border-gray-400/50 rounded-xl px-4 py-3 text-center"
              : isImageLight
                ? "bg-white/80 backdrop-blur-sm border border-gray-300/50 rounded-xl px-4 py-3 text-center"
                : "bg-black/40 backdrop-blur-sm border border-gray-400/50 rounded-xl px-4 py-3 text-center"
          }>
            <div
              className={`text-2xl font-bold leading-none ${
                isThemeDark ? "text-white" : (isImageLight ? "text-zinc-900" : "text-white")
              }`}
              suppressHydrationWarning
            >
              {day}
            </div>
            <div
              className={`text-sm uppercase leading-none mt-1 ${
                isThemeDark ? "text-white/90" : (isImageLight ? "text-zinc-700" : "text-white/90")
              }`}
              suppressHydrationWarning
            >
              {month}
            </div>
          </div>
        </div>

        {/* Gradient overlay for text readability in dark mode / Progressive blur in light mode */}
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

        {/* Event information overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6 z-10">
          {/* Event title */}
          <h2 className={`text-xl sm:text-lg md:text-xl font-bold text-balance mb-3 sm:mb-3 line-clamp-2 ${
            isThemeDark ? "text-white" : (isImageLight ? "text-zinc-900" : "text-white")
          }`}>
            {title}
          </h2>

          {/* Event details */}
          <div className={`flex flex-col gap-1.5 sm:gap-1.5 text-base sm:text-base ${
            isThemeDark ? "text-white/90" : (isImageLight ? "text-zinc-700" : "text-white/90")
          }`}>
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
