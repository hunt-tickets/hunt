"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Ticket,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { LOCALE } from "@/lib/constants";
import { useTheme } from "next-themes";
import { OptimizedEChart } from "@/components/optimized-echart";
import { formatCurrency } from "@/lib/referrals/currency";
import { formatShortMonth } from "@/lib/referrals/date-utils";
import { generateRebateData } from "@/lib/referrals/mock-data";
import type { RebateContentProps } from "@/lib/referrals/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function RebateContent({ userId }: RebateContentProps) {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<"3" | "6" | "12">("6");
  const { resolvedTheme } = useTheme();

  // Generate rebate data (memoized to avoid regeneration on every render)
  const MOCK_REBATE_DATA = useMemo(() => generateRebateData(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  // Memoized color for rebate bar (same as payments for consistency)
  const REBATE_COLOR = useMemo(
    () => isDark ? "#e5e5e5" : "#1a1a1a",
    [isDark]
  );

  // Memoized chart data based on timeRange
  const chartData = useMemo(() => {
    const months = parseInt(timeRange);
    const monthlyData = new Map<string, number>();

    // Aggregate rebates by month
    MOCK_REBATE_DATA.rebateHistory.forEach((rebate) => {
      const date = new Date(rebate.eventDate);
      const monthKey = formatShortMonth(date);

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, 0);
      }
      monthlyData.set(monthKey, monthlyData.get(monthKey)! + rebate.rebateAmount);
    });

    // Convert to array and sort by date
    const data = Array.from(monthlyData.entries())
      .map(([month, amount]) => ({ month, amount }))
      .slice(0, months);

    return data;
  }, [timeRange, MOCK_REBATE_DATA]);

  // Memoized ECharts configuration
  const chartOption = useMemo(() => {
    const months = chartData.map(d => d.month);
    const amounts = chartData.map(d => d.amount);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        textStyle: {
          color: isDark ? '#fff' : '#000'
        },
        axisPointer: {
          type: 'shadow',
          shadowStyle: {
            color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
          }
        },
        formatter: (params: any) => {
          const month = params[0].axisValue;
          const amount = params[0].value;

          return `
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px;">${month}</div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 11px;">
              <div style="width: 8px; height: 8px; border-radius: 2px; background-color: ${REBATE_COLOR};"></div>
              <span style="color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};">Rebate:</span>
              <span style="font-weight: 500;">${formatCurrency(amount)}</span>
            </div>
          `;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '8%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: {
          lineStyle: {
            color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }
        },
        axisLabel: {
          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
          fontSize: 11
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisTick: {
          show: false
        },
        splitLine: {
          lineStyle: {
            color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
          }
        },
        axisLabel: {
          color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
          fontSize: 11,
          formatter: (value: number) => {
            if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
            if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
            return `$${value}`;
          }
        }
      },
      series: [
        {
          data: amounts,
          type: 'bar',
          itemStyle: {
            color: REBATE_COLOR,
            borderRadius: [4, 4, 0, 0]
          },
          barMaxWidth: 40
        }
      ]
    };
  }, [chartData, isDark, REBATE_COLOR, formatCurrency]);

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
              <CardContent className="p-4 sm:p-5">
                <div className="h-16 animate-pulse bg-gray-200 dark:bg-white/5 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Rebate */}
        <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <DollarSign className="h-4 w-4 text-gray-400 dark:text-white/40" />
              <span className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">
                Total Rebate
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white">
              {formatCurrency(MOCK_REBATE_DATA.stats.totalRebate)}
            </div>
            <p className="text-xs text-gray-500 dark:text-white/30">
              Últimos 6 meses
            </p>
          </CardContent>
        </Card>

        {/* Rebate Percentage */}
        <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <TrendingUp className="h-4 w-4 text-gray-400 dark:text-white/40" />
              <span className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">
                Porcentaje
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white">
              {MOCK_REBATE_DATA.stats.rebatePercentage}%
            </div>
            <p className="text-xs text-gray-500 dark:text-white/30">
              Sobre ventas brutas
            </p>
          </CardContent>
        </Card>

        {/* Total Tickets */}
        <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Ticket className="h-4 w-4 text-gray-400 dark:text-white/40" />
              <span className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">
                Tickets Vendidos
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white">
              {MOCK_REBATE_DATA.stats.totalTickets.toLocaleString(LOCALE)}
            </div>
            <p className="text-xs text-gray-500 dark:text-white/30">
              En tus eventos
            </p>
          </CardContent>
        </Card>

        {/* Average Rebate per Event */}
        <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Calendar className="h-4 w-4 text-gray-400 dark:text-white/40" />
              <span className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">
                Promedio por Evento
              </span>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white">
              {formatCurrency(MOCK_REBATE_DATA.stats.averageRebate)}
            </div>
            <p className="text-xs text-gray-500 dark:text-white/30">
              Rebate medio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Historial de Rebate
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-white/40 mt-1">
                Devoluciones por ventas en tus eventos
              </p>
            </div>

            {/* Time range filters */}
            <div className="flex gap-2">
              {(['3', '6', '12'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    timeRange === range
                      ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white'
                      : 'text-gray-600 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
                >
                  {range}M
                </button>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-[300px]">
            <OptimizedEChart option={chartOption} />
          </div>
        </CardContent>
      </Card>

      {/* Rebate History Table */}
      <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
        <CardContent className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Detalle de Rebates
          </h3>

          {/* Mobile Cards */}
          <div className="block sm:hidden space-y-3">
            {MOCK_REBATE_DATA.rebateHistory.slice(0, 10).map((rebate) => (
              <Card
                key={rebate.id}
                className="bg-white dark:bg-white/[0.03] border-gray-200 dark:border-white/10"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {rebate.eventName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-white/40 mt-0.5">
                        {formatDate(rebate.eventDate, 'SHORT')}
                      </p>
                    </div>
                    <Badge className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/80 border-gray-200 dark:border-white/20">
                      {rebate.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500 dark:text-white/40">Tickets</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {rebate.ticketsSold.toLocaleString(LOCALE)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-white/40">Ingresos</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {formatCurrency(rebate.totalRevenue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-white/40">% Rebate</p>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {rebate.rebatePercentage}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-white/40">Rebate</p>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {formatCurrency(rebate.rebateAmount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200 dark:border-white/10">
                  <TableHead className="text-gray-600 dark:text-white/60">Evento</TableHead>
                  <TableHead className="text-gray-600 dark:text-white/60">Fecha</TableHead>
                  <TableHead className="text-gray-600 dark:text-white/60">Tickets</TableHead>
                  <TableHead className="text-gray-600 dark:text-white/60">Ingresos</TableHead>
                  <TableHead className="text-gray-600 dark:text-white/60">% Rebate</TableHead>
                  <TableHead className="text-gray-600 dark:text-white/60">Rebate</TableHead>
                  <TableHead className="text-gray-600 dark:text-white/60">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_REBATE_DATA.rebateHistory.slice(0, 10).map((rebate) => (
                  <TableRow
                    key={rebate.id}
                    className="border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
                  >
                    <TableCell className="font-medium text-gray-900 dark:text-white">
                      {rebate.eventName}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/60">
                      {formatDate(rebate.eventDate, 'SHORT')}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/60">
                      {rebate.ticketsSold.toLocaleString(LOCALE)}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/60">
                      {formatCurrency(rebate.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-gray-600 dark:text-white/60">
                      {rebate.rebatePercentage}%
                    </TableCell>
                    <TableCell className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(rebate.rebateAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-white/80 border-gray-200 dark:border-white/20">
                        {rebate.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
