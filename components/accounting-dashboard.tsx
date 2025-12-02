"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Receipt, DollarSign, Ticket, CreditCard } from "lucide-react";

interface AccountingSummary {
  totalIngresos: number;
  totalTicketsSold: number;
  totalFees: number;
  totalTax: number;
  byChannel: {
    app: number;
    web: number;
    cash: number;
  };
  monthlyData: Array<{
    month: string;
    ingresos: number;
    transactions: number;
  }>;
  topEvents: Array<{
    name: string;
    revenue: number;
    tickets: number;
  }>;
  transactionCount: number;
}

interface AccountingDashboardProps {
  summary: AccountingSummary;
}

export function AccountingDashboard({ summary }: AccountingDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate growth (comparing last month vs previous month)
  const lastMonth = summary.monthlyData[summary.monthlyData.length - 1];
  const previousMonth = summary.monthlyData[summary.monthlyData.length - 2];
  const growth = previousMonth?.ingresos
    ? ((lastMonth.ingresos - previousMonth.ingresos) / previousMonth.ingresos) * 100
    : 0;

  // Calculate max for bar chart
  const maxMonthlyIngresos = Math.max(...summary.monthlyData.map(d => d.ingresos), 1);

  // Calculate channel total for pie chart percentages
  const channelTotal = summary.byChannel.app + summary.byChannel.web + summary.byChannel.cash;

  const channelData = [
    { name: 'App Móvil', value: summary.byChannel.app, color: 'rgba(139, 92, 246, 0.8)' },
    { name: 'Web', value: summary.byChannel.web, color: 'rgba(6, 182, 212, 0.8)' },
    { name: 'Efectivo', value: summary.byChannel.cash, color: 'rgba(16, 185, 129, 0.8)' },
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Key Metrics */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Ingresos Totales</span>
            </div>
            <div className="text-2xl font-bold mb-1 text-green-400">
              {formatCurrency(summary.totalIngresos)}
            </div>
            <p className="text-xs text-white/30 flex items-center gap-1">
              {growth >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">+{growth.toFixed(1)}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-red-400" />
                  <span className="text-red-400">{growth.toFixed(1)}%</span>
                </>
              )}
              <span>vs mes anterior</span>
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Tickets Vendidos</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {summary.totalTicketsSold.toLocaleString()}
            </div>
            <p className="text-xs text-white/30">
              {summary.transactionCount.toLocaleString()} transacciones
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Comisiones</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(summary.totalFees)}
            </div>
            <p className="text-xs text-white/30">
              Fees generados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Receipt className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">IVA Recaudado</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(summary.totalTax)}
            </div>
            <p className="text-xs text-white/30">
              Impuestos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Revenue Bar Chart */}
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-end gap-2 pt-4">
              {summary.monthlyData.map((data, index) => {
                const heightPercent = (data.ingresos / maxMonthlyIngresos) * 100;
                const [year, month] = data.month.split('-');
                const label = `${month}/${year.slice(2)}`;

                return (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center group relative"
                  >
                    <div className="w-full flex flex-col justify-end h-[240px]">
                      <div
                        className="w-full bg-gradient-to-t from-green-600 to-green-500 rounded-t transition-all duration-300 hover:from-green-500 hover:to-green-400 cursor-pointer min-h-[4px]"
                        style={{ height: `${Math.max(heightPercent, 2)}%` }}
                      />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-[250px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                        <div className="font-semibold text-white mb-1">{label}</div>
                        <div className="text-white/80">{formatCurrency(data.ingresos)}</div>
                        <div className="text-white/60">{data.transactions} transacciones</div>
                      </div>
                    </div>

                    <span className="text-[10px] text-white/40 mt-2">{label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Channel Distribution Donut Chart */}
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Distribución por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-6">
                {/* Donut Chart */}
                <div className="relative w-44 h-44">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {(() => {
                      let cumulativePercent = 0;
                      return channelData.map((item, index) => {
                        const percent = (item.value / channelTotal) * 100;
                        const strokeDasharray = `${percent} ${100 - percent}`;
                        const strokeDashoffset = -cumulativePercent;
                        cumulativePercent += percent;

                        return (
                          <circle
                            key={index}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={item.color}
                            strokeWidth="16"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                            pathLength="100"
                            className="transition-all duration-500"
                          />
                        );
                      });
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold">{formatCurrency(channelTotal)}</div>
                      <div className="text-xs text-white/50">Total</div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4">
                  {channelData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-white/60">
                        {item.name} ({((item.value / channelTotal) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Events */}
      <Card className="bg-white/[0.02] border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top 10 Eventos por Ingresos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {summary.topEvents.map((event, index) => {
              const percentage = (event.revenue / summary.totalIngresos) * 100;
              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-white/40 font-mono text-xs">{(index + 1).toString().padStart(2, '0')}</span>
                      <span className="font-medium">{event.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-white/40">{event.tickets} tickets</span>
                      <span className="font-bold text-green-400">{formatCurrency(event.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-purple-400">App Móvil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{formatCurrency(summary.byChannel.app)}</div>
            <p className="text-xs text-white/30">
              {((summary.byChannel.app / summary.totalIngresos) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-cyan-400">Sitio Web</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{formatCurrency(summary.byChannel.web)}</div>
            <p className="text-xs text-white/30">
              {((summary.byChannel.web / summary.totalIngresos) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-green-400">Efectivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{formatCurrency(summary.byChannel.cash)}</div>
            <p className="text-xs text-white/30">
              {((summary.byChannel.cash / summary.totalIngresos) * 100).toFixed(1)}% del total
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
