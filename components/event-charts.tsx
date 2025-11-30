"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesDistributionChartProps {
  app: number;
  web: number;
  cash: number;
}

export function SalesDistributionChart({ app, web, cash }: SalesDistributionChartProps) {
  const data = [
    { name: 'App', value: app, color: 'rgba(255, 255, 255, 0.5)' },
    { name: 'Web', value: web, color: 'rgba(255, 255, 255, 0.35)' },
    { name: 'Efectivo', value: cash, color: 'rgba(255, 255, 255, 0.2)' },
  ].filter(item => item.value > 0);

  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardHeader>
        <CardTitle className="text-base">Distribución por Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center">
          <DonutChart data={data} total={total} />
        </div>
      </CardContent>
    </Card>
  );
}

interface RevenueByChannelChartProps {
  appTotal: number;
  webTotal: number;
  cashTotal: number;
}

export function RevenueByChannelChart({ appTotal, webTotal, cashTotal }: RevenueByChannelChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const data = [
    { name: 'App', value: appTotal },
    { name: 'Web', value: webTotal },
    { name: 'Efectivo', value: cashTotal },
  ].filter(item => item.value > 0);

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardHeader>
        <CardTitle className="text-base">Ingresos por Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex flex-col justify-center space-y-4">
          {data.map((item, index) => {
            const percentage = (item.value / maxValue) * 100;
            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">{item.name}</span>
                  <span className="text-white font-medium">{formatCurrency(item.value)}</span>
                </div>
                <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className="h-full bg-white/30 rounded-lg transition-all duration-500 hover:bg-white/40"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface SalesFunnelChartProps {
  visits: number;
  addedToCart: number;
  completed: number;
}

export function SalesFunnelChart({ visits, addedToCart, completed }: SalesFunnelChartProps) {
  const stages = [
    { name: 'Visitas', value: visits },
    { name: 'Carrito', value: addedToCart },
    { name: 'Completado', value: completed }
  ];

  const conversionRates = [
    100,
    visits > 0 ? (addedToCart / visits) * 100 : 0,
    addedToCart > 0 ? (completed / addedToCart) * 100 : 0
  ];

  const maxValue = Math.max(...stages.map(s => s.value), 1);

  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardHeader>
        <CardTitle className="text-base">Embudo de Ventas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {stages.map((stage, index) => {
            const widthPercent = (stage.value / maxValue) * 100;
            return (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">{stage.name}</span>
                  <span className="text-white font-medium">
                    {stage.value} ({conversionRates[index].toFixed(0)}%)
                  </span>
                </div>
                <div className="h-10 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center">
                  <div
                    className="h-full bg-white/25 rounded-lg transition-all duration-500 hover:bg-white/35 flex items-center justify-center"
                    style={{ width: `${widthPercent}%` }}
                  >
                    {widthPercent > 30 && (
                      <span className="text-xs font-medium text-white/80">{stage.value}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

interface TicketRevenueDistributionChartProps {
  tickets: Array<{
    name: string;
    revenue: number;
    quantity: number;
    percentage: number;
    color?: string;
  }>;
}

export function TicketRevenueDistributionChart({ tickets }: TicketRevenueDistributionChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const maxRevenue = Math.max(...tickets.map(t => t.revenue), 1);
  const totalRevenue = tickets.reduce((sum, t) => sum + t.revenue, 0);

  return (
    <div className="h-full space-y-3 overflow-y-auto">
      {tickets.map((ticket, index) => {
        const widthPercent = (ticket.revenue / maxRevenue) * 100;
        const revenuePercent = totalRevenue > 0 ? ((ticket.revenue / totalRevenue) * 100).toFixed(1) : '0';

        return (
          <div key={index} className="space-y-1.5 group">
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                {ticket.color && (
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ticket.color }}
                  />
                )}
                <span className="text-white/80 truncate">{ticket.name}</span>
              </div>
              <span className="text-white font-medium flex-shrink-0 ml-2">
                {formatCurrency(ticket.revenue)}
              </span>
            </div>
            <div className="h-7 bg-white/5 rounded-lg overflow-hidden relative">
              <div
                className="h-full bg-white/25 rounded-lg transition-all duration-500 group-hover:bg-white/35 flex items-center"
                style={{ width: `${widthPercent}%` }}
              >
                {widthPercent > 25 && (
                  <span className="text-xs text-white/70 ml-2">
                    {ticket.quantity} vendidos · {revenuePercent}%
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ChannelSalesChartProps {
  app: number;
  web: number;
  cash: number;
}

// Reusable Donut Chart component
function DonutChart({
  data,
  total
}: {
  data: Array<{ name: string; value: number; color: string }>;
  total: number;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-44 h-44">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          {(() => {
            let cumulativePercent = 0;
            return data.map((item, index) => {
              const percent = (item.value / total) * 100;
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
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-white/50">tickets</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-white/60">
              {item.name} {((item.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChannelSalesChart({ app, web, cash }: ChannelSalesChartProps) {
  const data = [
    { name: 'App Móvil', value: app, color: 'rgba(255, 255, 255, 0.5)' },
    { name: 'Web', value: web, color: 'rgba(255, 255, 255, 0.35)' },
    { name: 'Efectivo', value: cash, color: 'rgba(255, 255, 255, 0.2)' },
  ].filter(item => item.value > 0);

  const total = data.reduce((acc, item) => acc + item.value, 0);

  if (total === 0) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-white/40">
        Sin datos de ventas
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center">
      <DonutChart data={data} total={total} />
    </div>
  );
}

interface DailySalesChartProps {
  sales: Array<{
    createdAt: string;
    subtotal: number;
    quantity: number;
  }>;
}

export function DailySalesChart({ sales }: DailySalesChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Group sales by day
  const dailySalesData: Record<string, { revenue: number; quantity: number }> = {};

  sales.forEach(sale => {
    const date = new Date(sale.createdAt);
    const dateKey = date.toISOString().split('T')[0];

    if (!dailySalesData[dateKey]) {
      dailySalesData[dateKey] = { revenue: 0, quantity: 0 };
    }

    dailySalesData[dateKey].revenue += sale.subtotal;
    dailySalesData[dateKey].quantity += sale.quantity;
  });

  const sortedDates = Object.keys(dailySalesData).sort();
  const dates = sortedDates.map(date => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  });
  const revenues = sortedDates.map(date => dailySalesData[date].revenue);
  const maxRevenue = Math.max(...revenues, 1);

  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardHeader>
        <CardTitle className="text-base">Ventas Diarias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xs text-white/40 mb-1">Total Días</div>
            <div className="text-lg font-bold">{dates.length}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/40 mb-1">Promedio Diario</div>
            <div className="text-lg font-bold">
              {formatCurrency(dates.length > 0 ? revenues.reduce((sum, val) => sum + val, 0) / dates.length : 0)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/40 mb-1">Mejor Día</div>
            <div className="text-lg font-bold">
              {formatCurrency(Math.max(...revenues, 0))}
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-[250px] flex items-end gap-1 pt-4">
          {sortedDates.map((dateKey, index) => {
            const data = dailySalesData[dateKey];
            const heightPercent = (data.revenue / maxRevenue) * 100;

            return (
              <div
                key={dateKey}
                className="flex-1 flex flex-col items-center group relative"
              >
                <div className="w-full flex flex-col justify-end h-[200px]">
                  <div
                    className="w-full bg-white/25 rounded-t transition-all duration-300 hover:bg-white/40 cursor-pointer min-h-[4px]"
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  />
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-[210px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-zinc-900 border border-white/10 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                    <div className="font-semibold text-white mb-1">{dates[index]}</div>
                    <div className="text-white/80">{formatCurrency(data.revenue)}</div>
                    <div className="text-white/60">{data.quantity} tickets</div>
                  </div>
                </div>

                {/* Date label - only show some labels if too many */}
                {(dates.length <= 10 || index % Math.ceil(dates.length / 10) === 0) && (
                  <span className="text-[10px] text-white/40 mt-1 truncate w-full text-center">
                    {dates[index]}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
