"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
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
  Clock,
  CheckCircle2,
  DollarSign,
  Info,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useTheme } from "next-themes";
import { OptimizedEChart } from "@/components/optimized-echart";
import { useParams } from "next/navigation";
import Link from "next/link";
import { formatCurrency } from "@/lib/referrals/currency";
import { generatePaymentData } from "@/lib/referrals/mock-data";
import type { PaymentsContentProps } from "@/lib/referrals/types";

export function PaymentsContent({ userId }: PaymentsContentProps) {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<"3" | "6" | "12">("12");
  const { resolvedTheme } = useTheme();
  const params = useParams();
  const organizationId = params.organizationId as string;

  // Generate payment data (memoized to avoid regeneration on every render)
  const MOCK_PAYMENT_DATA = useMemo(() => {
    const data = generatePaymentData();
    console.log('Generated payment data:', {
      currentPaymentDate: data.currentBillingCycle.paymentDate,
      currentCutoffDate: data.currentBillingCycle.cutoffDate,
    });
    return data;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  // Memoized color for payments bar
  const PAYMENT_COLOR = useMemo(
    () => isDark ? "#e5e5e5" : "#1a1a1a",
    [isDark]
  );

  // Memoized canvas pattern for estimated payments (optimized to create only once)
  const estimatedPatternCanvas = useMemo(() => {
    if (typeof document === 'undefined') return null; // SSR safety

    const canvas = document.createElement('canvas');
    canvas.width = 8;
    canvas.height = 8;
    const ctx = canvas.getContext('2d')!;

    // Background
    ctx.fillStyle = isDark ? 'rgba(229, 229, 229, 0.5)' : 'rgba(26, 26, 26, 0.5)';
    ctx.fillRect(0, 0, 8, 8);

    // Diagonal stripe
    ctx.strokeStyle = PAYMENT_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 8);
    ctx.lineTo(8, 0);
    ctx.stroke();

    return canvas;
  }, [isDark, PAYMENT_COLOR]);

  // Memoized chart data based on timeRange
  const chartData = useMemo(() => {
    const months = parseInt(timeRange);
    const data = [];
    const today = new Date();

    // Generate mock data for the last N months (completed payments)
    for (let i = months; i >= 1; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);

      // Generate realistic payment amounts (between 800k and 2M)
      const amount = Math.floor(800000 + Math.random() * 1200000);

      data.push({
        month: date.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }),
        amount: amount,
        isEstimated: false,
      });
    }

    // Add current month as estimated (próximo pago)
    const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    data.push({
      month: currentMonth.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }),
      amount: MOCK_PAYMENT_DATA.currentBillingCycle.estimatedAmount,
      isEstimated: true,
    });

    return data;
  }, [timeRange]);

  // Memoized ECharts configuration
  const chartOption = useMemo(() => {
    const months = chartData.map(d => d.month);
    const amounts = chartData.map(d => d.amount);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: isDark ? '#18181b' : '#ffffff',
        borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        textStyle: {
          color: isDark ? '#fff' : '#000'
        },
        axisPointer: {
          type: 'shadow' as const,
          shadowStyle: {
            color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          const index = params[0].dataIndex;
          const month = params[0].axisValue;
          const amount = params[0].value;
          const isEstimated = chartData[index].isEstimated;

          return `
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px;">${month}</div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 11px;">
              <div style="width: 8px; height: 8px; border-radius: 2px; background-color: ${PAYMENT_COLOR};"></div>
              <span style="color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};">${isEstimated ? 'Estimado' : 'Pago'}:</span>
              <span style="font-weight: 500;">${formatCurrency(amount)}</span>
            </div>
            ${isEstimated ? `<div style="font-size: 10px; color: ${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}; margin-top: 4px; font-style: italic;">*Monto estimado, sujeto a cambios</div>` : ''}
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
        type: 'category' as const,
        data: months,
        axisLine: {
          lineStyle: {
            color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }
        },
        axisLabel: {
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
          fontSize: 11,
          interval: 0,
          rotate: 0,
          formatter: (value: string, index: number) => {
            // Mark estimated month with asterisk
            return chartData[index].isEstimated ? `${value}*` : value;
          }
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value' as const,
        axisLine: {
          show: false
        },
        axisLabel: {
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
          fontSize: 11,
          formatter: (value: number) => {
            if (value >= 1000000) {
              return `$${(value / 1000000).toFixed(1)}M`;
            }
            return `$${(value / 1000).toFixed(0)}K`;
          }
        },
        splitLine: {
          lineStyle: {
            color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            type: 'dashed' as const
          }
        }
      },
      series: [
        {
          name: 'Pagos',
          type: 'bar' as const,
          data: amounts.map((amount, index) => ({
            value: amount,
            itemStyle: chartData[index].isEstimated ? {
              color: estimatedPatternCanvas ? {
                type: 'pattern' as const,
                image: estimatedPatternCanvas,
                repeat: 'repeat' as const
              } : PAYMENT_COLOR,
              borderRadius: [8, 8, 0, 0],
              borderColor: PAYMENT_COLOR,
              borderWidth: 2,
              borderType: 'solid' as const,
            } : {
              color: PAYMENT_COLOR,
              borderRadius: [8, 8, 0, 0],
              opacity: 0.85
            }
          })),
          emphasis: {
            itemStyle: {
              opacity: 1
            }
          },
          barMaxWidth: timeRange === '3' ? 70 : timeRange === '6' ? 60 : 40
        }
      ]
    };
  }, [chartData, isDark, PAYMENT_COLOR, timeRange, estimatedPatternCanvas]);

  // Memoized handlers for time range buttons
  const handleSetTimeRange3 = useCallback(() => setTimeRange("3"), []);
  const handleSetTimeRange6 = useCallback(() => setTimeRange("6"), []);
  const handleSetTimeRange12 = useCallback(() => setTimeRange("12"), []);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <DollarSign className="h-4 w-4 text-gray-400 dark:text-white/40" />
                <span className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">
                  Próximo Pago
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white">
                {formatCurrency(MOCK_PAYMENT_DATA.currentBillingCycle.estimatedAmount || 0)}
              </div>
              <p className="text-xs text-gray-500 dark:text-white/30">
                Monto estimado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Calendar className="h-4 w-4 text-gray-400 dark:text-white/40" />
                <span className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">
                  Fecha de Corte
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white">
                {formatDate(MOCK_PAYMENT_DATA.currentBillingCycle.cutoffDate, 'SHORT')}
              </div>
              <p className="text-xs text-gray-500 dark:text-white/30">
                Último día del mes
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <Clock className="h-4 w-4 text-gray-400 dark:text-white/40" />
                <span className="text-xs text-gray-500 dark:text-white/40 uppercase tracking-wider">
                  Fecha de Pago Programada
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-bold mb-1 text-gray-900 dark:text-white">
                {formatDate(MOCK_PAYMENT_DATA.currentBillingCycle.paymentDate, 'SHORT')}
              </div>
              <p className="text-xs text-gray-500 dark:text-white/30">
                Depósito automático
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payments Chart */}
        <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
          <CardContent className="pt-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Historial de Pagos
                </h3>
                <p className="text-sm text-gray-500 dark:text-white/50">
                  Comisiones recibidas mensualmente
                </p>
              </div>

              {/* Time Range Filters */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleSetTimeRange3}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    timeRange === "3"
                      ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
                  }`}
                >
                  3M
                </button>
                <button
                  onClick={handleSetTimeRange6}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    timeRange === "6"
                      ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
                  }`}
                >
                  6M
                </button>
                <button
                  onClick={handleSetTimeRange12}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                    timeRange === "12"
                      ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20"
                      : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
                  }`}
                >
                  1A
                </button>
              </div>
            </div>

            {/* ECharts Chart */}
            {mounted ? (
              <div className="h-64 sm:h-80">
                <OptimizedEChart
                  option={chartOption}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            ) : (
              <div className="h-64 sm:h-80 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/10">
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-blue-900 dark:text-blue-300">
                ¿Cómo funcionan los ciclos de facturación?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400/80 leading-relaxed">
                Los pagos se procesan mensualmente. La{" "}
                <span className="font-semibold">fecha de corte</span> es el último día de cada mes, cuando se calcula el monto final basado en las comisiones generadas durante todo el mes. Luego, el{" "}
                <span className="font-semibold">primer día hábil del mes siguiente</span>, el dinero se deposita automáticamente en{" "}
                <Link
                  href={`/profile/${userId}/organizaciones/${organizationId}/administrador/configuracion`}
                  className="font-semibold underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  tu llave Bre-B registrada
                </Link>.
              </p>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white">
                Historial de Pagos
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-white/40">
                Todos tus pagos completados
              </p>
            </div>

            {MOCK_PAYMENT_DATA.paymentHistory.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-300 dark:text-white/20 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-white/40">
                  Aún no hay pagos realizados
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {MOCK_PAYMENT_DATA.paymentHistory.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 rounded-lg bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-base font-bold text-gray-900 dark:text-white mb-1">
                            {formatCurrency(payment.amount)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-white/40">
                            {payment.period}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/20 text-xs"
                        >
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="text-gray-500 dark:text-white/40">Corte</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {formatDate(payment.cutoffDate, 'SHORT')}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500 dark:text-white/40">Pagado</p>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {formatDate(payment.paymentDate, 'SHORT')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-gray-200 dark:border-white/5 hover:bg-transparent">
                        <TableHead className="text-gray-600 dark:text-white/60">
                          Período
                        </TableHead>
                        <TableHead className="text-gray-600 dark:text-white/60">
                          Fecha de Corte
                        </TableHead>
                        <TableHead className="text-gray-600 dark:text-white/60">
                          Fecha de Pago
                        </TableHead>
                        <TableHead className="text-gray-600 dark:text-white/60">
                          Estado
                        </TableHead>
                        <TableHead className="text-right text-gray-600 dark:text-white/60">
                          Monto
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_PAYMENT_DATA.paymentHistory.map((payment) => (
                        <TableRow
                          key={payment.id}
                          className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.05]"
                        >
                          <TableCell className="text-gray-900 dark:text-white">
                            {payment.period}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-white/60">
                            {formatDate(payment.cutoffDate, 'SHORT')}
                          </TableCell>
                          <TableCell className="text-gray-600 dark:text-white/60">
                            {formatDate(payment.paymentDate, 'SHORT')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <Badge
                                variant="outline"
                                className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-300 dark:border-green-500/20"
                              >
                                {payment.status}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(payment.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
