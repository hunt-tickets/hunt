"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, Ticket, TrendingUp, Globe, Banknote, Download } from "lucide-react";
import { useMemo, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Transaction {
  id: string;
  quantity: number;
  total: number;
  promoter_fullname: string;
  promoter_email: string;
  status: string;
  created_at: string;
  type: string;
  ticket_name: string;
}

interface EventSellersContentProps {
  eventId: string;
  transactions: Transaction[];
}

interface PromoterStats {
  promoter_fullname: string;
  promoter_email: string;
  total: {
    tickets: number;
    revenue: number;
    commission: number;
    transactions: number;
  };
  web: {
    tickets: number;
    revenue: number;
    commission: number;
    transactions: number;
  };
  cash: {
    tickets: number;
    revenue: number;
    commission: number;
    transactions: number;
  };
  ticketBreakdown: Record<string, number>;
}

export function EventSellersContent({ transactions }: EventSellersContentProps) {
  const [selectedPromoter, setSelectedPromoter] = useState<PromoterStats | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Group transactions by promoter and channel
  const promoterStats = useMemo(() => {
    const stats: Record<string, PromoterStats> = {};

    transactions.forEach((transaction) => {
      // Only include transactions with promoter (web and cash transactions)
      if (!transaction.promoter_email) {
        return;
      }

      const key = transaction.promoter_email;
      const isWeb = transaction.type === "web";
      const isCash = transaction.type === "cash";

      if (!stats[key]) {
        stats[key] = {
          promoter_fullname: transaction.promoter_fullname || "Sin nombre",
          promoter_email: transaction.promoter_email,
          total: { tickets: 0, revenue: 0, commission: 0, transactions: 0 },
          web: { tickets: 0, revenue: 0, commission: 0, transactions: 0 },
          cash: { tickets: 0, revenue: 0, commission: 0, transactions: 0 },
          ticketBreakdown: {},
        };
      }

      const commission = transaction.total * 0.05;

      // Update totals
      stats[key].total.tickets += transaction.quantity;
      stats[key].total.revenue += transaction.total;
      stats[key].total.commission += commission;
      stats[key].total.transactions += 1;

      // Update ticket breakdown
      if (!stats[key].ticketBreakdown[transaction.ticket_name]) {
        stats[key].ticketBreakdown[transaction.ticket_name] = 0;
      }
      stats[key].ticketBreakdown[transaction.ticket_name] += transaction.quantity;

      // Update channel-specific stats
      if (isWeb) {
        stats[key].web.tickets += transaction.quantity;
        stats[key].web.revenue += transaction.total;
        stats[key].web.commission += commission;
        stats[key].web.transactions += 1;
      } else if (isCash) {
        stats[key].cash.tickets += transaction.quantity;
        stats[key].cash.revenue += transaction.total;
        stats[key].cash.commission += commission;
        stats[key].cash.transactions += 1;
      }
    });

    return Object.values(stats).sort((a, b) => b.total.revenue - a.total.revenue);
  }, [transactions]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    return {
      totalPromoters: promoterStats.length,
      totalTicketsSold: promoterStats.reduce((sum, p) => sum + p.total.tickets, 0),
      totalRevenue: promoterStats.reduce((sum, p) => sum + p.total.revenue, 0),
      totalCommissions: promoterStats.reduce((sum, p) => sum + p.total.commission, 0),
    };
  }, [promoterStats]);

  const handleExportCSV = () => {
    const headers = [
      "Vendedor",
      "Email",
      "Total Tickets",
      "Total Ventas",
      "Comisión Total",
      "Tickets Web",
      "Ventas Web",
      "Comisión Web",
      "Tickets Efectivo",
      "Ventas Efectivo",
      "Comisión Efectivo",
      "Desglose por Tipo",
    ];

    const rows = promoterStats.map((p) => [
      p.promoter_fullname,
      p.promoter_email,
      p.total.tickets,
      p.total.revenue,
      p.total.commission,
      p.web.tickets,
      p.web.revenue,
      p.web.commission,
      p.cash.tickets,
      p.cash.revenue,
      p.cash.commission,
      Object.entries(p.ticketBreakdown)
        .map(([name, qty]) => `${name}: ${qty}`)
        .join("; "),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte-vendedores-${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-4">
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">
                Total Vendedores
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{summaryStats.totalPromoters}</div>
            <p className="text-xs text-white/30">Activos en el evento</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">
                Tickets Vendidos
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{summaryStats.totalTicketsSold}</div>
            <p className="text-xs text-white/30">Por vendedores</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">
                Total Recaudado
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(summaryStats.totalRevenue)}
            </div>
            <p className="text-xs text-white/30">Por vendedores</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">
                Comisiones
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(summaryStats.totalCommissions)}
            </div>
            <p className="text-xs text-white/30">Total a pagar</p>
          </CardContent>
        </Card>
      </div>

      {/* Header with Export Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Reporte Detallado por Vendedor</h3>
          <p className="text-xs text-white/40 mt-1">
            {promoterStats.length} vendedor{promoterStats.length !== 1 ? "es" : ""} con ventas
          </p>
        </div>
        {promoterStats.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-white/90 hover:bg-white text-black border border-white/80"
          >
            Exportar Reporte
            <Download className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Promoters Cards */}
      {promoterStats.length === 0 ? (
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 mb-2">No hay ventas por vendedores</p>
            <p className="text-sm text-white/30">
              Las ventas realizadas por vendedores aparecerán aquí
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {promoterStats.map((promoter) => (
            <Card
              key={promoter.promoter_email}
              className="bg-white/[0.02] border-white/10 cursor-pointer hover:border-white/20 transition-all"
              onClick={() => setSelectedPromoter(promoter)}
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold truncate">{promoter.promoter_fullname}</h3>
                  <p className="text-xs text-white/40 truncate">{promoter.promoter_email}</p>
                </div>

                {/* Main Stats */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40">Tickets</span>
                    <span className="text-sm font-semibold">{promoter.total.tickets}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/40">Ventas</span>
                    <span className="text-sm font-semibold">{formatCurrency(promoter.total.revenue)}</span>
                  </div>
                </div>

                {/* Channels Badge */}
                <div className="flex gap-1.5 mt-3">
                  {promoter.web.transactions > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                      <Globe className="h-3 w-3" />
                      {promoter.web.tickets}
                    </span>
                  )}
                  {promoter.cash.transactions > 0 && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                      <Banknote className="h-3 w-3" />
                      {promoter.cash.tickets}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Sheet */}
      <Sheet open={selectedPromoter !== null} onOpenChange={(open) => !open && setSelectedPromoter(null)}>
        <SheetContent className="w-full sm:max-w-lg bg-[#0a0a0a] border-white/10 overflow-y-auto">
          {selectedPromoter && (
            <div className="p-6">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-lg font-semibold text-white">
                  {selectedPromoter.promoter_fullname}
                </SheetTitle>
                <p className="text-xs text-white/40">{selectedPromoter.promoter_email}</p>
              </SheetHeader>

              <div className="space-y-4">
                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                    <p className="text-xs text-white/40 mb-1">Total Tickets</p>
                    <p className="text-xl font-bold">{selectedPromoter.total.tickets}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                    <p className="text-xs text-white/40 mb-1">Transacciones</p>
                    <p className="text-xl font-bold">{selectedPromoter.total.transactions}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                    <p className="text-xs text-white/40 mb-1">Total Ventas</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedPromoter.total.revenue)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                    <p className="text-xs text-white/40 mb-1">Comisión 5%</p>
                    <p className="text-lg font-bold text-green-400">{formatCurrency(selectedPromoter.total.commission)}</p>
                  </div>
                </div>

                {/* Ticket Breakdown */}
                {Object.keys(selectedPromoter.ticketBreakdown).length > 0 && (
                  <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                    <h4 className="text-sm font-semibold mb-3">Desglose por Tipo de Entrada</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedPromoter.ticketBreakdown)
                        .sort(([, a], [, b]) => b - a)
                        .map(([ticketName, quantity]) => (
                          <div key={ticketName} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <span className="text-sm text-white/70">{ticketName}</span>
                            <span className="text-sm font-semibold">{quantity}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Channel Breakdown */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold">Desglose por Canal</h4>

                  {/* Web Channel */}
                  {selectedPromoter.web.transactions > 0 && (
                    <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Globe className="h-4 w-4 text-purple-400" />
                        <span className="text-sm font-semibold text-purple-400">Web</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">Tickets</span>
                          <span className="font-semibold">{selectedPromoter.web.tickets}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">Transacciones</span>
                          <span className="font-semibold">{selectedPromoter.web.transactions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">Ventas</span>
                          <span className="font-semibold">{formatCurrency(selectedPromoter.web.revenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                          <span className="text-white/40">Comisión</span>
                          <span className="font-semibold text-green-400">{formatCurrency(selectedPromoter.web.commission)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash Channel */}
                  {selectedPromoter.cash.transactions > 0 && (
                    <div className="p-4 rounded-lg bg-white/[0.02] border border-white/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Banknote className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-semibold text-green-400">Efectivo</span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">Tickets</span>
                          <span className="font-semibold">{selectedPromoter.cash.tickets}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">Transacciones</span>
                          <span className="font-semibold">{selectedPromoter.cash.transactions}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-white/40">Ventas</span>
                          <span className="font-semibold">{formatCurrency(selectedPromoter.cash.revenue)}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                          <span className="text-white/40">Comisión</span>
                          <span className="font-semibold text-green-400">{formatCurrency(selectedPromoter.cash.commission)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
