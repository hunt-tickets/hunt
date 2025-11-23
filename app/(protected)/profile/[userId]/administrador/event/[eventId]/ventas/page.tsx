import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventSalesContent } from "@/components/event-sales-content";
import { EventStickyHeader } from "@/components/event-sticky-header";

interface VentasPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
  }>;
}

export default async function VentasPage({ params }: VentasPageProps) {
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
  };

  // Mock transactions - In production, fetch from database
  const transactions = [
    {
      id: "trans-1",
      created_at: new Date().toISOString(),
      amount: 50000,
      status: "completed",
      payment_method: "card",
      user: {
        name: "María García",
        email: "maria@example.com",
      },
      ticket: {
        name: "General",
      },
    },
  ];

  return (
    <>
      {/* Sticky Header with Tabs */}
      <EventStickyHeader
        eventName={event.name}
        subtitle="Gestión de ventas"
      >
        <EventSalesContent
          eventId={eventId}
          transactions={transactions || []}
          eventName={event.name}
          isAdmin={profile?.admin || false}
          showTabsOnly
        />
      </EventStickyHeader>

      {/* Content */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventSalesContent
          eventId={eventId}
          transactions={transactions || []}
          eventName={event.name}
          isAdmin={profile?.admin || false}
          showContentOnly
        />
      </div>
    </>
  );
}
