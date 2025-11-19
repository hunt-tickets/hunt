"use client";

import Image from "next/image";
import Link from "next/link";

interface EventCardProps {
  id: string; // Event ID for navigation
  title: string;
  date: string; // Date string from API
  location: string;
  image: string;
  href?: string; // Optional custom URL (defaults to /eventos/{id})
  onClick?: () => void; // Optional callback when card is clicked
}

export function EventCard({
  id,
  title,
  date,
  location,
  image,
  href,
  onClick,
}: EventCardProps) {
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
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Date badge in top right corner */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/40 backdrop-blur-sm border border-gray-400/50 rounded-xl px-4 py-3 text-center">
            <div className="text-2xl font-bold text-white leading-none">
              {day}
            </div>
            <div className="text-sm text-white/90 uppercase leading-none mt-1">
              {month}
            </div>
          </div>
        </div>

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        {/* Event information overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-6">
          {/* Event title */}
          <h2 className="text-xl sm:text-lg md:text-xl font-bold text-white text-balance mb-3 sm:mb-3 line-clamp-2">
            {title}
          </h2>

          {/* Event details */}
          <div className="flex flex-col gap-1.5 sm:gap-1.5 text-white/90 text-base sm:text-base">
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
