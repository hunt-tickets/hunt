import { redirect, notFound } from "next/navigation";
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server";
import { getEventAdvances } from "@/lib/supabase/actions/advances";
import { getEventFinancialReport } from "@/lib/supabase/actions/events";
=======
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
>>>>>>> a903bf6 (temp: admin config tabs implementation)
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
  // Fetch event details, advances, and financial report
  const [eventData, advances, financialReport] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, status, date")
      .eq("id", eventId)
      .single(),
    getEventAdvances(eventId),
    getEventFinancialReport(eventId),
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
>>>>>>> a903bf6 (temp: admin config tabs implementation)

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
