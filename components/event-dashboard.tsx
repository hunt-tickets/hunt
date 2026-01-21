"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  Ticket,
  ShoppingCart,
} from "lucide-react";
import { SalesDistributionChart, RevenueByChannelChart, SalesFunnelChart, DailySalesChart } from "@/components/event-charts";

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

interface Order {
  id: string;
  totalAmount: string;
  createdAt: Date;
  platform: string;
  orderItems: Array<{
    quantity: number;
  }>;
}

interface EventDashboardProps {
  financialReport: FinancialReport;
  orders: Order[];
  tickets: Ticket[];
}

export function EventDashboard({ financialReport, orders, tickets }: EventDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total tickets available and sold
  const totalTicketsAvailable = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  const totalTicketsSold = tickets.reduce((sum, ticket) => sum + ticket.analytics.total.quantity, 0);
  const ticketsSoldPercentage = totalTicketsAvailable > 0
    ? (totalTicketsSold / totalTicketsAvailable) * 100
    : 0;

  // Calculate average price per purchase
  const totalPurchases = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount), 0);
  const averagePricePerPurchase = totalPurchases > 0
    ? (totalRevenue / totalPurchases)
    : 0;

  // Calculate sales funnel data
  const totalVisits = totalTicketsAvailable;
  const totalAddedToCart = orders.length > 0 ? Math.ceil(orders.length * 0.8) : 0;
  const totalCompleted = totalTicketsSold;

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-white/60 uppercase tracking-wider">Recaudo Total</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(financialReport.channels_total)}
            </div>
            <p className="text-xs text-gray-500 dark:text-white/60">
              Promedio: {formatCurrency(financialReport.channels_total / (financialReport.tickets_sold.total || 1))}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-white/60 uppercase tracking-wider">Total Tickets</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {totalTicketsSold} / {totalTicketsAvailable}
            </div>
            <p className="text-xs text-gray-500 dark:text-white/60">
              {ticketsSoldPercentage.toFixed(1)}% vendidos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-white/60 uppercase tracking-wider">Precio por Compra</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(averagePricePerPurchase)}
            </div>
            <p className="text-xs text-gray-500 dark:text-white/60">
              Promedio de {totalPurchases} compras
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Daily Sales Chart */}
      <DailySalesChart orders={orders} />

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <SalesDistributionChart
          app={financialReport.tickets_sold.app}
          web={financialReport.tickets_sold.web}
          cash={financialReport.tickets_sold.cash}
        />
        <RevenueByChannelChart
          appTotal={financialReport.app_total}
          webTotal={financialReport.web_total}
          cashTotal={financialReport.cash_total}
        />
      </div>

      <SalesFunnelChart
        visits={totalVisits}
        addedToCart={totalAddedToCart}
        completed={totalCompleted}
      />

      {/* Financial Summary - Organization Perspective */}
      {financialReport.org_summary && (
        <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumen Financiero</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Main Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-white/60">Ventas Brutas</span>
                  <span className="font-medium">
                    {formatCurrency(financialReport.org_summary.gross_sales)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-white/60">Comisión Hunt</span>
                  <span className="font-medium text-red-500 dark:text-red-400">
                    -{formatCurrency(financialReport.org_summary.marketplace_fee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-white/60">Comisión Pasarela de Pago</span>
                  <span className="font-medium text-red-500 dark:text-red-400">
                    -{formatCurrency(financialReport.org_summary.processor_fee)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-white/60">Retención ICA</span>
                  <span className="font-medium text-red-500 dark:text-red-400">
                    -{formatCurrency(financialReport.org_summary.tax_withholding_ica)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-white/60">Retención en la Fuente</span>
                  <span className="font-medium text-red-500 dark:text-red-400">
                    -{formatCurrency(financialReport.org_summary.tax_withholding_fuente)}
                  </span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-white/5 flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-white/70 font-medium">Total de Deducciones</span>
                  <span className="font-semibold text-red-600 dark:text-red-500">
                    -{formatCurrency(
                      financialReport.org_summary.marketplace_fee +
                      financialReport.org_summary.processor_fee +
                      financialReport.org_summary.tax_withholding_ica +
                      financialReport.org_summary.tax_withholding_fuente
                    )}
                  </span>
                </div>
                <div className="pt-3 mt-2 border-t border-gray-300 dark:border-white/10 flex justify-between items-center">
                  <span className="text-sm font-semibold">Neto a Recibir</span>
                  <span className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(financialReport.org_summary.net_amount)}
                  </span>
                </div>
              </div>

              {/* Breakdown by Channel */}
              {financialReport.org_summary.by_channel && (
                <div className="pt-4 border-t border-gray-200 dark:border-white/5">
                  <h4 className="text-xs text-gray-500 dark:text-white/60 uppercase tracking-wider mb-3">
                    Desglose por Canal
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {/* Web */}
                    {financialReport.org_summary.by_channel.web.gross > 0 && (
                      <div className="p-3 rounded-lg bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                        <div className="text-xs text-gray-500 dark:text-white/60 mb-2">Web</div>
                        <div className="text-sm font-bold mb-1">
                          {formatCurrency(financialReport.org_summary.by_channel.web.net)}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-white/40">
                          de {formatCurrency(financialReport.org_summary.by_channel.web.gross)}
                        </div>
                      </div>
                    )}
                    {/* App */}
                    {financialReport.org_summary.by_channel.app.gross > 0 && (
                      <div className="p-3 rounded-lg bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                        <div className="text-xs text-gray-500 dark:text-white/60 mb-2">App</div>
                        <div className="text-sm font-bold mb-1">
                          {formatCurrency(financialReport.org_summary.by_channel.app.net)}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-white/40">
                          de {formatCurrency(financialReport.org_summary.by_channel.app.gross)}
                        </div>
                      </div>
                    )}
                    {/* Cash */}
                    {financialReport.org_summary.by_channel.cash.gross > 0 && (
                      <div className="p-3 rounded-lg bg-gray-100 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                        <div className="text-xs text-gray-500 dark:text-white/60 mb-2">Efectivo</div>
                        <div className="text-sm font-bold mb-1">
                          {formatCurrency(financialReport.org_summary.by_channel.cash.net)}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-white/40">
                          de {formatCurrency(financialReport.org_summary.by_channel.cash.gross)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
