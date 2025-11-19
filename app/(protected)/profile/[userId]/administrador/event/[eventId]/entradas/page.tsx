import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEventTickets, getTicketsSalesAnalytics, getTicketTypes } from "@/lib/supabase/actions/tickets";
import { EventTicketsContent } from "@/components/event-tickets-content";
import { EventStickyHeader } from "@/components/event-sticky-header";

interface EntradasPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
  }>;
}

export default async function EntradasPage({ params }: EntradasPageProps) {
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

  // Fetch event details, tickets, and analytics
  const [eventData, tickets, ticketsAnalytics, ticketTypes] = await Promise.all([
    supabase
      .from("events")
      .select("id, name, status, variable_fee")
      .eq("id", eventId)
      .single(),
    getEventTickets(eventId),
    getTicketsSalesAnalytics(eventId),
    getTicketTypes(),
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
        subtitle="Gestión de Entradas"
      />

      {/* Content */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventTicketsContent
          eventId={eventId}
          tickets={tickets || []}
          ticketsAnalytics={ticketsAnalytics || undefined}
          ticketTypes={ticketTypes || []}
          variableFee={event.variable_fee || 0}
        />
      </div>
    </>
  );
}
