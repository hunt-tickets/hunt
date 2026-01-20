import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventDashboardTabs } from "@/components/event-dashboard-tabs";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { EventStatusToggle } from "@/components/event-status-toggle";
import { EventCashSalesToggle } from "@/components/event-cash-sales-toggle";
import { EventOptionsMenu } from "@/components/event-options-menu";
import { createClient } from "@/lib/supabase/server";
import { member } from "@/lib/schema";
import { db } from "@/lib/drizzle";
import { eq } from "drizzle-orm";
import { Settings } from "lucide-react";

// Type for Supabase order with nested relations
type OrderWithItems = {
  id: string;
  user_id: string;
  event_id: string;
  total_amount: string;
  currency: string;
  marketplace_fee: string | null;
  processor_fee: string | null;
  tax_withholding_ica: string | null;
  tax_withholding_fuente: string | null;
  payment_status: string;
  platform: string;
  payment_session_id: string | null;
  sold_by: string | null;
  created_at: string;
  paid_at: string | null;
  order_items: {
    id: string;
    orderId: string;
    ticketTypeId: string;
    quantity: number;
    pricePerTicket: string;
    subtotal: string;
    created_at: string;
  }[];
};

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
    redirect(
      `/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/vender`
    );
  }

  const supabase = await createClient();
  // Single fetch: event with ticket_types and orders with order_items
  // Exclude cancelled/deleted events
  const { data: event } = await supabase
    .from("events")
    .select(
      `
      id,
      name,
      status,
      cash,
      flyer,
      date,
      city,
      venue_id,
      lifecycle_status,
      deleted_at,
      cancelled_by,
      cancellation_reason,
      cancellation_initiated_at,
      ticket_types (*),
      orders (
        *,
        order_items (*)
      )
    `
    )
    .eq("id", eventId)
    .is("deleted_at", null) // Only fetch non-deleted events
    .single();

  if (!event) {
    notFound();
  }

  const ticketTypes = event.ticket_types || [];
  const orders = (event.orders || []) as OrderWithItems[];

  // Fetch organization members with user details
  const organizationMembers = await db.query.member.findMany({
    where: eq(member.organizationId, organizationId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          nombres: true,
          apellidos: true,
          email: true,
          phoneNumber: true,
        },
      },
    },
  });

  // Aggregate seller statistics from orders
  const sellerStats = organizationMembers.map((memberRecord) => {
    const sellerId = memberRecord.userId;

    // Filter orders sold by this seller for this event
    const sellerOrders = orders.filter(
      (order) => order.sold_by === sellerId && order.payment_status === "paid"
    );

    // Calculate cash sales (platform = 'cash')
    const cashSales = sellerOrders
      .filter((order) => order.platform === "cash")
      .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

    // Calculate gateway sales (platform = 'web' or 'app')
    const gatewaySales = sellerOrders
      .filter((order) => order.platform === "web" || order.platform === "app")
      .reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

    // Calculate total tickets sold by counting order_items
    const ticketsSold = sellerOrders.reduce(
      (sum, order) =>
        sum +
        (order.order_items || []).reduce(
          (itemSum, item) => itemSum + item.quantity,
          0
        ),
      0
    );

    return {
      id: memberRecord.id,
      userId: sellerId,
      name: memberRecord.user?.nombres || memberRecord.user?.name || null,
      lastName: memberRecord.user?.apellidos || null,
      email: memberRecord.user?.email || null,
      phone: memberRecord.user?.phoneNumber || null,
      role: memberRecord.role,
      cashSales,
      gatewaySales,
      ticketsSold,
      commission: null, // TODO: Add commission tracking
      created_at: memberRecord.createdAt.toISOString(),
    };
  });

  // Filter to only include sellers/administrators who have made sales
  const sellersWithSales = sellerStats.filter(
    (seller) => seller.ticketsSold > 0
  );

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
      const taxWithholdingIca = parseFloat(order.tax_withholding_ica || "0");
      const taxWithholdingFuente = parseFloat(order.tax_withholding_fuente || "0");
      const itemCount = (order.order_items || []).reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      acc[order.platform as "web" | "app" | "cash"].total += orderTotal;
      acc[order.platform as "web" | "app" | "cash"].count += itemCount;
      acc[order.platform as "web" | "app" | "cash"].marketplaceFee +=
        marketplaceFee;
      acc[order.platform as "web" | "app" | "cash"].processorFee +=
        processorFee;
      acc[order.platform as "web" | "app" | "cash"].taxWithholdingIca +=
        taxWithholdingIca;
      acc[order.platform as "web" | "app" | "cash"].taxWithholdingFuente +=
        taxWithholdingFuente;
      return acc;
    },
    {
      web: { total: 0, count: 0, marketplaceFee: 0, processorFee: 0, taxWithholdingIca: 0, taxWithholdingFuente: 0 },
      app: { total: 0, count: 0, marketplaceFee: 0, processorFee: 0, taxWithholdingIca: 0, taxWithholdingFuente: 0 },
      cash: { total: 0, count: 0, marketplaceFee: 0, processorFee: 0, taxWithholdingIca: 0, taxWithholdingFuente: 0 },
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

  // Aggregate fees and taxes across all platforms
  const totalMarketplaceFee =
    salesByPlatform.web.marketplaceFee +
    salesByPlatform.app.marketplaceFee +
    salesByPlatform.cash.marketplaceFee;
  const totalProcessorFee =
    salesByPlatform.web.processorFee +
    salesByPlatform.app.processorFee +
    salesByPlatform.cash.processorFee;
  const totalTaxWithholdingIca =
    salesByPlatform.web.taxWithholdingIca +
    salesByPlatform.app.taxWithholdingIca +
    salesByPlatform.cash.taxWithholdingIca;
  const totalTaxWithholdingFuente =
    salesByPlatform.web.taxWithholdingFuente +
    salesByPlatform.app.taxWithholdingFuente +
    salesByPlatform.cash.taxWithholdingFuente;

  // Organization receives: total - fees - taxes
  const organizationNetAmount =
    totalFromOrders - totalMarketplaceFee - totalProcessorFee - totalTaxWithholdingIca - totalTaxWithholdingFuente;

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
    // Organization perspective - real fees and taxes from orders
    org_summary: {
      gross_sales: totalFromOrders,
      marketplace_fee: totalMarketplaceFee,
      processor_fee: totalProcessorFee,
      tax_withholding_ica: totalTaxWithholdingIca,
      tax_withholding_fuente: totalTaxWithholdingFuente,
      net_amount: organizationNetAmount,
      // Breakdown by channel
      by_channel: {
        web: {
          gross: salesByPlatform.web.total,
          marketplace_fee: salesByPlatform.web.marketplaceFee,
          processor_fee: salesByPlatform.web.processorFee,
          tax_withholding_ica: salesByPlatform.web.taxWithholdingIca,
          tax_withholding_fuente: salesByPlatform.web.taxWithholdingFuente,
          net:
            salesByPlatform.web.total -
            salesByPlatform.web.marketplaceFee -
            salesByPlatform.web.processorFee -
            salesByPlatform.web.taxWithholdingIca -
            salesByPlatform.web.taxWithholdingFuente,
        },
        app: {
          gross: salesByPlatform.app.total,
          marketplace_fee: salesByPlatform.app.marketplaceFee,
          processor_fee: salesByPlatform.app.processorFee,
          tax_withholding_ica: salesByPlatform.app.taxWithholdingIca,
          tax_withholding_fuente: salesByPlatform.app.taxWithholdingFuente,
          net:
            salesByPlatform.app.total -
            salesByPlatform.app.marketplaceFee -
            salesByPlatform.app.processorFee -
            salesByPlatform.app.taxWithholdingIca -
            salesByPlatform.app.taxWithholdingFuente,
        },
        cash: {
          gross: salesByPlatform.cash.total,
          marketplace_fee: salesByPlatform.cash.marketplaceFee,
          processor_fee: salesByPlatform.cash.processorFee,
          tax_withholding_ica: salesByPlatform.cash.taxWithholdingIca,
          tax_withholding_fuente: salesByPlatform.cash.taxWithholdingFuente,
          net:
            salesByPlatform.cash.total -
            salesByPlatform.cash.marketplaceFee -
            salesByPlatform.cash.processorFee -
            salesByPlatform.cash.taxWithholdingIca -
            salesByPlatform.cash.taxWithholdingFuente,
        },
      },
    },
  };

  // Build sales records from orders and order items
  const sales = orders.flatMap((order) =>
    (order.order_items || []).map((item) => ({
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

  // Check if event is being cancelled
  const isCancellationPending =
    event.lifecycle_status === "cancellation_pending";

  // Build cancellation data if event is being cancelled
  const cancellationData = isCancellationPending
    ? {
        cancelledBy: event.cancelled_by || null,
        cancellationReason: event.cancellation_reason || null,
        cancellationInitiatedAt: event.cancellation_initiated_at || null,
        totalOrdersToRefund: orders.filter(
          (order) => order.payment_status === "paid"
        ).length,
        totalAmountToRefund: orders
          .filter((order) => order.payment_status === "paid")
          .reduce((sum, order) => sum + parseFloat(order.total_amount), 0),
        orders: orders
          .filter((order) => order.payment_status === "paid")
          .map((order) => ({
            orderId: order.id,
            orderDate: order.created_at,
            customerName: "", // TODO: Fetch from user table
            customerEmail: "", // TODO: Fetch from user table
            amount: parseFloat(order.total_amount),
            platform: order.platform as "web" | "app" | "cash",
            paymentId: order.payment_session_id,
            refundStatus: "pending" as const, // TODO: Fetch from refunds table
            refundId: null,
          })),
      }
    : null;

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
            <div className="flex items-center gap-3">
              <EventStatusToggle
                eventId={eventId}
                initialStatus={event.status ?? false}
                disabled={!canPublish || isCancellationPending}
                disabledReason={
                  isCancellationPending
                    ? "No se puede cambiar el estado durante la cancelación"
                    : "Completa la configuración para publicar"
                }
              />
              <EventCashSalesToggle
                eventId={eventId}
                initialCashEnabled={event.cash ?? false}
              />
            </div>
          </div>

          <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-12 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Settings className="h-6 w-6 text-zinc-500" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">Configura tu evento</h2>
                <p className="text-sm text-muted-foreground max-w-md">
                  Agrega los detalles de tu evento para poder publicarlo y
                  comenzar a vender entradas.
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
              disabled={!canPublish || isCancellationPending}
              disabledReason={
                isCancellationPending
                  ? "No se puede cambiar el estado durante la cancelación"
                  : "Completa la fecha y crea al menos una entrada para publicar"
              }
            />
            <EventCashSalesToggle
              eventId={eventId}
              initialCashEnabled={event.cash ?? false}
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
          sellers={sellersWithSales}
          cancellationData={cancellationData}
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
        sellers={sellersWithSales}
        cancellationData={cancellationData}
        showContentOnly
      />
    </div>
  );
}
