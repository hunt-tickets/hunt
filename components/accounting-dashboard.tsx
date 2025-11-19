"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Receipt, DollarSign, Ticket, CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import * as echarts from "echarts";

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Monthly Revenue Chart
    const monthlyChart = echarts.init(document.getElementById("monthly-revenue-chart"));
    monthlyChart.setOption({
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: summary.monthlyData.map(d => {
          const [year, month] = d.month.split('-');
          return `${month}/${year.slice(2)}`;
        }),
        axisLabel: { color: '#666' },
        axisLine: { lineStyle: { color: '#333' } }
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          color: '#666',
          formatter: (value: number) => `$${(value / 1000).toFixed(0)}k`
        },
        splitLine: { lineStyle: { color: '#222' } }
      },
      series: [
        {
          data: summary.monthlyData.map(d => d.ingresos),
          type: 'bar',
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#10b981' },
              { offset: 1, color: '#059669' }
            ])
          },
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
          return `${param.name}<br/>Ingresos: ${formatCurrency(param.value)}<br/>Transacciones: ${summary.monthlyData[param.dataIndex].transactions}`;
        }
      }
    });

    // Channel Distribution Chart
    const channelChart = echarts.init(document.getElementById("channel-distribution-chart"));
    channelChart.setOption({
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderColor: '#333',
        textStyle: { color: '#fff' },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          return `${params.name}<br/>Ingresos: ${formatCurrency(params.value)}<br/>Porcentaje: ${params.percent}%`;
        }
      },
      legend: {
        orient: 'vertical',
        right: '10%',
        top: 'center',
        textStyle: { color: '#999' }
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['40%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#000',
            borderWidth: 2
          },
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
              color: '#fff'
            }
          },
          data: [
            { value: summary.byChannel.app, name: 'App Móvil', itemStyle: { color: '#8b5cf6' } },
            { value: summary.byChannel.web, name: 'Web', itemStyle: { color: '#06b6d4' } },
            { value: summary.byChannel.cash, name: 'Efectivo', itemStyle: { color: '#10b981' } }
          ]
        }
      ]
    });

    // Resize charts on window resize
    const handleResize = () => {
      monthlyChart.resize();
      channelChart.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      monthlyChart.dispose();
      channelChart.dispose();
    };
  }, [mounted, summary]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (!mounted) return null;

  // Calculate growth (comparing last month vs previous month)
  const lastMonth = summary.monthlyData[summary.monthlyData.length - 1];
  const previousMonth = summary.monthlyData[summary.monthlyData.length - 2];
  const growth = previousMonth?.ingresos
    ? ((lastMonth.ingresos - previousMonth.ingresos) / previousMonth.ingresos) * 100
    : 0;

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
        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ingresos Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="monthly-revenue-chart" className="h-[300px]" />
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Distribución por Canal</CardTitle>
          </CardHeader>
          <CardContent>
            <div id="channel-distribution-chart" className="h-[300px]" />
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
