import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventProducers, getEventArtists, getAllProducers, getAllArtists } from "@/lib/supabase/actions/tickets";
import { EventTeamContent } from "@/components/event-team-content";
import { EventStickyHeader } from "@/components/event-sticky-header";

interface EquipoPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
  }>;
}

export default async function EquipoPage({ params }: EquipoPageProps) {
  const { userId, eventId } = await params;
  const supabase = await createClient();

  // Auth check
  if (!userId) {
    redirect("/login");
  }

  // Get user profile to verify admin/producer access
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, admin, producers_admin(producer_id)")
    .eq("id", userId)
    .single();

  const producersAdmin = Array.isArray(profile?.producers_admin)
    ? profile.producers_admin
    : profile?.producers_admin
    ? [profile.producers_admin]
    : [];
  const isProducer = producersAdmin.length > 0;

  if (!profile?.admin && !isProducer) {
    notFound();
  }

  // Fetch event details, producers, and artists
  const [eventData, producers, artists, allProducers, allArtists] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, status, date, end_date")
      .eq("id", eventId)
      .single(),
    getEventProducers(eventId),
    getEventArtists(eventId),
    getAllProducers(),
    getAllArtists(),
  ]);

  if (eventData.error || !eventData.data) {
    notFound();
  }

  const event = eventData.data;

  return (
    <>
      {/* Sticky Header */}
      <EventStickyHeader
        eventName={event.name}
        subtitle="Gestión de Equipo"
      >
        <EventTeamContent
          eventId={eventId}
          producers={producers || []}
          artists={artists || []}
          allProducers={allProducers || []}
          allArtists={allArtists || []}
          eventStartDate={event.date}
          eventEndDate={event.end_date}
          showTabsOnly
        />
      </EventStickyHeader>

      {/* Content */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventTeamContent
          eventId={eventId}
          producers={producers || []}
          artists={artists || []}
          allProducers={allProducers || []}
          allArtists={allArtists || []}
          eventStartDate={event.date}
          eventEndDate={event.end_date}
          showContentOnly
        />
      </div>
    </>
  );
}
