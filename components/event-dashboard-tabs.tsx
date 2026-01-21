"use client";

import { BarChart3, Globe, Users, AlertCircle } from "lucide-react";
import { EventDashboard } from "@/components/event-dashboard";
import { EventWebAnalytics } from "@/components/event-web-analytics";
import { SellersTable } from "@/components/sellers-table";
import { RefundManagementTab } from "@/components/refund-management-tab";
import { useEventTabs } from "@/contexts/event-tabs-context";

interface Seller {
  id: string;
  userId: string;
  name: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  role: "seller" | "administrator" | "owner";
  cashSales: number;
  gatewaySales: number;
  ticketsSold: number;
  commission: null;
  created_at: string;
}

interface Ticket {
  id: string;
  quantity: number;
  analytics: {
    total: { quantity: number; total: number };
  };
}

interface FinancialReport {
  app_total: number;
  web_total: number;
  cash_total: number;
  channels_total: number;
  tickets_sold: {
    app: number;
    web: number;
    cash: number;
    total: number;
  };
  org_summary?: {
    gross_sales: number;
    marketplace_fee: number;
    processor_fee: number;
    tax_withholding_ica: number;
    tax_withholding_fuente: number;
    net_amount: number;
    by_channel: {
      web: { gross: number; net: number };
      app: { gross: number; net: number };
      cash: { gross: number; net: number };
    };
  };
}

interface OrderWithDetails {
  id: string;
  userId: string;
  eventId: string;
  totalAmount: string;
  currency: string;
  paymentStatus: string;
  platform: string;
  createdAt: Date;
  paidAt: Date | null;
  user: {
    id: string;
    name: string;
    nombres: string | null;
    apellidos: string | null;
    email: string;
  };
  orderItems: Array<{
    id: string;
    ticketTypeId: string;
    quantity: number;
    pricePerTicket: string;
    subtotal: string;
  }>;
  refund?: {
    id: string;
    amount: string;
    status: string;
    requestedAt: Date;
    processedAt: Date | null;
    reason: string;
  } | null;
}

interface CancellationMetadata {
  cancelledBy: string | null;
  cancellationReason: string | null;
  cancellationInitiatedAt: string | null;
}

interface EventDashboardTabsProps {
  eventId: string;
  eventName: string;
  eventFlyer: string;
  financialReport: FinancialReport;
  tickets: Ticket[];
  sellers: Seller[];
  orders: OrderWithDetails[];
  isInCancellationPending: boolean;
  cancellationMetadata?: CancellationMetadata | null;
  showTabsOnly?: boolean;
  showContentOnly?: boolean;
}

export function EventDashboardTabs({
  eventId,
  eventName,
  eventFlyer,
  financialReport,
  tickets,
  sellers,
  orders,
  isInCancellationPending,
  cancellationMetadata,
  showTabsOnly = false,
  showContentOnly = false,
}: EventDashboardTabsProps) {
  const { dashboardTab: activeTab, setDashboardTab: setActiveTab } =
    useEventTabs();

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
      {/* TODO: Implement refunds tab later */}
      <button
        onClick={() => setActiveTab("refunds")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "refunds"
            ? isInCancellationPending
              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              : "bg-white/10 text-white border border-white/20"
            : isInCancellationPending
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
          orders={orders}
          isInCancellationPending={isInCancellationPending}
          cancellationMetadata={cancellationMetadata}
        />
      )}

      {activeTab === "dashboard" && (
        <EventDashboard
          financialReport={financialReport}
          orders={orders}
          tickets={tickets}
        />
      )}

      {activeTab === "web" && (
        <EventWebAnalytics
          eventId={eventId}
          eventName={eventName}
          eventFlyer={eventFlyer}
          orders={orders}
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
