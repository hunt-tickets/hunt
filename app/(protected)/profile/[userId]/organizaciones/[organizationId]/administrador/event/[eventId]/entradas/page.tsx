import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventTicketsContent } from "@/components/event-tickets-content";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface EntradasPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export default async function EntradasPage({ params }: EntradasPageProps) {
  const { userId, eventId, organizationId } = await params;
  const reqHeaders = await headers();

  // Verify user is a member of the organization
  const memberRecord = await db.query.member.findFirst({
    where: and(
      eq(member.userId, userId),
      eq(member.organizationId, organizationId)
    ),
  });

  if (!memberRecord) {
    notFound();
  }

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
      `/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/vender`
    );
  }

  const supabase = await createClient();

  // Fetch event with ticket_types, event_days, and orders with order_items
  const { data: event } = await supabase
    .from("events")
    .select(
      `
      id,
      name,
      status,
      type,
      variable_fee,
      lifecycle_status,
      modification_locked,
      ticket_types (
        id,
        name,
        description,
        price,
        capacity,
        sold_count,
        reserved_count,
        min_per_order,
        max_per_order,
        sale_start,
        sale_end,
        created_at,
        active,
        event_day_id
      ),
      event_days (
        id,
        name,
        date,
        sort_order
      ),
      orders (
        id,
        platform,
        payment_status,
        order_items (
          id,
          ticket_type_id,
          quantity,
          price_per_ticket,
          subtotal
        )
      )
    `
    )
    .eq("id", eventId)
    .single();

  if (!event) {
    notFound();
  }

  // Check lifecycle status first (most important)
  // Show message if event is being cancelled
  if (event.lifecycle_status === "cancellation_pending") {
    return (
      <>
        <EventStickyHeader
          eventName={event.name || "Evento"}
          subtitle="Gestión de Entradas"
        />

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
                No puedes ver ni modificar las entradas mientras el evento está
                en proceso de cancelación.
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
  if (event.lifecycle_status === "cancelled") {
    return (
      <>
        <EventStickyHeader
          eventName={event.name || "Evento"}
          subtitle="Gestión de Entradas"
        />

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
                No puedes ver ni modificar las entradas de un evento cancelado.
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
  if (event.modification_locked) {
    return (
      <>
        <EventStickyHeader
          eventName={event.name || "Evento"}
          subtitle="Gestión de Entradas"
        />

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
                No puedes ver ni modificar las entradas mientras el evento está
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

  const ticketTypes = event.ticket_types || [];
  const orders = event.orders || [];

  // Calculate analytics per ticket type and platform
  // Only count items from paid orders
  const paidOrders = orders.filter((order) => order.payment_status === "paid");

  // Build analytics map: ticketTypeId -> { app, web, cash, total }
  const analyticsMap: Record<
    string,
    {
      ticketTypeId: string;
      app: { quantity: number; total: number };
      web: { quantity: number; total: number };
      cash: { quantity: number; total: number };
      total: { quantity: number; total: number };
    }
  > = {};

  // Initialize analytics for each ticket type
  ticketTypes.forEach((tt) => {
    analyticsMap[tt.id] = {
      ticketTypeId: tt.id,
      app: { quantity: 0, total: 0 },
      web: { quantity: 0, total: 0 },
      cash: { quantity: 0, total: 0 },
      total: { quantity: 0, total: 0 },
    };
  });

  // Aggregate order items by ticket type and platform
  paidOrders.forEach((order) => {
    const platform = order.platform as "app" | "web" | "cash";
    const orderItems = order.order_items || [];

    orderItems.forEach((item) => {
      const ticketTypeId = item.ticket_type_id;
      if (!analyticsMap[ticketTypeId]) return;

      const quantity = item.quantity;
      const subtotal = parseFloat(item.subtotal);

      // Add to platform-specific totals
      analyticsMap[ticketTypeId][platform].quantity += quantity;
      analyticsMap[ticketTypeId][platform].total += subtotal;

      // Add to overall totals
      analyticsMap[ticketTypeId].total.quantity += quantity;
      analyticsMap[ticketTypeId].total.total += subtotal;
    });
  });

  // Sort event days by sort_order
  const eventDays = (event.event_days || [])
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((day) => ({
      id: day.id,
      name: day.name || "",
      date: day.date || "",
    }));

  // Transform ticket types to match component interface
  // The component expects the legacy TicketData interface, so we map to it
  const ticketTypesForComponent = ticketTypes.map((tt) => ({
    id: tt.id,
    created_at: tt.created_at,
    name: tt.name,
    description: tt.description,
    price: parseFloat(tt.price),
    max_date: tt.sale_end, // Map sale_end to max_date for display
    sale_start: tt.sale_start, // Include sale_start for edit form
    sale_end: tt.sale_end, // Include sale_end for edit form
    min_per_order: tt.min_per_order,
    max_per_order: tt.max_per_order,
    quantity: tt.capacity, // Map capacity to quantity (available tickets)
    reference: null,
    status: tt.active, // Map active to status
    section: null,
    row: null,
    seat: null,
    palco: null,
    capacity: tt.capacity,
    hex: null,
    family: null,
    ticket_type: null, // Self-reference not needed for ticket types view
    event_day_id: tt.event_day_id, // Link to specific day (null = all days)
  }));

  // Transform analytics to match component interface
  const ticketTypesAnalytics: Record<
    string,
    {
      ticketId: string;
      app: { quantity: number; total: number };
      web: { quantity: number; total: number };
      cash: { quantity: number; total: number };
      total: { quantity: number; total: number };
    }
  > = {};

  Object.entries(analyticsMap).forEach(([ticketTypeId, analytics]) => {
    ticketTypesAnalytics[ticketTypeId] = {
      ticketId: ticketTypeId,
      ...analytics,
    };
  });

  // Build ticket types list for filter tabs
  const ticketTypesList = ticketTypes.map((tt) => ({
    id: tt.id,
    name: tt.name,
  }));

  return (
    <>
      {/* Sticky Header */}
      <EventStickyHeader
        eventName={event.name || "Evento"}
        subtitle="Gestión de Entradas"
      />

      {/* Content */}
      <div className="py-3 sm:py-4">
        <EventTicketsContent
          eventId={eventId}
          tickets={ticketTypesForComponent}
          ticketsAnalytics={ticketTypesAnalytics}
          ticketTypes={ticketTypesList}
          variableFee={parseFloat(event.variable_fee || "0")}
          eventType={
            (event.type as "single" | "multi_day" | "recurring" | "slots") ||
            "single"
          }
          eventDays={eventDays}
        />
      </div>
    </>
  );
}
