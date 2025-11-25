import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventTicketsContent } from "@/components/event-tickets-content";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { createClient } from "@/lib/supabase/server";

interface EntradasPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export default async function EntradasPage({ params }: EntradasPageProps) {
  const { userId, eventId } = await params;

  // Auth check using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
  }

  const supabase = await createClient();

  // Fetch event with ticket_types and orders with order_items
  const { data: event } = await supabase
    .from("events")
    .select(
      `
      id,
      name,
      status,
      variable_fee,
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
        created_at
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

  // Transform ticket types to match component interface
  // The component expects the legacy TicketData interface, so we map to it
  const ticketTypesForComponent = ticketTypes.map((tt) => ({
    id: tt.id,
    created_at: tt.created_at,
    name: tt.name,
    description: tt.description,
    price: parseFloat(tt.price),
    max_date: tt.sale_end, // Map sale_end to max_date for display
    quantity: tt.capacity, // Map capacity to quantity (available tickets)
    reference: null,
    status: true, // Ticket types don't have status, assume active
    section: null,
    row: null,
    seat: null,
    palco: null,
    capacity: tt.capacity,
    hex: null,
    family: null,
    ticket_type: null, // Self-reference not needed for ticket types view
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
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventTicketsContent
          eventId={eventId}
          tickets={ticketTypesForComponent}
          ticketsAnalytics={ticketTypesAnalytics}
          ticketTypes={ticketTypesList}
          variableFee={parseFloat(event.variable_fee || "0")}
        />
      </div>
    </>
  );
}
