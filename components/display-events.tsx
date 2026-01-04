import { EventsWithSearch } from "@/components/events-with-search";
import {
  getEventsWithVenue,
  type PublicEventWithVenue,
} from "@/lib/supabase/actions/events";

interface DisplayEventsProps {
  cityId?: string;
  limit?: number;
}

/**
 * PopularEvents Server Component
 * Fetches events from Supabase and passes them to the client component for filtering
 */
export async function DisplayEvents({ limit = 6 }: DisplayEventsProps) {
  // Fetch popular events directly from Supabase
  const events: PublicEventWithVenue[] = await getEventsWithVenue(limit * 2);

  // Show message if no events found
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-white/70">
          No hay eventos populares disponibles en este momento
        </p>
      </div>
    );
  }

  // Pass events to client component that handles search/filtering
  return <EventsWithSearch events={events} limit={limit} />;
}
