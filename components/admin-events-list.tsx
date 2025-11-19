"use client";

import { useState, useMemo, useEffect } from "react";
import { Filter } from "lucide-react";
import { EnhancedSearchBar } from "@/components/enhanced-search-bar";
import { EventCard } from "@/components/event-card";
import { CreateEventDialog } from "@/components/create-event-dialog";
import type { EventFull } from "@/lib/supabase/types";

interface VenueOption {
  id: string;
  name: string;
}

interface AdminEventsListProps {
  events: EventFull[];
  userId: string;
  eventVenues?: VenueOption[];
}

const SCROLL_POSITION_KEY = 'admin-events-list-scroll';

export function AdminEventsList({ events, userId, eventVenues = [] }: AdminEventsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Restore scroll position when component mounts
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(SCROLL_POSITION_KEY);
    if (savedScrollPosition) {
      // Use setTimeout to ensure DOM is ready
      setTimeout(() => {
        window.scrollTo(0, parseInt(savedScrollPosition, 10));
        // Clear the saved position after restoring
        sessionStorage.removeItem(SCROLL_POSITION_KEY);
      }, 0);
    }
  }, []);

  // Save scroll position before navigating
  const handleEventClick = () => {
    sessionStorage.setItem(SCROLL_POSITION_KEY, window.scrollY.toString());
  };

  // Efficient client-side filtering using useMemo
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;

    const query = searchQuery.toLowerCase();
    return events.filter((event) => event.name?.toLowerCase().includes(query));
  }, [events, searchQuery]);

  return (
    <>
      {/* Search Bar and Create Button */}
      <div className="flex flex-row gap-3 mb-6">
        <div className="flex-1">
          <EnhancedSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
        <div className="flex items-center">
          <CreateEventDialog eventVenues={eventVenues} className="sm:px-6 px-3 sm:rounded-full rounded-full" />
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.name}
              date={event.date}
              location={`${event.venue_name}, ${event.venue_city}`}
              image={event.flyer}
              href={`/profile/${userId}/administrador/event/${event.id}`}
              onClick={handleEventClick}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 sm:py-20">
          <div className="inline-flex p-4 bg-white/5 rounded-2xl border border-white/10 mb-6">
            <Filter className="h-12 w-12 text-white/60" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
            No se encontraron eventos
          </h3>
          <p className="text-white/60 mb-6 max-w-md mx-auto">
            {searchQuery
              ? `No hay eventos que coincidan con "${searchQuery}"`
              : "No hay eventos disponibles"}
          </p>
        </div>
      )}
    </>
  );
}
