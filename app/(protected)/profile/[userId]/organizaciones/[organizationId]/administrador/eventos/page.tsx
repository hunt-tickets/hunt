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
import { Metadata } from "next";
import { getOrganizationEvents } from "@/lib/supabase/actions/events";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Eventos",
  };
}

interface AdministradorPageProps {
  params: Promise<{
    userId: string;
    organizationId: string;
  }>;
}

const AdministradorPage = async ({ params }: AdministradorPageProps) => {
  const { userId, organizationId } = await params;

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

  // Fetch real events from database
  const organizationEvents = await getOrganizationEvents(organizationId);

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Page Header */}
      <AdminHeader
        title="Mis Eventos"
        subtitle="Crea y gestiona tus eventos"
      />

      {/* Organization Events */}
      {(isProducer || profile?.admin) && (
        <div className="space-y-4">
          {organizationEvents.length > 0 ? (
            <AdminEventsList events={organizationEvents} userId={userId} eventVenues={venues} organizationId={organizationId} />
          ) : (
            <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Comienza creando tu primer evento para gestionar entradas y
                    ventas
                  </p>
                  <CreateEventDialog eventVenues={venues} organizationId={organizationId} />
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
