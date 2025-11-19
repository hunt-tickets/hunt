import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCompleteEventTransactions } from "@/lib/supabase/actions/tickets";
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
