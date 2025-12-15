"use client";

import { useState, useMemo, useEffect } from "react";
import { Filter } from "lucide-react";
import { EnhancedSearchBar } from "@/components/enhanced-search-bar";
import { EventCard } from "@/components/event-card";
import { CreateEventDialog } from "@/components/create-event-dialog";
import type { EventWithVenue } from "@/lib/supabase/actions/events";

interface VenueOption {
  id: string;
  name: string;
}

interface AdminEventsListProps {
  events: EventWithVenue[];
  userId: string;
  eventVenues?: VenueOption[];
  organizationId: string;
}

const SCROLL_POSITION_KEY = 'admin-events-list-scroll';

export function AdminEventsList({ events, userId, eventVenues = [], organizationId }: AdminEventsListProps) {
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

  // Hardcoded test events - TODO: Remove these after testing
  const testEvents = [
    {
      id: "test-event-1",
      name: "Festival de Música Electrónica 2025",
      date: new Date("2025-12-20T20:00:00"),
      flyer: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=1200&auto=format&fit=crop",
      venue_name: "Parque Simón Bolívar",
      venue_city: "Bogotá",
    },
    {
      id: "test-event-2",
      name: "Concierto Rock en Vivo",
      date: new Date("2025-12-25T19:00:00"),
      flyer: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1200&auto=format&fit=crop",
      venue_name: "Royal Center",
      venue_city: "Medellín",
    },
    {
      id: "test-event-3",
      name: "Festival Gastronómico de Cali",
      date: new Date("2025-12-28T12:00:00"),
      flyer: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1200&auto=format&fit=crop",
      venue_name: "Plaza de Cayzedo",
      venue_city: "Cali",
    },
    {
      id: "test-event-4",
      name: "Noche de Jazz y Blues",
      date: new Date("2026-01-05T21:00:00"),
      flyer: "https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=1200&auto=format&fit=crop",
      venue_name: "Teatro Jorge Eliécer Gaitán",
      venue_city: "Bogotá",
    },
    {
      id: "test-event-5",
      name: "Carnaval de Barranquilla",
      date: new Date("2026-02-14T10:00:00"),
      flyer: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200&auto=format&fit=crop",
      venue_name: "Vía 40",
      venue_city: "Barranquilla",
    },
    {
      id: "test-event-6",
      name: "Festival de Cine Independiente",
      date: new Date("2026-03-01T16:00:00"),
      flyer: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200&auto=format&fit=crop",
      venue_name: "Cinemateca Distrital",
      venue_city: "Bogotá",
    },
    {
      id: "test-event-7",
      name: "Maratón de Bogotá 2026",
      date: new Date("2026-07-27T06:00:00"),
      flyer: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=1200&auto=format&fit=crop",
      venue_name: "Parque El Virrey",
      venue_city: "Bogotá",
    },
    {
      id: "test-event-8",
      name: "Festival de Teatro Callejero",
      date: new Date("2026-08-15T15:00:00"),
      flyer: "https://images.unsplash.com/photo-1503095396549-807759245b35?q=80&w=1200&auto=format&fit=crop",
      venue_name: "Centro Histórico",
      venue_city: "Cartagena",
    },
  ];

  // Efficient client-side filtering using useMemo
  const filteredEvents = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allEvents = [...(testEvents as any[]), ...events]; // Add test events at the beginning

    if (!searchQuery.trim()) return allEvents;

    const query = searchQuery.toLowerCase();
    return allEvents.filter((event) =>
      event.name?.toLowerCase().includes(query) || false
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
          <CreateEventDialog eventVenues={eventVenues} organizationId={organizationId} className="sm:px-6 px-3 sm:rounded-full rounded-full" />
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
              date={event.date ? event.date.toISOString() : ""}
              location={`${event.venue_name || "Sin venue"}, ${event.venue_city || "Sin ciudad"}`}
              image={event.flyer || "/placeholder.svg"}
              href={`/profile/${userId}/organizaciones/${organizationId}/administrador/event/${event.id}`}
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
