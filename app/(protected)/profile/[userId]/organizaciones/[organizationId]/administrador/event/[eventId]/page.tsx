import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EventDashboardTabs } from "@/components/event-dashboard-tabs";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { createClient } from "@/lib/supabase/server";
import { orderItem } from "@/lib/schema";

interface EventPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export default async function EventDashboardPage({ params }: EventPageProps) {
  const { userId, eventId } = await params;

  // Auth check using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
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

  // Calculate sales by platform first
  const salesByPlatform = orders.reduce(
    (acc, order) => {
      const orderTotal = parseFloat(order.total_amount);
      const itemCount = (order.order_items || []).reduce(
        (sum: number, item: orderItem) => sum + item.quantity,
        0
      );
      acc[order.platform as "web" | "app" | "cash"].total += orderTotal;
      acc[order.platform as "web" | "app" | "cash"].count += itemCount;
      return acc;
    },
    {
      web: { total: 0, count: 0 },
      app: { total: 0, count: 0 },
      cash: { total: 0, count: 0 },
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
    settlement_amount: totalFromOrders * 0.9,
    app_total: salesByPlatform.app.total,
    web_total: salesByPlatform.web.total,
    cash_total: salesByPlatform.cash.total,
    total_tax: totalFromOrders * 0.08,
    hunt_sales: {
      price: salesByPlatform.web.total + salesByPlatform.app.total,
      tax: (salesByPlatform.web.total + salesByPlatform.app.total) * 0.08,
      variable_fee:
        (salesByPlatform.web.total + salesByPlatform.app.total) * 0.1,
      total: salesByPlatform.web.total + salesByPlatform.app.total,
    },
    producer_sales: {
      price: salesByPlatform.cash.total,
      tax: 0,
      variable_fee: 0,
      total: salesByPlatform.cash.total,
    },
    global_calculations: {
      ganancia_bruta_hunt: totalFromOrders * 0.1,
      deducciones_bold_total: totalFromOrders * 0.025,
      impuesto_4x1000: totalFromOrders * 0.004,
      ganancia_neta_hunt: totalFromOrders * 0.071,
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
            <Badge variant={event.status ? "default" : "secondary"}>
              {event.status ? "Activo" : "Finalizado"}
            </Badge>
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
