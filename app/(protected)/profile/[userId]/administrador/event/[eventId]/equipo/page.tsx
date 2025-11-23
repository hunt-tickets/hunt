import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
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

  // Auth check using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
  }

  // Mock: Get user profile to verify admin/producer access
  const profile = {
    id: userId,
    admin: true,
    producers_admin: [{ producer_id: "mock-producer-1" }],
  };

  const producersAdmin = Array.isArray(profile?.producers_admin)
    ? profile.producers_admin
    : profile?.producers_admin
    ? [profile.producers_admin]
    : [];
  const isProducer = producersAdmin.length > 0;

  if (!profile?.admin && !isProducer) {
    notFound();
  }

  // Mock event data - In production, fetch from database
  const event = {
    id: eventId,
    name: "Concierto de Rock",
    status: true,
    date: "2025-12-15",
    end_date: "2025-12-15",
  };

  // Mock producers and artists - In production, fetch from database
  const producers = [
    {
      id: "producer-1",
      name: "Mi Productora",
      logo: null,
    },
  ];

  const artists = [
    {
      id: "artist-1",
      name: "Banda de Rock",
      logo: null,
    },
  ];

  const allProducers = [
    {
      id: "producer-1",
      name: "Mi Productora",
      logo: null,
    },
    {
      id: "producer-2",
      name: "Otra Productora",
      logo: null,
    },
  ];

  const allArtists = [
    {
      id: "artist-1",
      name: "Banda de Rock",
      logo: null,
    },
    {
      id: "artist-2",
      name: "DJ Electrónico",
      logo: null,
    },
  ];

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
