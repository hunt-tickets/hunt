import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
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

  // If not admin or producer, redirect
  if (!profile?.admin && !isProducer) {
    notFound();
  }

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

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Page Header */}
      <AdminHeader
        title="Mis Eventos"
        subtitle="Crea y gestiona tus eventos"
      />

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
