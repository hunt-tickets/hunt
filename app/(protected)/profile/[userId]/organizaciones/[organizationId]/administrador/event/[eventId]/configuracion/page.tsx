import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventConfigContent } from "@/components/event-config-content";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { db } from "@/lib/drizzle";
import { events, eventDays } from "@/lib/schema";
import { eq, and, asc } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ConfiguracionPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export default async function ConfiguracionPage({
  params,
}: ConfiguracionPageProps) {
  const { userId, eventId, organizationId } = await params;
  const reqHeaders = await headers();

  // Check if user can manage events (sellers cannot)
  const canManageEvents = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { event: ["update"] },
      organizationId,
    },
  });

  if (!canManageEvents?.success) {
    redirect(
      `/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/vender`,
    );
  }

  // Fetch event data from database
  const event = await db.query.events.findFirst({
    where: and(
      eq(events.id, eventId),
      eq(events.organizationId, organizationId),
    ),
  });

  if (!event) {
    notFound();
  }

  // Check lifecycle status first (most important)
  // Show message if event is being cancelled
  if (event.lifecycleStatus === "cancellation_pending") {
    return (
      <>
        <EventStickyHeader
          eventName={event.name || "Evento"}
          subtitle="Configuración del Evento"
        >
          <EventConfigContent showTabsOnly />
        </EventStickyHeader>

        <div className="py-3 sm:py-4">
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
                Evento en proceso de cancelación
              </CardTitle>
              <CardDescription>
                Este evento está siendo cancelado actualmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                No puedes modificar la configuración mientras el evento está en
                proceso de cancelación.
              </p>
              <p>
                Una vez que se completen todos los reembolsos, podrás acceder
                nuevamente a los detalles del evento.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Show message if event is cancelled
  if (event.lifecycleStatus === "cancelled") {
    return (
      <>
        <EventStickyHeader
          eventName={event.name || "Evento"}
          subtitle="Configuración del Evento"
        >
          <EventConfigContent showTabsOnly />
        </EventStickyHeader>

        <div className="py-3 sm:py-4">
          <Card className="border-red-500/50 bg-red-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Evento cancelado
              </CardTitle>
              <CardDescription>
                Este evento ha sido cancelado permanentemente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                No puedes modificar la configuración de un evento cancelado.
              </p>
              <p>
                Todos los reembolsos han sido procesados y el evento está
                archivado.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Show message if event is locked
  if (event.modificationLocked) {
    return (
      <>
        <EventStickyHeader
          eventName={event.name || "Evento"}
          subtitle="Configuración del Evento"
        >
          <EventConfigContent showTabsOnly />
        </EventStickyHeader>

        <div className="py-3 sm:py-4">
          <Card className="border-orange-500/50 bg-orange-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600">
                <AlertCircle className="h-5 w-5" />
                Evento bloqueado
              </CardTitle>
              <CardDescription>
                Este evento está bloqueado temporalmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                No puedes modificar la configuración mientras el evento está
                bloqueado.
              </p>
              <p>
                Contacta al administrador de la organización para más
                información.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Fetch event days for multi-day events
  const days = await db.query.eventDays.findMany({
    where: eq(eventDays.eventId, eventId),
    orderBy: [asc(eventDays.sortOrder)],
  });

  // Format event data for the config component
  const eventData = {
    id: event.id,
    name: event.name || "",
    description: event.description || "",
    category: event.category || undefined,
    type:
      (event.type as "single" | "multi_day" | "recurring" | "slots") ||
      "single",
    date: event.date?.toISOString(),
    end_date: event.endDate?.toISOString(),
    status: event.status ?? false,
    age: event.minAge ? Number(event.minAge) : undefined,
    variable_fee: event.variableFee ? Number(event.variableFee) : undefined,
    fixed_fee: event.fixedFee ? Number(event.fixedFee) : undefined,
    city: event.city || undefined,
    country: event.country || undefined,
    address: event.address || undefined,
    venue_name: event.venueName || undefined,
    flyer: event.flyer || undefined,
    // flyer_apple: event.flyerApple || undefined,
    venue_id: event.venueId || undefined,
    // private_list: event.privateList ?? false, // TODO: Waiting for DB migration

    days: days.map((d) => ({
      id: d.id,
      name: d.name || "",
      date: d.date?.toISOString() || "",
      endDate: d.endDate?.toISOString() || "",
      sortOrder: d.sortOrder || 0,
    })),
  };

  return (
    <>
      {/* Sticky Header */}
      <EventStickyHeader
        eventName={eventData.name}
        subtitle="Configuración del Evento"
      >
        <EventConfigContent showTabsOnly />
      </EventStickyHeader>

      {/* Content */}
      <div className="py-3 sm:py-4">
        <EventConfigContent
          showContentOnly
          eventData={eventData}
          eventId={eventId}
        />
      </div>
    </>
  );
}
