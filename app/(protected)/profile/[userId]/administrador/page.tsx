import { redirect, notFound } from "next/navigation";
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server";
=======
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
>>>>>>> a903bf6 (temp: admin config tabs implementation)
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
<<<<<<< HEAD
import { getVenues } from "@/lib/supabase/queries/server/venues";
=======
>>>>>>> a903bf6 (temp: admin config tabs implementation)
import { AdminEventsList } from "@/components/admin-events-list";
import { CreateEventDialog } from "@/components/create-event-dialog";
import { AdminHeader } from "@/components/admin-header";
import type { EventFull } from "@/lib/supabase/types";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Eventos",
  };
}

interface AdministradorPageProps {
  params: Promise<{
    userId: string;
  }>;
}

const AdministradorPage = async ({ params }: AdministradorPageProps) => {
  const { userId } = await params;
<<<<<<< HEAD
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    redirect("/login");
  }

  // Get profile + producer data
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      *,
      producers_admin (
        producer_id,
        producers (
          id,
          name,
          logo,
          description
        )
      )
    `
    )
    .eq("id", user.id)
    .single();

  const isProducer = (profile?.producers_admin?.length ?? 0) > 0;
  const producerData = profile?.producers_admin?.[0]?.producers;
=======

  // Auth check using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
  }

  const user = session.user;

  // Mock data for profile and producer
  // In production, this would come from your database
  const profile = {
    id: user.id,
    admin: true, // Mock: user is admin
    producers_admin: [
      {
        producer_id: "mock-producer-1",
        producers: {
          id: "mock-producer-1",
          name: "Mi Productora",
          logo: null,
          description: "Productora de eventos",
        },
      },
    ],
  };

  const isProducer = (profile?.producers_admin?.length ?? 0) > 0;
>>>>>>> a903bf6 (temp: admin config tabs implementation)

  // If not admin or producer, redirect
  if (!profile?.admin && !isProducer) {
    notFound();
  }

<<<<<<< HEAD
  // Fetch events with full details (venue, tickets) for grid display
  // Query events based on user role: admin sees all, producer sees only their events
  let eventsQuery = supabase
    .from("events")
    .select(
      `
      id,
      name,
      description,
      date,
      end_date,
      status,
      flyer,
      venue_id,
      age,
      variable_fee,
      fixed_fee,
      priority,
      venues (
        id,
        name,
        address,
        latitude,
        longitude,
        city,
        cities (
          id,
          name
        )
      ),
      events_producers (
        producer_id
      ),
      tickets (
        id,
        name,
        price,
        description,
        status
      )
    `
    )
    .order("end_date", { ascending: false });

  // If user is producer (not admin), filter by their producer_id
  if (isProducer && !profile?.admin && producerData?.id) {
    eventsQuery = eventsQuery.eq("events_producers.producer_id", producerData.id);
  }

  const [eventsData, venues] = await Promise.all([
    eventsQuery,
    getVenues(),
  ]);

  // Map events with metadata for sorting
  const eventsWithMetadata = (eventsData.data || []).map(
    (event: Record<string, unknown>) => {
      const eventDate = new Date(event.date as string);
      const endDate = new Date((event.end_date as string) || (event.date as string));

      return {
        eventData: {
          id: event.id as string,
          name: (event.name as string) || "Evento sin nombre",
          flyer: (event.flyer as string) || "/placeholder.svg",
          date: event.date
            ? eventDate.toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          hour: eventDate.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          end_date: endDate.toISOString().split("T")[0],
          end_hour: endDate.toLocaleTimeString("es-CO", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          variable_fee: event.variable_fee as number,
          age: (event.age as number) || 18,
          description: (event.description as string) || "",
          venue_id: (event.venue_id as string) || "",
          venue_name:
            ((event.venues as Record<string, unknown>)?.name as string) ||
            "Venue por confirmar",
          venue_logo: "",
          venue_latitude:
            ((event.venues as Record<string, unknown>)?.latitude as number) || 0,
          venue_longitude:
            ((event.venues as Record<string, unknown>)?.longitude as number) || 0,
          venue_address:
            ((event.venues as Record<string, unknown>)?.address as string) ||
            "Dirección por confirmar",
          venue_city:
            ((
              (event.venues as Record<string, unknown>)?.cities as Record<
                string,
                unknown
              >
            )?.name as string) || "Ciudad",
          producers: [],
          tickets: (
            ((event.tickets as Array<Record<string, unknown>>) || [])
              .filter((ticket: Record<string, unknown>) => ticket.status === true)
              .map((ticket: Record<string, unknown>) => ({
                id: ticket.id as string,
                name: ticket.name as string,
                price: ticket.price as number,
                description: (ticket.description as string) || "",
              }))
          ),
        } as EventFull,
        originalDate: event.date as string | null | undefined,
        originalEndDate: event.end_date as string | null | undefined,
      };
    }
  );

  // Sort: events without dates go last
  const sortedEvents = eventsWithMetadata.sort((a, b) => {
    const aHasDate = a.originalDate || a.originalEndDate;
    const bHasDate = b.originalDate || b.originalEndDate;

    if (!aHasDate && !bHasDate) return 0;
    if (!aHasDate) return 1;
    if (!bHasDate) return -1;

    // Both have dates, sort by end_date descending
    const aEndDate = new Date(a.originalEndDate || a.originalDate || 0);
    const bEndDate = new Date(b.originalEndDate || b.originalDate || 0);

    return bEndDate.getTime() - aEndDate.getTime();
  });

  // Extract just the event data
  const userEvents: EventFull[] = sortedEvents.map((item) => item.eventData);
=======
  // Mock venues data
  const venues = [
    {
      id: "venue-1",
      name: "Teatro Principal",
      address: "Calle 100 #10-20",
      latitude: 4.678,
      longitude: -74.048,
      city: "Bogotá",
      cities: {
        id: "city-1",
        name: "Bogotá",
      },
    },
    {
      id: "venue-2",
      name: "Movistar Arena",
      address: "Calle 61 #70-38",
      latitude: 4.678,
      longitude: -74.048,
      city: "Bogotá",
      cities: {
        id: "city-1",
        name: "Bogotá",
      },
    },
  ];

  // Mock events data
  // In production, this would be fetched from your database
  const mockEvents: EventFull[] = [
    {
      id: "event-1",
      name: "Concierto de Rock",
      flyer: "/placeholder.svg",
      date: "2025-12-15",
      hour: "20:00",
      end_date: "2025-12-15",
      end_hour: "23:00",
      variable_fee: 8,
      age: 18,
      description: "Gran concierto de rock con bandas locales",
      venue_id: "venue-1",
      venue_name: "Teatro Principal",
      venue_logo: "",
      venue_latitude: 4.678,
      venue_longitude: -74.048,
      venue_address: "Calle 100 #10-20",
      venue_city: "Bogotá",
      producers: [],
      tickets: [
        {
          id: "ticket-1",
          name: "General",
          price: 50000,
          description: "Entrada general",
        },
        {
          id: "ticket-2",
          name: "VIP",
          price: 100000,
          description: "Entrada VIP con acceso a zona preferencial",
        },
      ],
    },
    {
      id: "event-2",
      name: "Festival Electrónico",
      flyer: "/placeholder.svg",
      date: "2025-12-20",
      hour: "18:00",
      end_date: "2025-12-21",
      end_hour: "04:00",
      variable_fee: 10,
      age: 21,
      description: "Festival de música electrónica",
      venue_id: "venue-2",
      venue_name: "Movistar Arena",
      venue_logo: "",
      venue_latitude: 4.678,
      venue_longitude: -74.048,
      venue_address: "Calle 61 #70-38",
      venue_city: "Bogotá",
      producers: [],
      tickets: [
        {
          id: "ticket-3",
          name: "Early Bird",
          price: 80000,
          description: "Precio anticipado",
        },
      ],
    },
  ];

  // Filter events based on user role (in production)
  const userEvents = mockEvents;
>>>>>>> a903bf6 (temp: admin config tabs implementation)

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Page Header */}
      <AdminHeader
        title="Mis Eventos"
        subtitle="Crea y gestiona tus eventos"
      />

<<<<<<< HEAD

=======
>>>>>>> a903bf6 (temp: admin config tabs implementation)
      {/* User Events */}
      {(isProducer || profile?.admin) && (
        <div className="space-y-4">
          {userEvents.length > 0 ? (
            <AdminEventsList events={userEvents} userId={userId} eventVenues={venues} />
          ) : (
            <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Comienza creando tu primer evento para gestionar entradas y
                    ventas
                  </p>
                  <CreateEventDialog eventVenues={venues} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AdministradorPage;
