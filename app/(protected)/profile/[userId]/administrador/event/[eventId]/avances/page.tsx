import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventAdvances } from "@/lib/supabase/actions/advances";
import { getEventFinancialReport } from "@/lib/supabase/actions/events";
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
