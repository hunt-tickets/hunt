"use client";

import { BarChart3, FileSpreadsheet, Globe, Users } from "lucide-react";
import { EventDashboard } from "@/components/event-dashboard";
import { EventBorderaux } from "@/components/event-borderaux";
import { EventWebAnalytics } from "@/components/event-web-analytics";
import { SellersTable } from "@/components/sellers-table";
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

interface EventDashboardTabsProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  financialReport: any;
  sales: Sale[];
  tickets: Ticket[];
  eventId: string;
  eventName: string;
  eventFlyer: string;
  showTabsOnly?: boolean;
  showContentOnly?: boolean;
}

export function EventDashboardTabs({
  financialReport,
  sales,
  tickets,
  eventId,
  eventName,
  eventFlyer,
  showTabsOnly = false,
  showContentOnly = false,
}: EventDashboardTabsProps) {
  const { dashboardTab: activeTab, setDashboardTab: setActiveTab } = useEventTabs();

  // Mock sellers data - In production, fetch from database
  const mockSellers = [
    {
      id: "seller-1",
      name: "Carlos",
      lastName: "Rodríguez",
      email: "carlos@example.com",
      phone: "+57 300 123 4567",
      role: "seller",
      cashSales: 1500000,
      gatewaySales: 1000000,
      ticketsSold: 45,
      commission: 250000,
      created_at: new Date().toISOString(),
    },
    {
      id: "seller-2",
      name: "Ana",
      lastName: "Martínez",
      email: "ana@example.com",
      phone: "+57 301 234 5678",
      role: "seller",
      cashSales: 800000,
      gatewaySales: 1000000,
      ticketsSold: 32,
      commission: null,
      created_at: new Date().toISOString(),
    },
    {
      id: "seller-3",
      name: "Luis",
      lastName: "García",
      email: "luis@example.com",
      phone: "+57 302 345 6789",
      role: "administrator",
      cashSales: 2000000,
      gatewaySales: 1200000,
      ticketsSold: 58,
      commission: 320000,
      created_at: new Date().toISOString(),
    },
  ];

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
        Dashboard
      </button>
      <button
        onClick={() => setActiveTab("borderaux")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "borderaux"
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
        }`}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Cierre
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
    </div>
  );

  // Content section
  const contentSection = (
    <>
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

      {activeTab === "vendedores" && (
        <SellersTable sellers={mockSellers} />
      )}
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
