import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventAccessControl } from "@/lib/supabase/actions/access-control";
import { EventAccessControlContent } from "@/components/event-access-control-content";
import { EventStickyHeader } from "@/components/event-sticky-header";

interface AccesosPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
  }>;
}

export default async function AccesosPage({ params }: AccesosPageProps) {
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

  // Fetch event details and access control data
  const [eventData, accessData] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, status")
      .eq("id", eventId)
      .single(),
    getEventAccessControl(eventId),
  ]);

  if (eventData.error || !eventData.data) {
    notFound();
  }

  const event = eventData.data;

  return (
    <>
      {/* Sticky Header */}
      <EventStickyHeader
        eventName={event.name}
        subtitle="Control de Acceso"
      >
        <EventAccessControlContent
          qrCodes={accessData?.qrCodes || []}
          transactionsWithoutQR={accessData?.transactionsMissingQR || []}
          eventId={eventId}
          showTabsOnly
        />
      </EventStickyHeader>

      {/* Content */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventAccessControlContent
          qrCodes={accessData?.qrCodes || []}
          transactionsWithoutQR={accessData?.transactionsMissingQR || []}
          eventId={eventId}
          showContentOnly
        />
      </div>
    </>
  );
}
