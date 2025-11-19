import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  // Fetch event details with all configuration fields
  const { data: event, error } = await supabase
    .from("events")
    .select(`
      id,
      name,
      description,
      date,
      end_date,
      status,
      age,
      variable_fee,
      fixed_fee,
      flyer,
      flyer_apple,
      venue_id,
      faqs,
      venues!inner (
        id,
        name,
        address,
        city
      )
    `)
    .eq("id", eventId)
    .single();

  if (error || !event) {
    notFound();
  }

  // Transform the event data to match EventData interface
  const eventData = {
    ...event,
    venues: Array.isArray(event.venues) && event.venues.length > 0 ? event.venues[0] : undefined,
  };

  return (
    <>
      {/* Sticky Header */}
      <EventStickyHeader
        eventName={event.name}
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
