import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventConfigContent } from "@/components/event-config-content";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

interface ConfiguracionPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export default async function ConfiguracionPage({ params }: ConfiguracionPageProps) {
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
  const eventData = {
    id: eventId,
    name: "Concierto de Rock",
    description: "Gran concierto de rock con bandas locales",
    date: "2025-12-15",
    end_date: "2025-12-15",
    status: true,
    age: 18,
    variable_fee: 8,
    fixed_fee: 3000,
    flyer: "/placeholder.svg",
    flyer_apple: undefined,
    venue_id: "venue-1",
    faqs: [],
    venues: {
      id: "venue-1",
      name: "Teatro Principal",
      address: "Calle 100 #10-20",
      city: "Bogotá",
    },
  };

  return (
    <>
      {/* Sticky Header */}
      <EventStickyHeader
        eventName={eventData.name}
        subtitle="Configuración del Evento"
      >
        <EventConfigContent showTabsOnly />
      </EventStickyHeader>

      {/* Content */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventConfigContent showContentOnly eventData={eventData} eventId={eventId} />
      </div>
    </>
  );
}
