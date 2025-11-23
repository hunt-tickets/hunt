import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventAdvancesContent } from "@/components/event-advances-content";
import { EventStickyHeader } from "@/components/event-sticky-header";

interface AvancesPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
  }>;
}

export default async function AvancesPage({ params }: AvancesPageProps) {
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
  };

  // Mock advances data - In production, fetch from database
  const advances = [
    {
      id: "advance-1",
      amount: 2000000,
      status: "completed",
      created_at: new Date().toISOString(),
      description: "Anticipo inicial",
    },
  ];

  // Mock financial report - In production, fetch from database
  const financialReport = {
    timestamp: new Date().toISOString(),
    totalRevenue: 5000000,
    totalTicketsSold: 100,
    platformFee: 400000,
    netRevenue: 4600000,
  };

  return (
    <>
      {/* Sticky Header */}
      <EventStickyHeader eventName={event.name} subtitle="Avances de Pago" />

      {/* Content */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventAdvancesContent
          eventId={eventId}
          advances={advances || []}
          financialReport={financialReport}
        />
      </div>
    </>
  );
}
