import { getEventsWithVenue } from "@/lib/supabase/actions/events";
import { EventsWithSearch } from "@/components/events-with-search";

/**
 * Eventos Page - Shows all active events (status=true)
 * Server Component that fetches all active events from the database
 */
export default async function EventosPage() {
  // Fetch all active events from Supabase (status=true and end_date >= now)
  const events = await getEventsWithVenue(100);

  // Show message if no events found
  if (!events || events.length === 0) {
    return (
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No hay eventos disponibles en este momento
          </p>
        </div>
      </div>
    );
  }

  // Pass all events to client component that handles search/filtering
  return (
    <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <EventsWithSearch events={events} limit={events.length} />
    </div>
  );
}
