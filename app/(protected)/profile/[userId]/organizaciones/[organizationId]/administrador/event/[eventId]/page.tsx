import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { EventDashboardTabs } from "@/components/event-dashboard-tabs";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { EventStatusToggle } from "@/components/event-status-toggle";
import { createClient } from "@/lib/supabase/server";
import { orderItem, member } from "@/lib/schema";
import { db } from "@/lib/drizzle";
import { eq, and } from "drizzle-orm";

interface EventPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export default async function EventDashboardPage({ params }: EventPageProps) {
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

  // Check if user can view dashboard (sellers cannot)
  const canViewDashboard = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { dashboard: ["view"] },
      organizationId,
    },
  });

  if (!canViewDashboard?.success) {
    // Redirect sellers to the vender page for this event
    redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/vender`);
  }

  const supabase = await createClient();

  // Single fetch: event with ticket_types and orders with order_items
  const { data: event } = await supabase
    .from("events")
    .select(
      `
      id,
      name,
      status,
      flyer,
      ticket_types (*),
      orders (
        *,
        order_items (*)
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

  // Build tickets with analytics structure
  const ticketsWithAnalytics = ticketTypes.map((tt) => ({
    id: tt.id,
    name: tt.name,
    price: parseFloat(tt.price),
    description: tt.description,
    status: true,
    quantity: tt.capacity,
    analytics: {
      total: {
        quantity: tt.sold_count,
        total: tt.sold_count * parseFloat(tt.price),
      },
      app: { quantity: 0, total: 0 },
      web: { quantity: 0, total: 0 },
      cash: { quantity: 0, total: 0 },
    },
  }));

  // Calculate sales by platform and aggregate fees
  const salesByPlatform = orders.reduce(
    (acc, order) => {
      // Only count paid orders
      if (order.payment_status !== "paid") return acc;

      const orderTotal = parseFloat(order.total_amount);
      const marketplaceFee = parseFloat(order.marketplace_fee || "0");
      const processorFee = parseFloat(order.processor_fee || "0");
      const itemCount = (order.order_items || []).reduce(
        (sum: number, item: orderItem) => sum + item.quantity,
        0
      );

      acc[order.platform as "web" | "app" | "cash"].total += orderTotal;
      acc[order.platform as "web" | "app" | "cash"].count += itemCount;
      acc[order.platform as "web" | "app" | "cash"].marketplaceFee += marketplaceFee;
      acc[order.platform as "web" | "app" | "cash"].processorFee += processorFee;
      return acc;
    },
    {
      web: { total: 0, count: 0, marketplaceFee: 0, processorFee: 0 },
      app: { total: 0, count: 0, marketplaceFee: 0, processorFee: 0 },
      cash: { total: 0, count: 0, marketplaceFee: 0, processorFee: 0 },
    }
  );

  const totalFromOrders =
    salesByPlatform.web.total +
    salesByPlatform.app.total +
    salesByPlatform.cash.total;
  const totalTicketsFromOrders =
    salesByPlatform.web.count +
    salesByPlatform.app.count +
    salesByPlatform.cash.count;

  // Aggregate fees across all platforms
  const totalMarketplaceFee =
    salesByPlatform.web.marketplaceFee +
    salesByPlatform.app.marketplaceFee +
    salesByPlatform.cash.marketplaceFee;
  const totalProcessorFee =
    salesByPlatform.web.processorFee +
    salesByPlatform.app.processorFee +
    salesByPlatform.cash.processorFee;

  // Organization receives: total - fees
  const organizationNetAmount = totalFromOrders - totalMarketplaceFee - totalProcessorFee;

  // Build financial report from real order data
  const financialReport = {
    timestamp: new Date().toISOString(),
    channels_total: totalFromOrders,
    tickets_sold: {
      total: totalTicketsFromOrders,
      app: salesByPlatform.app.count,
      web: salesByPlatform.web.count,
      cash: salesByPlatform.cash.count,
    },
    app_total: salesByPlatform.app.total,
    web_total: salesByPlatform.web.total,
    cash_total: salesByPlatform.cash.total,
    // Organization perspective - real fees from orders
    org_summary: {
      gross_sales: totalFromOrders,
      marketplace_fee: totalMarketplaceFee,
      processor_fee: totalProcessorFee,
      net_amount: organizationNetAmount,
      // Breakdown by channel
      by_channel: {
        web: {
          gross: salesByPlatform.web.total,
          marketplace_fee: salesByPlatform.web.marketplaceFee,
          processor_fee: salesByPlatform.web.processorFee,
          net: salesByPlatform.web.total - salesByPlatform.web.marketplaceFee - salesByPlatform.web.processorFee,
        },
        app: {
          gross: salesByPlatform.app.total,
          marketplace_fee: salesByPlatform.app.marketplaceFee,
          processor_fee: salesByPlatform.app.processorFee,
          net: salesByPlatform.app.total - salesByPlatform.app.marketplaceFee - salesByPlatform.app.processorFee,
        },
        cash: {
          gross: salesByPlatform.cash.total,
          marketplace_fee: salesByPlatform.cash.marketplaceFee,
          processor_fee: salesByPlatform.cash.processorFee,
          net: salesByPlatform.cash.total - salesByPlatform.cash.marketplaceFee - salesByPlatform.cash.processorFee,
        },
      },
    },
  };

  // Build sales records from orders and order items
  const sales = orders.flatMap((order) =>
    (order.order_items || []).map((item: orderItem) => ({
      id: item.id,
      quantity: item.quantity,
      subtotal: parseFloat(item.subtotal),
      pricePerTicket: parseFloat(item.pricePerTicket),
      paymentStatus: order.payment_status,
      createdAt: order.created_at,
      platform: order.platform, // 'web' | 'app' | 'cash'
      ticketTypeName:
        ticketTypes.find((tt) => tt.id === item.ticketTypeId)?.name || "",
      userFullname: "",
      userEmail: "",
      isCash: order.platform === "cash",
    }))
  );

  // Empty state - no ticket types yet
  if (ticketTypes.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="space-y-4 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{event.name}</h1>
              <p className="text-xs text-muted-foreground">
                Panel de Administración
              </p>
            </div>
            <EventStatusToggle eventId={eventId} initialStatus={event.status ?? false} />
          </div>

          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">
                Sin tipos de entrada
              </h3>
              <p className="text-sm text-muted-foreground">
                Crea tipos de entrada en la sección &quot;Entradas&quot; para
                ver las estadísticas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sticky Header with Tabs */}
      <EventStickyHeader
        eventName={event.name}
        subtitle={new Date(financialReport.timestamp).toLocaleString("es-CO", {
          dateStyle: "short",
          timeStyle: "short",
        })}
        rightContent={<EventStatusToggle eventId={eventId} initialStatus={event.status ?? false} />}
      >
        <EventDashboardTabs
          financialReport={financialReport}
          sales={sales}
          tickets={ticketsWithAnalytics}
          eventId={eventId}
          eventName={event.name}
          eventFlyer={event.flyer || "/placeholder.svg"}
          showTabsOnly
        />
      </EventStickyHeader>

      {/* Content */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventDashboardTabs
          financialReport={financialReport}
          sales={sales}
          tickets={ticketsWithAnalytics}
          eventId={eventId}
          eventName={event.name}
          eventFlyer={event.flyer || "/placeholder.svg"}
          showContentOnly
        />
      </div>
    </>
  );
}
