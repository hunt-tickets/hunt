import { redirect, notFound } from "next/navigation";
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server";
=======
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
>>>>>>> a903bf6 (temp: admin config tabs implementation)
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
=======
  // Mock event data - In production, fetch from database
  const eventData = {
    id: eventId,
    name: "Concierto de Rock",
    description: "Gran concierto de rock con bandas locales",
    date: "2025-12-15",
    end_date: "2025-12-15",
    status: true,
    age: 18,
    variable_fee: 8,
    fixed_fee: 3000,
    flyer: "/placeholder.svg",
    flyer_apple: null,
    venue_id: "venue-1",
    faqs: [],
    venues: {
      id: "venue-1",
      name: "Teatro Principal",
      address: "Calle 100 #10-20",
      city: "Bogotá",
    },
>>>>>>> a903bf6 (temp: admin config tabs implementation)
  };

  return (
    <>
      {/* Sticky Header */}
      <EventStickyHeader
<<<<<<< HEAD
        eventName={event.name}
=======
        eventName={eventData.name}
>>>>>>> a903bf6 (temp: admin config tabs implementation)
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
