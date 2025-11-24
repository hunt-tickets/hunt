import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventConfigContent } from "@/components/event-config-content";
import { EventStickyHeader } from "@/components/event-sticky-header";

interface ConfiguracionPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
  }>;
}

export default async function ConfiguracionPage({ params }: ConfiguracionPageProps) {
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
