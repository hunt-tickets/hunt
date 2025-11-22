import { redirect, notFound } from "next/navigation";
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server";
import { getCompleteEventTransactions } from "@/lib/supabase/actions/tickets";
=======
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
>>>>>>> a903bf6 (temp: admin config tabs implementation)
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
<<<<<<< HEAD
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
=======

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
>>>>>>> a903bf6 (temp: admin config tabs implementation)

  const producersAdmin = Array.isArray(profile?.producers_admin)
    ? profile.producers_admin
    : profile?.producers_admin
    ? [profile.producers_admin]
    : [];
  const isProducer = producersAdmin.length > 0;

  if (!profile?.admin && !isProducer) {
    notFound();
  }

<<<<<<< HEAD
  // Fetch event details and transactions
  const [eventData, transactions] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, status")
      .eq("id", eventId)
      .single(),
    getCompleteEventTransactions(eventId),
  ]);

  if (eventData.error || !eventData.data) {
    notFound();
  }

  const event = eventData.data;
=======
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
>>>>>>> a903bf6 (temp: admin config tabs implementation)

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
