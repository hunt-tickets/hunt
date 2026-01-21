import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventDashboardTabs } from "@/components/event-dashboard-tabs";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { EventStatusToggle } from "@/components/event-status-toggle";
import { EventCashSalesToggle } from "@/components/event-cash-sales-toggle";
import { EventOptionsMenu } from "@/components/event-options-menu";
import { member, events, orders as ordersTable } from "@/lib/schema";
import { db } from "@/lib/drizzle";
import { eq, and, isNull } from "drizzle-orm";
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

  // Check if user can view dashboard (sellers cannot)
  const canUpdateDashboard = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { dashboard: ["view"] },
      organizationId,
    },
  });

  if (!canUpdateDashboard?.success) {
    // Redirect sellers to the vender page for this event
    redirect(
      `/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/vender`
    );
  }

  const [event, organizationMembers] = await Promise.all([
    // Fetch event with ticket types and orders using Drizzle with relations
    // Exclude cancelled/deleted events
    db.query.events.findFirst({
      where: and(eq(events.id, eventId), isNull(events.deletedAt)),
      with: {
        ticketTypes: true,
        orders: {
          where: eq(ordersTable.paymentStatus, "paid"),
          with: {
            orderItems: true,
            user: {
              columns: {
                id: true,
                name: true,
                nombres: true,
                apellidos: true,
                email: true,
              },
            },
            refunds: true,
          },
        },
      },
    }),

    // Fetch organization members with user details
    db.query.member.findMany({
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
    }),
  ]);

  if (!event) {
    notFound();
  }

  const ticketTypes = event.ticketTypes || [];
  const orders = event.orders || [];
  const configUrl = `/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/configuracion`;

  // Generate server-side timestamp
  const serverTimestamp = new Date().toLocaleString("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Bogota",
  });

  const ordersByPlatform = orders.reduce(
    (acc, order) => {
      const platform = order.platform as "web" | "app" | "cash";
      const orderTotal = parseFloat(order.totalAmount);
      const marketplaceFee = parseFloat(order.marketplaceFee || "0");
      const processorFee = parseFloat(order.processorFee || "0");
      const taxWithholdingIca = parseFloat(order.taxWithholdingIca || "0");
      const taxWithholdingFuente = parseFloat(
        order.taxWithholdingFuente || "0"
      );

      // Count tickets from order items
      const itemCount = (order.orderItems || []).reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      acc[platform].total += orderTotal;
      acc[platform].count += itemCount;
      acc[platform].marketplaceFee += marketplaceFee;
      acc[platform].processorFee += processorFee;
      acc[platform].taxWithholdingIca += taxWithholdingIca;
      acc[platform].taxWithholdingFuente += taxWithholdingFuente;

      return acc;
    },
    {
      web: {
        total: 0,
        count: 0,
        marketplaceFee: 0,
        processorFee: 0,
        taxWithholdingIca: 0,
        taxWithholdingFuente: 0,
      },
      app: {
        total: 0,
        count: 0,
        marketplaceFee: 0,
        processorFee: 0,
        taxWithholdingIca: 0,
        taxWithholdingFuente: 0,
      },
      cash: {
        total: 0,
        count: 0,
        marketplaceFee: 0,
        processorFee: 0,
        taxWithholdingIca: 0,
        taxWithholdingFuente: 0,
      },
    }
  );

  // Calculate totals
  const totalFromOrders =
    ordersByPlatform.web.total +
    ordersByPlatform.app.total +
    ordersByPlatform.cash.total;

  const totalTicketsFromOrders =
    ordersByPlatform.web.count +
    ordersByPlatform.app.count +
    ordersByPlatform.cash.count;

  // Aggregate fees and taxes
  const totalMarketplaceFee =
    ordersByPlatform.web.marketplaceFee +
    ordersByPlatform.app.marketplaceFee +
    ordersByPlatform.cash.marketplaceFee;

  const totalProcessorFee =
    ordersByPlatform.web.processorFee +
    ordersByPlatform.app.processorFee +
    ordersByPlatform.cash.processorFee;

  const totalTaxWithholdingIca =
    ordersByPlatform.web.taxWithholdingIca +
    ordersByPlatform.app.taxWithholdingIca +
    ordersByPlatform.cash.taxWithholdingIca;

  const totalTaxWithholdingFuente =
    ordersByPlatform.web.taxWithholdingFuente +
    ordersByPlatform.app.taxWithholdingFuente +
    ordersByPlatform.cash.taxWithholdingFuente;

  // Calculate net amount (what organization receives)
  const organizationNetAmount =
    totalFromOrders -
    totalMarketplaceFee -
    totalProcessorFee -
    totalTaxWithholdingIca -
    totalTaxWithholdingFuente;

  // Build financial report matching EventDashboard expectations
  const financialReport = {
    // Platform totals
    app_total: ordersByPlatform.app.total,
    web_total: ordersByPlatform.web.total,
    cash_total: ordersByPlatform.cash.total,
    channels_total: ordersByPlatform.web.total + ordersByPlatform.app.total,

    // Tickets sold by platform
    tickets_sold: {
      app: ordersByPlatform.app.count,
      web: ordersByPlatform.web.count,
      cash: ordersByPlatform.cash.count,
      total: totalTicketsFromOrders,
    },

    // Organization summary (optional but used if available)
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
          gross: ordersByPlatform.web.total,
          net:
            ordersByPlatform.web.total -
            ordersByPlatform.web.marketplaceFee -
            ordersByPlatform.web.processorFee -
            ordersByPlatform.web.taxWithholdingIca -
            ordersByPlatform.web.taxWithholdingFuente,
        },
        app: {
          gross: ordersByPlatform.app.total,
          net:
            ordersByPlatform.app.total -
            ordersByPlatform.app.marketplaceFee -
            ordersByPlatform.app.processorFee -
            ordersByPlatform.app.taxWithholdingIca -
            ordersByPlatform.app.taxWithholdingFuente,
        },
        cash: {
          gross: ordersByPlatform.cash.total,
          net:
            ordersByPlatform.cash.total -
            ordersByPlatform.cash.marketplaceFee -
            ordersByPlatform.cash.processorFee -
            ordersByPlatform.cash.taxWithholdingIca -
            ordersByPlatform.cash.taxWithholdingFuente,
        },
      },
    },
  };

  // Build sales array for EventDashboard
  const sales = orders.map((order) => ({
    id: order.id,
    quantity: (order.orderItems || []).reduce(
      (sum, item) => sum + item.quantity,
      0
    ),
    subtotal: parseFloat(order.totalAmount),
    pricePerTicket:
      (order.orderItems || []).length > 0
        ? parseFloat(order.totalAmount) /
          (order.orderItems || []).reduce((sum, item) => sum + item.quantity, 0)
        : 0,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt.toISOString(),
    platform: order.platform,
    ticketTypeName: (order.orderItems || [])[0]?.ticketTypeId || "Unknown",
    userFullname:
      order.user?.nombres && order.user?.apellidos
        ? `${order.user.nombres} ${order.user.apellidos}`
        : order.user?.name || "Unknown",
    userEmail: order.user?.email || "Unknown",
    isCash: order.platform === "cash",
  }));

  // Build tickets array for EventDashboard
  const tickets = ticketTypes.map((ticketType) => {
    // Calculate sold tickets for this type from orders
    const soldQuantity = orders.reduce((sum, order) => {
      const itemsOfThisType = (order.orderItems || []).filter(
        (item) => item.ticketTypeId === ticketType.id
      );
      return (
        sum +
        itemsOfThisType.reduce((itemSum, item) => itemSum + item.quantity, 0)
      );
    }, 0);

    const totalRevenue = orders.reduce((sum, order) => {
      const itemsOfThisType = (order.orderItems || []).filter(
        (item) => item.ticketTypeId === ticketType.id
      );
      return (
        sum +
        itemsOfThisType.reduce(
          (itemSum, item) =>
            itemSum + item.quantity * parseFloat(item.pricePerTicket),
          0
        )
      );
    }, 0);

    return {
      id: ticketType.id,
      quantity: ticketType.capacity,
      analytics: {
        total: {
          quantity: soldQuantity,
          total: totalRevenue,
        },
      },
    };
  });

  // Build sellers data from organization members and orders
  const sellers = organizationMembers.map((memberRecord) => {
    const sellerId = memberRecord.userId;

    // Filter orders sold by this seller
    const sellerOrders = orders.filter((order) => order.soldBy === sellerId);

    // Calculate cash sales (platform = 'cash')
    const cashSales = sellerOrders
      .filter((order) => order.platform === "cash")
      .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    // Calculate gateway sales (platform = 'web' or 'app')
    const gatewaySales = sellerOrders
      .filter((order) => order.platform === "web" || order.platform === "app")
      .reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);

    // Calculate total tickets sold by counting order_items
    const ticketsSold = sellerOrders.reduce(
      (sum, order) =>
        sum +
        (order.orderItems || []).reduce(
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

  // Filter to only include sellers who have made sales
  const sellersWithSales = sellers.filter((seller) => seller.ticketsSold > 0);

  // Build orders with refund details
  const ordersWithRefunds = orders.map((order) => ({
    id: order.id,
    userId: order.userId,
    eventId: order.eventId,
    totalAmount: order.totalAmount,
    currency: order.currency,
    paymentStatus: order.paymentStatus,
    platform: order.platform,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    user: order.user,
    refund: order.refunds && order.refunds.length > 0
      ? {
          id: order.refunds[0].id,
          amount: order.refunds[0].amount,
          status: order.refunds[0].status,
          requestedAt: order.refunds[0].requestedAt,
          processedAt: order.refunds[0].processedAt,
          reason: order.refunds[0].reason,
        }
      : null,
  }));

  // Build cancellation metadata if event is in cancellation pending
  // Note: We only send metadata, not the orders array (already in ordersWithRefunds)
  const cancellationMetadata =
    event.lifecycleStatus === "cancellation_pending"
      ? {
          cancelledBy: event.cancelledBy,
          cancellationReason: event.cancellationReason,
          cancellationInitiatedAt: event.cancellationInitiatedAt?.toISOString() || null,
        }
      : null;

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
                disabled={
                  !canUpdateDashboard ||
                  event.lifecycleStatus === "cancellation_pending"
                }
                disabledReason={
                  event.lifecycleStatus === "cancellation_pending"
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
        eventName={event.name ?? "Sin nombre"}
        subtitle={serverTimestamp}
        rightContent={
          <div className="flex items-center gap-3">
            <EventStatusToggle
              eventId={eventId}
              initialStatus={event.status ?? false}
              disabled={
                !canUpdateDashboard ||
                event.lifecycleStatus === "cancellation_pending"
              }
              disabledReason={
                event.lifecycleStatus === "cancellation_pending"
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
          eventId={eventId}
          eventName={event.name ?? "Sin nombre"}
          eventFlyer={event.flyer ?? "/event-placeholder.svg"}
          financialReport={financialReport}
          sales={sales}
          tickets={tickets}
          sellers={sellersWithSales}
          orders={ordersWithRefunds}
          isInCancellationPending={
            event.lifecycleStatus === "cancellation_pending"
          }
          cancellationMetadata={cancellationMetadata}
          showTabsOnly
        />
      </EventStickyHeader>

      {/* Setup banner - shown if event can't be published yet */}
      {!canUpdateDashboard && (
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
        eventId={eventId}
        eventName={event.name ?? "Sin nombre"}
        eventFlyer={event.flyer ?? "/event-placeholder.svg"}
        financialReport={financialReport}
        sales={sales}
        tickets={tickets}
        sellers={sellersWithSales}
        orders={ordersWithRefunds}
        isInCancellationPending={
          event.lifecycleStatus === "cancellation_pending"
        }
        cancellationMetadata={cancellationMetadata}
        showContentOnly
      />
    </div>
  );
}
