import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventDashboardTabs } from "@/components/event-dashboard-tabs";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { EventStatusToggle } from "@/components/event-status-toggle";
import { EventOptionsMenu } from "@/components/event-options-menu";
import { createClient } from "@/lib/supabase/server";
import { orderItem, member } from "@/lib/schema";
import { db } from "@/lib/drizzle";
import { eq, and } from "drizzle-orm";
import { Settings } from "lucide-react";

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
      date,
      city,
      venue_id,
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

  // Determine setup completion status
  const hasDate = !!event.date;
  const hasTicketTypes = ticketTypes.length > 0;

  // Event can only be published when required items are complete
  const canPublish = hasDate && hasTicketTypes;

  // Configuration URL
  const configUrl = `/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/configuracion`;

  // Empty state - no ticket types yet, show setup message
  if (ticketTypes.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="space-y-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{event.name}</h1>
              <p className="text-xs text-muted-foreground">
                Panel de Administración
              </p>
            </div>
            <EventStatusToggle
              eventId={eventId}
              initialStatus={event.status ?? false}
              disabled={!canPublish}
              disabledReason="Completa la configuración para publicar"
            />
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Settings className="h-6 w-6 text-zinc-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Configura tu evento</h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Agrega los detalles de tu evento para poder publicarlo y comenzar a vender entradas.
                </p>
              </div>
              <Link
                href={configUrl}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Ir a configuración
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Sticky Header with Tabs */}
      <EventStickyHeader
        eventName={event.name}
        subtitle={new Date(financialReport.timestamp).toLocaleString("es-CO", {
          dateStyle: "short",
          timeStyle: "short",
        })}
        rightContent={
          <div className="flex items-center gap-3">
            <EventStatusToggle
              eventId={eventId}
              initialStatus={event.status ?? false}
              disabled={!canPublish}
              disabledReason="Completa la fecha y crea al menos una entrada para publicar"
            />
            <EventOptionsMenu eventId={eventId} />
          </div>
        }
      >
        <EventDashboardTabs
          financialReport={financialReport}
          sales={sales}
          tickets={ticketsWithAnalytics}
          eventId={eventId}
          eventName={event.name}
          eventFlyer={event.flyer || "/event-placeholder.svg"}
          showTabsOnly
        />
      </EventStickyHeader>

      {/* Setup banner - shown if event can't be published yet */}
      {!canPublish && (
        <Link
          href={configUrl}
          className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Settings className="h-4 w-4 text-amber-600 dark:text-amber-500" />
            <span className="text-sm text-amber-800 dark:text-amber-200">
              Completa la configuración para publicar tu evento
            </span>
          </div>
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Configurar →
          </span>
        </Link>
      )}

      {/* Content */}
      <EventDashboardTabs
        financialReport={financialReport}
        sales={sales}
        tickets={ticketsWithAnalytics}
        eventId={eventId}
        eventName={event.name}
        eventFlyer={event.flyer || "/event-placeholder.svg"}
        showContentOnly
      />
    </div>
  );
}
