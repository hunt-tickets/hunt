import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { EventVentasContent } from "@/components/event-ventas-content";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

interface VentasPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export type OrderWithDetails = {
  id: string;
  userId: string;
  totalAmount: string;
  currency: string;
  marketplaceFee: string | null;
  processorFee: string | null;
  paymentStatus: string;
  platform: "web" | "app" | "cash";
  soldBy: string | null;
  createdAt: string;
  paidAt: string | null;
  buyer: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  seller: {
    id: string;
    name: string | null;
    email: string;
  } | null;
  items: {
    id: string;
    ticketTypeId: string;
    ticketTypeName: string;
    quantity: number;
    pricePerTicket: string;
    subtotal: string;
  }[];
};

export type TicketTypeStats = {
  id: string;
  name: string;
  price: string;
  capacity: number;
  soldCount: number;
  reservedCount: number;
  revenue: number;
};

export default async function VentasPage({ params }: VentasPageProps) {
  const { userId, eventId, organizationId } = await params;
  const reqHeaders = await headers();

  // Auth check
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
  }

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

  // Check if user can view analytics (sellers cannot)
  const canViewAnalytics = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { analytics: ["view"] },
      organizationId,
    },
  });

  if (!canViewAnalytics?.success) {
    redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/vender`);
  }

  const supabase = await createClient();

  // Fetch event data
  const { data: eventData } = await supabase
    .from("events")
    .select("id, name, status")
    .eq("id", eventId)
    .eq("organization_id", organizationId)
    .single();

  if (!eventData) {
    notFound();
  }

  // Fetch ticket types for this event
  const { data: ticketTypesData } = await supabase
    .from("ticket_types")
    .select("id, name, price, capacity, sold_count, reserved_count")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  const ticketTypes: TicketTypeStats[] = (ticketTypesData || []).map((tt) => ({
    id: tt.id,
    name: tt.name,
    price: tt.price,
    capacity: tt.capacity,
    soldCount: tt.sold_count,
    reservedCount: tt.reserved_count,
    revenue: tt.sold_count * parseFloat(tt.price),
  }));

  // Fetch orders with buyer, seller, and order items
  const { data: ordersData } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
      total_amount,
      currency,
      marketplace_fee,
      processor_fee,
      payment_status,
      platform,
      sold_by,
      created_at,
      paid_at,
      order_items (
        id,
        ticket_type_id,
        quantity,
        price_per_ticket,
        subtotal
      )
    `)
    .eq("event_id", eventId)
    .eq("payment_status", "paid")
    .order("created_at", { ascending: false });

  // Get unique user IDs (buyers and sellers)
  const userIds = new Set<string>();
  (ordersData || []).forEach((order) => {
    if (order.user_id) userIds.add(order.user_id);
    if (order.sold_by) userIds.add(order.sold_by);
  });

  // Fetch users
  const { data: usersData } = await supabase
    .from("users")
    .select("id, name, email")
    .in("id", Array.from(userIds));

  const usersMap = new Map(
    (usersData || []).map((u) => [u.id, { id: u.id, name: u.name, email: u.email }])
  );

  // Build ticket type name map
  const ticketTypeMap = new Map(ticketTypes.map((tt) => [tt.id, tt.name]));

  // Transform orders with all details
  const orders: OrderWithDetails[] = (ordersData || []).map((order) => ({
    id: order.id,
    userId: order.user_id,
    totalAmount: order.total_amount,
    currency: order.currency || "COP",
    marketplaceFee: order.marketplace_fee,
    processorFee: order.processor_fee,
    paymentStatus: order.payment_status,
    platform: order.platform as "web" | "app" | "cash",
    soldBy: order.sold_by,
    createdAt: order.created_at,
    paidAt: order.paid_at,
    buyer: order.user_id ? usersMap.get(order.user_id) || null : null,
    seller: order.sold_by ? usersMap.get(order.sold_by) || null : null,
    items: (order.order_items || []).map((item) => ({
      id: item.id,
      ticketTypeId: item.ticket_type_id,
      ticketTypeName: ticketTypeMap.get(item.ticket_type_id) || "Desconocido",
      quantity: item.quantity,
      pricePerTicket: item.price_per_ticket,
      subtotal: item.subtotal,
    })),
  }));

  return (
    <>
      <EventStickyHeader
        eventName={eventData.name || "Evento"}
        subtitle="Ventas y órdenes"
      >
        <EventVentasContent
          orders={orders}
          ticketTypes={ticketTypes}
          showTabsOnly
        />
      </EventStickyHeader>

      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventVentasContent
          orders={orders}
          ticketTypes={ticketTypes}
          showContentOnly
        />
      </div>
    </>
  );
}
