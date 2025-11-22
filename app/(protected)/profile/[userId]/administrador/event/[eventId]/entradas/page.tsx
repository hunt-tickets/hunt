import { redirect, notFound } from "next/navigation";
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server";
import { getEventTickets, getTicketsSalesAnalytics, getTicketTypes } from "@/lib/supabase/actions/tickets";
=======
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
>>>>>>> a903bf6 (temp: admin config tabs implementation)
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
=======
  // Mock event data - In production, fetch from database
  const event = {
    id: eventId,
    name: "Concierto de Rock",
    status: true,
    variable_fee: 8,
  };

  // Mock tickets - In production, fetch from database
  const tickets = [
    {
      id: "ticket-1",
      name: "General",
      price: 50000,
      description: "Entrada general",
      status: true,
      quantity: 100,
      ticket_type_id: "type-1",
    },
    {
      id: "ticket-2",
      name: "VIP",
      price: 100000,
      description: "Entrada VIP",
      status: true,
      quantity: 50,
      ticket_type_id: "type-2",
    },
  ];

  // Mock ticket analytics - In production, fetch from database
  const ticketsAnalytics = {
    "ticket-1": {
      total: { quantity: 60, total: 3000000 },
      app: { quantity: 40, total: 2000000 },
      web: { quantity: 20, total: 1000000 },
      cash: { quantity: 0, total: 0 },
    },
    "ticket-2": {
      total: { quantity: 40, total: 4000000 },
      app: { quantity: 25, total: 2500000 },
      web: { quantity: 15, total: 1500000 },
      cash: { quantity: 0, total: 0 },
    },
  };

  // Mock ticket types - In production, fetch from database
  const ticketTypes = [
    { id: "type-1", name: "General" },
    { id: "type-2", name: "VIP" },
    { id: "type-3", name: "Palco" },
  ];
>>>>>>> a903bf6 (temp: admin config tabs implementation)

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
