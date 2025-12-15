import { headers } from "next/headers";
import { verifyMembershipAndPermission } from "@/lib/auth/utils";
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
  const reqHeaders = await headers();

  // Verify membership and permission in one call
  await verifyMembershipAndPermission(
    userId,
    organizationId,
    reqHeaders,
    "event",
    "create"
  );

  // Mock venues data - TODO: fetch from database
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
    </div>
  );
};

export default AdministradorPage;
