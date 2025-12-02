import { EventsWithSearch } from "@/components/events-with-search";
import { getPopularEvents, type PopularEventWithVenue } from "@/lib/supabase/actions/events";

interface PopularEventsProps {
  // City ID to fetch popular events for
  cityId?: string;
  // Number of events to display in the grid
  limit?: number;
}

/**
 * PopularEvents Server Component
 * Fetches events from Supabase and passes them to the client component for filtering
 */
export async function PopularEvents({ limit = 6 }: PopularEventsProps) {
  // Fetch popular events directly from Supabase
  const events: PopularEventWithVenue[] = await getPopularEvents(limit * 2);

  // Show message if no events found
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70">
          No hay eventos populares disponibles en este momento
        </p>
      </div>
    );
  }

  // Pass events to client component that handles search/filtering
  return <EventsWithSearch events={events} limit={limit} />;
}
