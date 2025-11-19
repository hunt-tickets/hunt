"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Target, Clock, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import * as echarts from "echarts";

interface Event {
  id: string;
  name: string;
  status: boolean;
  date: string;
}

interface Ticket {
  id: string;
  name: string;
  price: number;
  quantity: number;
  hex: string | null;
  ticket_type?: {
    id: string;
    name: string;
  } | null;
}

interface TicketAnalytics {
  ticketId: string;
  app: { quantity: number; total: number };
  web: { quantity: number; total: number };
  cash: { quantity: number; total: number };
  total: { quantity: number; total: number };
}

interface Transaction {
  id: string;
  quantity: number;
  total: number;
  created_at: string;
  source: string;
  tickets: {
    name: string;
  };
}

interface EventProgressContentProps {
  event: Event;
  tickets: Ticket[];
  ticketsAnalytics: Record<string, TicketAnalytics>;
  transactions: Transaction[];
}

export function EventProgressContent({
  event,
  tickets,
  ticketsAnalytics,
  transactions,
}: EventProgressContentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate totals
  const totalCapacity = tickets.reduce((sum, t) => sum + t.quantity, 0);
  const totalSold = Object.values(ticketsAnalytics).reduce((sum, analytics) => sum + analytics.total.quantity, 0);
  const totalRevenue = Object.values(ticketsAnalytics).reduce((sum, analytics) => sum + analytics.total.total, 0);
  const sellPercentage = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

  // Calculate daily sales (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const dailySales = last7Days.map(date => {
    const dayTransactions = transactions.filter(t => t.created_at.startsWith(date));
    return {
      date,
      quantity: dayTransactions.reduce((sum, t) => sum + t.quantity, 0),
      revenue: dayTransactions.reduce((sum, t) => sum + t.total, 0),
    };
  });

  // Calculate velocity (tickets per day)
  const recentTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.created_at);
    const daysAgo = (Date.now() - transactionDate.getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo <= 7;
  });
  const ticketsLastWeek = recentTransactions.reduce((sum, t) => sum + t.quantity, 0);
  const velocity = ticketsLastWeek / 7;

  // Days until event
  const eventDate = new Date(event.date);
  const daysUntilEvent = Math.ceil((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Projected sales
  const projectedSales = totalSold + (velocity * Math.max(0, daysUntilEvent));
  const projectedPercentage = totalCapacity > 0 ? (projectedSales / totalCapacity) * 100 : 0;

  // Ticket performance ranking
  const ticketPerformance = tickets
    .map(ticket => {
      const analytics = ticketsAnalytics[ticket.id];
      const sold = analytics?.total.quantity || 0;
      const percentage = ticket.quantity > 0 ? (sold / ticket.quantity) * 100 : 0;
      return {
        ...ticket,
        sold,
        percentage,
        revenue: analytics?.total.total || 0,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  useEffect(() => {
    if (!mounted) return;

    // Daily Sales Trend Chart
    const salesTrendChart = echarts.init(document.getElementById("sales-trend-chart"));
    salesTrendChart.setOption({
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dailySales.map(d => {
          const date = new Date(d.date);
          return `${date.getDate()}/${date.getMonth() + 1}`;
        }),
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#333' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: { color: '#666' },
        splitLine: { lineStyle: { color: '#222' } }
      },
      series: [
        {
          data: dailySales.map(d => d.quantity),
          type: 'line',
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
              { offset: 1, color: 'rgba(139, 92, 246, 0.05)' }
            ])
          },
          lineStyle: {
            color: '#8b5cf6',
            width: 3
          },
          itemStyle: {
            color: '#8b5cf6'
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: '#333',
        textStyle: { color: '#fff' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          const param = params[0];
          const index = param.dataIndex;
          return `${param.name}<br/>Tickets: ${param.value}<br/>Ingresos: ${formatCurrency(dailySales[index].revenue)}`;
        }
      }
    });

    // Ticket Performance Chart
    const performanceChart = echarts.init(document.getElementById("ticket-performance-chart"));
    performanceChart.setOption({
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        max: 100,
        axisLabel: {
          color: '#666',
          formatter: '{value}%'
        },
        splitLine: { lineStyle: { color: '#222' } }
      },
      yAxis: {
        type: 'category',
        data: ticketPerformance.slice(0, 8).map(t => t.name).reverse(),
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#333' } }
      },
      series: [
        {
          data: ticketPerformance.slice(0, 8).map(t => ({
            value: t.percentage,
            itemStyle: {
              color: t.hex || '#8b5cf6'
            }
          })).reverse(),
          type: 'bar',
          barWidth: '60%',
        }
      ],
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: '#333',
        textStyle: { color: '#fff' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          const param = params[0];
          const index = ticketPerformance.length - 1 - param.dataIndex;
          const ticket = ticketPerformance[index];
          return `${ticket.name}<br/>Vendidos: ${ticket.sold}/${ticket.quantity}<br/>Progreso: ${ticket.percentage.toFixed(1)}%<br/>Ingresos: ${formatCurrency(ticket.revenue)}`;
        }
      }
    });

    const handleResize = () => {
      salesTrendChart.resize();
      performanceChart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      salesTrendChart.dispose();
      performanceChart.dispose();
    };
  }, [mounted, dailySales, ticketPerformance]);

  if (!mounted) return null;

  return (
    <div className="space-y-4">
      {/* Key Progress Metrics */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Progreso Total</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {sellPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-white/30">
              {totalSold.toLocaleString()} de {totalCapacity.toLocaleString()} tickets
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-3.5 w-3.5 text-yellow-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Velocidad</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {velocity.toFixed(1)}
            </div>
            <p className="text-xs text-white/30">
              tickets/día (últimos 7 días)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Proyección</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {projectedPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-white/30">
              {Math.round(projectedSales).toLocaleString()} tickets estimados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Tiempo Restante</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {daysUntilEvent > 0 ? daysUntilEvent : 0}
            </div>
            <p className="text-xs text-white/30">
              {daysUntilEvent > 0 ? 'días hasta el evento' : 'evento finalizado'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress Bar */}
      <Card className="bg-white/[0.02] border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Progreso General de Ventas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">Actual</span>
              <span className="font-bold">{totalSold.toLocaleString()} / {totalCapacity.toLocaleString()}</span>
            </div>
            <div className="relative h-8 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: `${Math.min(sellPercentage, 100)}%` }}
              >
                {sellPercentage >= 10 && (
                  <span className="text-xs font-bold text-white">
                    {sellPercentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-white/40">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tendencia de Ventas (Últimos 7 Días)</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="sales-trend-chart" className="h-[300px]" />
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rendimiento por Tipo de Entrada</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="ticket-performance-chart" className="h-[300px]" />
          </CardContent>
        </Card>
      </div>

      {/* Ticket Details Table */}
      <Card className="bg-white/[0.02] border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detalle por Tipo de Entrada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ticketPerformance.map((ticket) => (
              <div key={ticket.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {ticket.hex && (
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: ticket.hex }}
                      />
                    )}
                    <div>
                      <span className="font-medium text-sm">{ticket.name}</span>
                      {ticket.ticket_type && (
                        <span className="ml-2 text-xs text-white/40">
                          ({ticket.ticket_type.name})
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-right">
                      <div className="font-bold">{ticket.sold} / {ticket.quantity}</div>
                      <div className="text-xs text-white/40">{formatCurrency(ticket.revenue)}</div>
                    </div>
                    <div className={`font-bold w-16 text-right ${
                      ticket.percentage >= 80 ? 'text-green-400' :
                      ticket.percentage >= 50 ? 'text-yellow-400' :
                      'text-white/60'
                    }`}>
                      {ticket.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${ticket.percentage}%`,
                      backgroundColor: ticket.hex || '#8b5cf6'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-green-400">Ingresos Actuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-white/30">
              De {totalSold.toLocaleString()} tickets vendidos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-cyan-400">Ingresos Potenciales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(tickets.reduce((sum, t) => sum + (t.price * t.quantity), 0))}
            </div>
            <p className="text-xs text-white/30">
              Si se venden todos los tickets
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-purple-400">Ticket Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(totalSold > 0 ? totalRevenue / totalSold : 0)}
            </div>
            <p className="text-xs text-white/30">
              Precio promedio por ticket
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
