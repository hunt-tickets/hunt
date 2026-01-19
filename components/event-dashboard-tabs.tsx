"use client";

import { BarChart3, Globe, Users, AlertCircle } from "lucide-react";
import { EventDashboard } from "@/components/event-dashboard";
import { EventBorderaux } from "@/components/event-borderaux";
import { EventWebAnalytics } from "@/components/event-web-analytics";
import { SellersTable } from "@/components/sellers-table";
import { RefundManagementTab } from "@/components/refund-management-tab";
import { useEventTabs } from "@/contexts/event-tabs-context";

interface Sale {
  id: string;
  quantity: number;
  subtotal: number;
  pricePerTicket: number;
  paymentStatus: string;
  createdAt: string;
  platform: string; // 'web' | 'app' | 'cash'
  ticketTypeName: string;
  eventName?: string;
  userFullname: string;
  userEmail: string;
  promoterFullname?: string;
  promoterEmail?: string;
  isCash?: boolean;
  variableFee?: number;
  tax?: number;
  orderId?: string;
  boldId?: string | null;
  boldFecha?: string | null;
  boldEstado?: string | null;
  boldMetodoPago?: string | null;
  boldValorCompra?: number | null;
  boldPropina?: number | null;
  boldIva?: number | null;
  boldImpoconsumo?: number | null;
  boldValorTotal?: number | null;
  boldReteFuente?: number | null;
  boldReteIva?: number | null;
  boldReteIca?: number | null;
  boldComisionPorcentaje?: number | null;
  boldComisionFija?: number | null;
  boldTotalDeduccion?: number | null;
  boldDepositoCuenta?: number | null;
  boldBanco?: string | null;
  boldFranquicia?: string | null;
  boldPaisTarjeta?: string | null;
}

interface Ticket {
  id: string;
  quantity: number;
  analytics: {
    total: { quantity: number; total: number };
  };
}

interface Seller {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  cashSales: number;
  gatewaySales: number;
  ticketsSold: number;
  commission: number | null;
  created_at: string;
}

interface RefundOrder {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  platform: "web" | "app" | "cash";
  paymentId: string | null;
  refundStatus: "pending" | "processing" | "completed" | "failed";
  refundId?: string | null;
}

interface CancellationData {
  cancelledBy: string | null;
  cancellationReason: string | null;
  cancellationInitiatedAt: string | null;
  totalOrdersToRefund: number;
  totalAmountToRefund: number;
  orders: RefundOrder[];
}

interface EventDashboardTabsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  financialReport: any;
  sales: Sale[];
  tickets: Ticket[];
  eventId: string;
  eventName: string;
  eventFlyer: string;
  sellers: Seller[];
  showTabsOnly?: boolean;
  showContentOnly?: boolean;
  cancellationData?: CancellationData | null;
}

export function EventDashboardTabs({
  financialReport,
  sales,
  tickets,
  eventId,
  eventName,
  eventFlyer,
  sellers,
  showTabsOnly = false,
  showContentOnly = false,
  cancellationData = null,
}: EventDashboardTabsProps) {
  const { dashboardTab: activeTab, setDashboardTab: setActiveTab } =
    useEventTabs();

  const isCancellationPending = !!cancellationData;

  // Tabs section
  const tabsSection = (
    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <button
        onClick={() => setActiveTab("dashboard")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "dashboard"
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
        }`}
      >
        <BarChart3 className="h-4 w-4" />
        Resumen
      </button>

      <button
        onClick={() => setActiveTab("web")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "web"
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
        }`}
      >
        <Globe className="h-4 w-4" />
        Web
      </button>
      <button
        onClick={() => setActiveTab("vendedores")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "vendedores"
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
        }`}
      >
        <Users className="h-4 w-4" />
        Vendedores
      </button>
      <button
        onClick={() => setActiveTab("refunds")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "refunds"
            ? isCancellationPending
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "bg-white/10 text-white border border-white/20"
            : isCancellationPending
              ? "bg-amber-500/10 text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/20 border border-amber-500/20"
              : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
        }`}
      >
        <AlertCircle className="h-4 w-4" />
        Reembolsos
      </button>
    </div>
  );

  // Content section
  const contentSection = (
    <>
      {activeTab === "refunds" && (
        <RefundManagementTab
          eventId={eventId}
          cancellationData={cancellationData}
        />
      )}

      {activeTab === "dashboard" && (
        <EventDashboard
          financialReport={financialReport}
          sales={sales}
          tickets={tickets}
        />
      )}

      {activeTab === "borderaux" && (
        <EventBorderaux
          financialReport={financialReport}
          sales={sales}
          tickets={tickets}
        />
      )}

      {activeTab === "web" && (
        <EventWebAnalytics
          eventId={eventId}
          eventName={eventName}
          eventFlyer={eventFlyer}
          sales={sales}
        />
      )}

      {activeTab === "vendedores" && <SellersTable sellers={sellers} />}
    </>
  );

  // Return based on mode
  if (showTabsOnly) {
    return tabsSection;
  }

  if (showContentOnly) {
    return contentSection;
  }

  // Default: show both
  return (
    <div className="space-y-4">
      {tabsSection}
      {contentSection}
    </div>
  );
}
