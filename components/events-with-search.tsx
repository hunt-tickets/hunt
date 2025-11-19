"use client";

import { useState, useMemo } from "react";
import { EventCard } from "@/components/event-card";
import { EnhancedSearchBar } from "@/components/enhanced-search-bar";
import { EnhancedCityFilter } from "@/components/enhanced-city-filter";
import { Filter } from "lucide-react";
import type { EventFull } from "@/lib/supabase/types";

interface EventsWithSearchProps {
  // All events from server
  events: EventFull[];
  // Number of events to display in grid
  limit?: number;
}

export function EventsWithSearch({ events, limit = 6 }: EventsWithSearchProps) {
  // State for search query
  const [searchQuery, setSearchQuery] = useState("");
  // State for selected city filter
  const [selectedCity, setSelectedCity] = useState<string | null>(null);

  /**
   * Extract unique cities from events using useMemo
   *
   * WHY useMemo:
   * - This computation involves array operations (.map, .filter, Set creation, Array.from, .sort)
   * - Without useMemo: runs on EVERY render (when searchQuery changes, when selectedCity changes, etc.)
   * - With useMemo: only runs when `events` array changes
   * - Prevents unnecessary recalculations when user types in search bar
   *
   * TECHNICAL REASONING:
   * - React re-renders components when state changes (searchQuery, selectedCity)
   * - Each re-render would create a new cities array with new object references
   * - This would cause CityFilter to re-render unnecessarily (React.memo would fail)
   * - useMemo caches the result and returns same reference until dependencies change
   *
   * DEPENDENCY: [events]
   * - Only recalculate when the events array from server changes
   * - Events array is stable (comes from server props, doesn't change during filtering)
   */
  const cities = useMemo(() => {
    const uniqueCities = new Set(
      events
        .map((event) => event.venue_city)
        .filter((city) => city && city !== "Ciudad") // Filter out default/empty values
    );
    return Array.from(uniqueCities).sort();
  }, [events]);

  /**
   * Filter events based on search query and city using useMemo
   *
   * WHY useMemo:
   * - Filtering can be expensive with large event arrays (O(n) complexity)
   * - String operations (.toLowerCase(), .includes()) are called multiple times per event
   * - Without useMemo: filters run on every render, even when dependencies haven't changed
   * - With useMemo: only filters when search/city/events actually change
   *
   * TECHNICAL REASONING:
   * - React batches state updates but still causes re-renders
   * - Any parent re-render would trigger this component to re-render
   * - Memoizing prevents redundant filtering computations
   * - Returns same array reference if dependencies unchanged (important for child components)
   *
   * DEPENDENCIES: [events, selectedCity, searchQuery]
   * - events: when server data changes
   * - selectedCity: when user selects different city
   * - searchQuery: when user types in search
   *
   * PERFORMANCE IMPACT:
   * - For 100 events with 5 filters each = 500 operations per render
   * - User typing = potentially 10+ renders per second
   * - Without memo: 5000+ operations/second while typing
   * - With memo: ~500 operations only when dependencies change
   */
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Apply city filter first
    if (selectedCity) {
      filtered = filtered.filter((event) => event.venue_city === selectedCity);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((event) => {
        const includes = (str: string | null | undefined) =>
          str?.toLowerCase().includes(lowerQuery) ?? false;

        return (
          includes(event.name) ||
          includes(event.description) ||
          includes(event.venue_name) ||
          includes(event.venue_city)
        );
      });
    }

    return filtered;
  }, [events, selectedCity, searchQuery]);

  // Handle search query changes
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle city filter changes
  const handleCityChange = (city: string | null) => {
    setSelectedCity(city);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCity(null);
  };

  return (
    <>
      {/* Search and Filter Bar */}
      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        {/* Search and filter row */}
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 w-full">
          <div className="flex-1">
            <EnhancedSearchBar searchQuery={searchQuery} onSearchChange={handleSearch} />
          </div>
          <div className="w-full sm:w-64 lg:w-72">
            <EnhancedCityFilter
              cities={cities}
              selectedCity={selectedCity}
              onCityChange={handleCityChange}
            />
          </div>
        </div>

        {/* Active filters indicator */}
        {(searchQuery || selectedCity) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-white/60">
              {filteredEvents.length} de {events.length} eventos
            </span>
            <button
              onClick={resetFilters}
              className="text-sm text-white/70 hover:text-white transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Show message if no events found after filtering */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 sm:py-16 md:py-20">
          <div className="inline-flex p-3 sm:p-4 bg-white/5 rounded-xl sm:rounded-2xl border border-white/10 mb-4 sm:mb-6">
            <Filter className="h-10 w-10 sm:h-12 sm:w-12 text-white/60" />
          </div>
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 px-4">
            No se encontraron eventos
          </h3>
          <p className="text-sm sm:text-base text-white/60 mb-5 sm:mb-6 max-w-md mx-auto px-4">
            {selectedCity && `No hay eventos disponibles en ${selectedCity}`}
            {searchQuery && !selectedCity && `No hay eventos que coincidan con "${searchQuery}"`}
            {searchQuery && selectedCity && ` que coincidan con "${searchQuery}"`}
          </p>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 sm:px-6 sm:py-3 bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 rounded-full text-white text-sm sm:text-base font-medium transition-all duration-300"
          >
            Mostrar todos los eventos
          </button>
        </div>
      ) : (
        /* Grid of Popular Events - 3 columns layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 pb-12 sm:pb-16 md:pb-24">
          {filteredEvents.slice(0, limit).map((event, index) => (
            <EventCard
              key={`${event.id}-${index}`}
              id={event.id}
              title={event.name}
              date={event.date}
              location={`${event.venue_name}, ${event.venue_city}`}
              image={event.flyer}
            />
          ))}
        </div>
      )}
    </>
  );
}
