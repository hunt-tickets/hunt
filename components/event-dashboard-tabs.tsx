"use client";

import { BarChart3, FileSpreadsheet, Globe } from "lucide-react";
import { EventDashboard } from "@/components/event-dashboard";
import { EventBorderaux } from "@/components/event-borderaux";
import { EventWebAnalytics } from "@/components/event-web-analytics";
import { useEventTabs } from "@/contexts/event-tabs-context";

interface Transaction {
  id: string;
  quantity: number;
  total: number;
  price: number;
  status: string;
  created_at: string;
  type: string;
  ticket_name: string;
  event_name: string;
  user_fullname: string;
  user_email: string;
  promoter_fullname: string;
  promoter_email: string;
  cash?: boolean;
  variable_fee: number;
  tax: number;
  order_id: string;
  bold_id: string | null;
  bold_fecha: string | null;
  bold_estado: string | null;
  bold_metodo_pago: string | null;
  bold_valor_compra?: number | null;
  bold_propina?: number | null;
  bold_iva?: number | null;
  bold_impoconsumo?: number | null;
  bold_valor_total?: number | null;
  bold_rete_fuente?: number | null;
  bold_rete_iva?: number | null;
  bold_rete_ica?: number | null;
  bold_comision_porcentaje?: number | null;
  bold_comision_fija?: number | null;
  bold_total_deduccion?: number | null;
  bold_deposito_cuenta?: number | null;
  bold_banco?: string | null;
  bold_franquicia?: string | null;
  bold_pais_tarjeta?: string | null;
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
  transactions: Transaction[];
  tickets: Ticket[];
  eventId: string;
  eventName: string;
  eventFlyer: string;
  showTabsOnly?: boolean;
  showContentOnly?: boolean;
}

export function EventDashboardTabs({
  financialReport,
  transactions,
  tickets,
  eventId,
  eventName,
  eventFlyer,
  showTabsOnly = false,
  showContentOnly = false,
}: EventDashboardTabsProps) {
  const { dashboardTab: activeTab, setDashboardTab: setActiveTab, chartColor, setChartColor } = useEventTabs();

  const colorOptions = [
    { name: "Sin color", value: "gray", colors: ["#71717a", "#737373", "#78716c", "#6b7280", "#64748b"] },
    { name: "Azul", value: "blue", colors: ["#3b82f6", "#60a5fa", "#0ea5e9", "#38bdf8", "#0284c7"] },
    { name: "Amarillo", value: "yellow", colors: ["#eab308", "#fbbf24", "#f59e0b", "#d97706", "#b45309"] },
    { name: "Verde", value: "green", colors: ["#22c55e", "#4ade80", "#10b981", "#34d399", "#059669"] },
    { name: "Morado", value: "purple", colors: ["#a855f7", "#c084fc", "#9333ea", "#a78bfa", "#7c3aed"] },
    { name: "Verde azulado", value: "teal", colors: ["#14b8a6", "#2dd4bf", "#0d9488", "#5eead4", "#0f766e"] },
    { name: "Naranja", value: "orange", colors: ["#f97316", "#fb923c", "#ea580c", "#fdba74", "#c2410c"] },
    { name: "Rosa", value: "pink", colors: ["#ec4899", "#f472b6", "#db2777", "#f9a8d4", "#be185d"] },
    { name: "Rojo", value: "red", colors: ["#ef4444", "#f87171", "#dc2626", "#fca5a5", "#b91c1c"] },
  ];

  // Tabs section
  const tabsSection = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
      </div>

      {/* Color Selector */}
      {activeTab === "dashboard" && (
        <div className="relative group w-full sm:w-auto">
          <select
            value={chartColor}
            onChange={(e) => setChartColor(e.target.value)}
            className="appearance-none w-full sm:w-auto pl-3 pr-20 py-2 text-xs font-medium rounded-full bg-white/5 border border-white/10 text-white hover:bg-white/10 focus:bg-white/10 focus:border-white/20 focus:outline-none transition-all cursor-pointer"
          >
            {colorOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-zinc-900">
                {option.name}
              </option>
            ))}
          </select>
          {/* Color dots preview */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-0.5 pointer-events-none">
            {colorOptions.find(c => c.value === chartColor)?.colors.slice(0, 5).map((color, index) => (
              <div
                key={index}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Content section
  const contentSection = (
    <>
      {activeTab === "dashboard" && (
        <EventDashboard
          financialReport={financialReport}
          transactions={transactions}
          tickets={tickets}
          chartColor={chartColor}
          colorPalette={colorOptions.find(c => c.value === chartColor)?.colors || colorOptions[0].colors}
        />
      )}

      {activeTab === "borderaux" && (
        <EventBorderaux
          financialReport={financialReport}
          transactions={transactions}
          tickets={tickets}
        />
      )}

      {activeTab === "web" && (
        <EventWebAnalytics
          eventId={eventId}
          eventName={eventName}
          eventFlyer={eventFlyer}
          transactions={transactions}
        />
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
