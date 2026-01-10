"use client";

import { useState, useMemo, useEffect } from "react";
import { Filter } from "lucide-react";
import { EnhancedSearchBar } from "@/components/enhanced-search-bar";
import { EventCard } from "@/components/event-card";
import { CreateEventDialog } from "@/components/create-event-dialog";
import type { EventWithVenue } from "@/lib/helpers/events";

interface AdminEventsListProps {
  events: EventWithVenue[];
  userId: string;
  organizationId: string;
}

const SCROLL_POSITION_KEY = "admin-events-list-scroll";

export function AdminEventsList({
  events,
  userId,
  organizationId,
}: AdminEventsListProps) {
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
    const allEvents = [...events];

    if (!searchQuery.trim()) return allEvents;

    const query = searchQuery.toLowerCase();
    return allEvents.filter(
      (event) => event.name?.toLowerCase().includes(query) || false
    );
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
          <CreateEventDialog
            organizationId={organizationId}
            className="sm:px-6 px-3 sm:rounded-full rounded-full"
          />
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              id={event.id}
              title={event.name || "Sin nombre"}
              date={
                event.date
                  ? typeof event.date === "string"
                    ? event.date
                    : event.date.toISOString()
                  : ""
              }
              location={`${event.venue_name || "Sin venue"}, ${event.venue_city || "Sin ciudad"}`}
              image={event.flyer || "/event-placeholder.svg"}
              href={`/profile/${userId}/organizaciones/${organizationId}/administrador/event/${event.id}`}
              onClick={handleEventClick}
              status={event.status}
              eventType={event.type}
              lifecycleStatus={event.lifecycle_status}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 sm:py-20">
          <div className="mb-6 sm:mb-8">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto">
              <Filter className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-white/30" />
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
            No se encontraron eventos
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-white/60 max-w-md mx-auto px-4">
            {searchQuery
              ? `No hay eventos que coincidan con "${searchQuery}"`
              : "No hay eventos disponibles"}
          </p>
        </div>
      )}
    </>
  );
}
