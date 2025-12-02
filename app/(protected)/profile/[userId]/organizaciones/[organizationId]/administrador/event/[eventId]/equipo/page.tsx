import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventTeamContent } from "@/components/event-team-content";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

interface EquipoPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export default async function EquipoPage({ params }: EquipoPageProps) {
  const { userId, eventId, organizationId } = await params;
  const reqHeaders = await headers();

  // Auth check
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
  }

  // Verify user is a member of the organization
  const memberRecord = await db.query.member.findFirst({
    where: and(
      eq(member.userId, userId),
      eq(member.organizationId, organizationId)
    ),
  });

  if (!memberRecord) {
    notFound();
  }

  // Check if user can manage events (sellers cannot)
  const canManageEvents = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { event: ["update"] },
      organizationId,
    },
  });

  if (!canManageEvents?.success) {
    redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/vender`);
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
      id: "event-producer-1",
      created_at: new Date().toISOString(),
      producer: {
        id: "producer-1",
        name: "Mi Productora",
        logo: null,
      },
    },
  ];

  const artists = [
    {
      id: "event-artist-1",
      created_at: new Date().toISOString(),
      artist: {
        id: "artist-1",
        name: "Banda de Rock",
        description: null,
        category: null,
        logo: null,
      },
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
      description: null,
      category: null,
      logo: null,
    },
    {
      id: "artist-2",
      name: "DJ Electrónico",
      description: null,
      category: null,
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
