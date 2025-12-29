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

  // Fetch events from database
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
          <AdminEventsList events={organizationEvents} userId={userId} organizationId={organizationId} />
        ) : (
          <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
                <div className="mb-6 sm:mb-8">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto">
                    <Calendar className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-white/30" />
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No hay eventos aún
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-white/60 mb-6 sm:mb-8 max-w-md px-4">
                  Comienza creando tu primer evento para gestionar entradas y ventas
                </p>
                <CreateEventDialog organizationId={organizationId} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdministradorPage;
