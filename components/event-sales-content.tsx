"use client";

import { ShoppingCart, Users, Link } from "lucide-react";
import { EventTransactionsContent } from "@/components/event-transactions-content";
import { EventSellersContent } from "@/components/event-sellers-content";
import { EventLinksContent } from "@/components/event-links-content";
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

interface CompleteTransaction {
  id: string;
  created_at: string;
  user_fullname: string;
  user_email: string;
  ticket_name: string;
  event_name: string;
  quantity: number;
  price: number;
  variable_fee: number;
  tax: number;
  total: number;
  status: string;
  type: string;
  cash: boolean;
  order_id: string;
  promoter_fullname: string;
  promoter_email: string;
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

interface EventSalesContentProps {
  eventId: string;
  transactions: Transaction[];
  eventName?: string;
  isAdmin?: boolean;
  showTabsOnly?: boolean;
  showContentOnly?: boolean;
}

export function EventSalesContent({
  eventId,
  transactions,
  eventName = "",
  isAdmin = false,
  showTabsOnly = false,
  showContentOnly = false,
}: EventSalesContentProps) {
  const { salesTab: activeTab, setSalesTab: setActiveTab } = useEventTabs();

  // Transform transactions for EventTransactionsContent
  const simpleTransactions = transactions.map((t) => ({
    id: t.id,
    quantity: t.quantity,
    total: t.total,
    status: t.status,
    created_at: t.created_at,
    source: t.type,
    tickets: {
      name: t.ticket_name,
      price: t.price,
    },
    user: {
      name: t.user_fullname?.split(' ')[0] || null,
      lastName: t.user_fullname?.split(' ').slice(1).join(' ') || null,
      email: t.user_email,
    },
  }));

  // Tabs section
  const tabsSection = (
    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <button
        onClick={() => setActiveTab("sellers")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "sellers"
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
        }`}
      >
        <Users className="h-4 w-4" />
        Vendedores
      </button>
      <button
        onClick={() => setActiveTab("transactions")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "transactions"
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
        }`}
      >
        <ShoppingCart className="h-4 w-4" />
        Transacciones
      </button>
      <button
        onClick={() => setActiveTab("links")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "links"
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
        }`}
      >
        <Link className="h-4 w-4" />
        Links
      </button>
    </div>
  );

  // Content section
  const contentSection = (
    <>
      {activeTab === "sellers" && (
        <EventSellersContent eventId={eventId} transactions={transactions} />
      )}

      {activeTab === "transactions" && (
        <EventTransactionsContent
          eventName={eventName}
          transactions={simpleTransactions}
          completeTransactions={transactions as CompleteTransaction[]}
          isAdmin={isAdmin}
        />
      )}

      {activeTab === "links" && (
        <EventLinksContent eventId={eventId} />
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
