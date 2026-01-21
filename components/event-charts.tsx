"use client";

import { useState, useEffect } from "react";
import { OptimizedEChart } from "@/components/optimized-echart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "next-themes";
import type { EChartsOption } from "echarts";

interface SalesDistributionChartProps {
  app: number;
  web: number;
  cash: number;
  colorPalette?: string[];
}

export function SalesDistributionChart({ app, web, cash }: SalesDistributionChartProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  // Grayscale palette that adapts to theme (same as analytics-charts.tsx)
  const COLORS = isDark ? [
    "#e5e5e5", // lightest
    "#cccccc", // light
    "#b3b3b3", // medium-light
  ] : [
    "#1a1a1a", // darkest
    "#2a2a2a", // dark
    "#3a3a3a", // medium-dark
  ];

  const data = [
    { name: 'App', value: app },
    { name: 'Web', value: web },
    { name: 'Efectivo', value: cash },
  ].filter(item => item.value > 0);

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item' as const,
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      borderColor: isDark ? '#303030' : '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#fff' : '#000'
      },
      formatter: '{b}: {c} ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        padAngle: 3,
        itemStyle: {
          borderRadius: 10,
          borderColor: isDark ? '#1a1a1a' : '#f9fafb',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          color: isDark ? '#888' : '#666',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: isDark ? '#fff' : '#000'
          }
        },
        data: data.map((item, index) => ({
          ...item,
          itemStyle: {
            color: COLORS[index % COLORS.length]
          }
        }))
      }
    ]
  };

  if (!mounted) {
    return (
      <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-base">Distribución por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-gray-200 dark:border-white/30 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-base">Distribución por Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <OptimizedEChart option={option} style={{ height: '100%', width: '100%' }} />
        </div>
      </CardContent>
    </Card>
  );
}

interface RevenueByChannelChartProps {
  appTotal: number;
  webTotal: number;
  cashTotal: number;
  colorPalette?: string[];
}

export function RevenueByChannelChart({ appTotal, webTotal, cashTotal }: RevenueByChannelChartProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  // Grayscale palette that adapts to theme
  const COLORS = isDark ? [
    "#e5e5e5", // lightest
    "#cccccc", // light
    "#b3b3b3", // medium-light
  ] : [
    "#1a1a1a", // darkest
    "#2a2a2a", // dark
    "#3a3a3a", // medium-dark
  ];

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

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      borderColor: isDark ? '#303030' : '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#fff' : '#000'
      },
      axisPointer: {
        type: 'shadow' as const
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        return `${params[0].name}: ${formatCurrency(params[0].value)}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.name),
      axisLine: {
        lineStyle: {
          color: isDark ? '#303030' : '#d1d5db'
        }
      },
      axisLabel: {
        color: isDark ? '#888' : '#6b7280',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: isDark ? '#303030' : '#d1d5db'
        }
      },
      axisLabel: {
        color: isDark ? '#888' : '#6b7280',
        formatter: (value: number) => {
          if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
          return `$${value}`;
        }
      },
      splitLine: {
        lineStyle: {
          color: isDark ? '#303030' : '#e5e7eb',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: data.map((d, index) => ({
          value: d.value,
          itemStyle: {
            color: COLORS[index % COLORS.length],
            borderRadius: [8, 8, 0, 0]
          }
        })),
        emphasis: {
          itemStyle: {
            opacity: 0.8
          }
        }
      }
    ]
  };

  if (!mounted) {
    return (
      <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-base">Ingresos por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-gray-200 dark:border-white/30 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-base">Ingresos por Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <OptimizedEChart option={option} style={{ height: '100%', width: '100%' }} />
        </div>
      </CardContent>
    </Card>
  );
}

interface SalesFunnelChartProps {
  visits: number;
  addedToCart: number;
  completed: number;
  colorPalette?: string[];
}

export function SalesFunnelChart({ visits, addedToCart, completed }: SalesFunnelChartProps) {
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  // Grayscale palette
  const COLORS = isDark ? [
    "#e5e5e5", // lightest
    "#cccccc", // light
    "#b3b3b3", // medium-light
  ] : [
    "#1a1a1a", // darkest
    "#2a2a2a", // dark
    "#3a3a3a", // medium-dark
  ];

  const stages = [
    { name: 'Visitas', value: visits },
    { name: 'Carrito', value: addedToCart },
    { name: 'Completado', value: completed }
  ];

  // Calculate percentages based on max value for sizing
  const maxValue = Math.max(...stages.map(s => s.value));

  // Calculate conversion rates from first stage
  const conversionRates = [
    100,
    visits > 0 ? (addedToCart / visits) * 100 : 0,
    visits > 0 ? (completed / visits) * 100 : 0
  ];

  if (!mounted) {
    return (
      <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-base">Embudo de Conversión</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-gray-200 dark:border-white/30 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-base">Embudo de Conversión</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-6 relative">
          {/* SVG for funnel shapes only */}
          <svg
            width="100%"
            height="200"
            viewBox="0 0 840 200"
            preserveAspectRatio="none"
            className="w-full"
          >
            {stages.map((stage, index) => {
              // Calculate heights based on values
              const heightPercentage = maxValue > 0 ? (stage.value / maxValue) : 0;
              const stageHeight = 140 * heightPercentage;

              // Next stage for smooth curves
              const nextHeightPercentage = index < stages.length - 1
                ? (maxValue > 0 ? (stages[index + 1].value / maxValue) : 0)
                : heightPercentage * 0.5;
              const nextStageHeight = 140 * nextHeightPercentage;

              // Horizontal position - sections connect directly and fill width
              const sectionWidth = 280;
              const xStart = index * sectionWidth;
              const xEnd = xStart + sectionWidth;

              // Vertical centering
              const yTop = (200 - stageHeight) / 2;
              const yBottom = yTop + stageHeight;
              const nextYTop = (200 - nextStageHeight) / 2;
              const nextYBottom = nextYTop + nextStageHeight;

              // Control points for smooth Bezier curves
              const controlOffset = sectionWidth * 0.7;

              const isHovered = hoveredIndex === index;

              return (
                <g
                  key={index}
                  onMouseEnter={(e) => {
                    setHoveredIndex(index);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltipPosition({
                      x: rect.left + rect.width / 2,
                      y: rect.top
                    });
                  }}
                  onMouseMove={(e) => {
                    setTooltipPosition({
                      x: e.clientX,
                      y: e.clientY
                    });
                  }}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Smooth connected funnel section */}
                  <path
                    d={`
                      M ${xStart} ${yTop}
                      C ${xStart + controlOffset} ${yTop}, ${xEnd - controlOffset} ${nextYTop}, ${xEnd} ${nextYTop}
                      L ${xEnd} ${nextYBottom}
                      C ${xEnd - controlOffset} ${nextYBottom}, ${xStart + controlOffset} ${yBottom}, ${xStart} ${yBottom}
                      Z
                    `}
                    fill={COLORS[index]}
                    opacity={isHovered ? "1" : "0.85"}
                    style={{
                      transition: 'all 0.3s ease',
                      filter: isHovered ? 'brightness(1.1)' : 'none'
                    }}
                  />
                </g>
              );
            })}
          </svg>

          {/* Tooltip */}
          {hoveredIndex !== null && (
            <div
              className="fixed z-50 px-3 py-2 text-sm rounded-lg shadow-lg pointer-events-none bg-white dark:bg-[#202020] border border-gray-200 dark:border-[#2a2a2a]"
              style={{
                left: `${tooltipPosition.x}px`,
                top: `${tooltipPosition.y - 80}px`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="font-semibold text-gray-900 dark:text-white mb-1">
                {stages[hoveredIndex].name}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Valor: {stages[hoveredIndex].value.toLocaleString()}
              </div>
              <div className="text-gray-600 dark:text-gray-400">
                Conversión: {conversionRates[hoveredIndex].toFixed(1)}%
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 pt-4 border-t border-gray-200 dark:border-white/10">
          {stages.map((stage, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index] }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stage.name}
              </span>
            </div>
          ))}
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

interface ChannelSalesChartProps {
  app: number;
  web: number;
  cash: number;
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

  const formatCurrencyShort = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const maxRevenue = Math.max(...tickets.map(t => t.revenue));
  const minRevenue = Math.min(...tickets.map(t => t.revenue));
  const totalRevenue = tickets.reduce((sum, t) => sum + t.revenue, 0);

  // Estructura de datos para treemap (empaquetado rectangular)
  const data = {
    name: 'root',
    children: tickets.map((ticket) => {
      const normalized = ((ticket.revenue - minRevenue) / (maxRevenue - minRevenue)) || 0;
      const lightness = 25 + normalized * 40; // 25-65% escala de grises

      return {
        name: ticket.name,
        value: ticket.revenue,
        itemStyle: {
          color: `hsl(0, 0%, ${lightness}%)`,
          borderColor: '#18181b',
          borderWidth: 2
        }
      };
    })
  };

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item' as const,
      backgroundColor: '#18181b',
      borderColor: '#303030',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const ticket = tickets.find(t => t.name === params.name);
        if (!ticket) return '';
        return `<strong>${params.name}</strong><br/>
                Ingresos: ${formatCurrency(ticket.revenue)}<br/>
                Vendidos: ${ticket.quantity}<br/>
                Participación: ${ticket.percentage.toFixed(1)}%`;
      }
    },
    series: [
      {
        type: 'treemap',
        data: data.children,
        roam: false,
        nodeClick: false,
        width: '100%',
        height: '100%',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        breadcrumb: {
          show: false
        },
        levels: [
          {
            itemStyle: {
              borderWidth: 0
            }
          },
          {
            itemStyle: {
              borderWidth: 2,
              borderColor: '#0a0a0a',
              gapWidth: 2
            }
          }
        ],
        label: {
          show: true,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: (params: any) => {
            const ticket = tickets.find(t => t.name === params.name);
            if (!ticket) return '';
            const percentage = ((params.value / totalRevenue) * 100).toFixed(1);
            // Solo mostrar etiqueta si el área es suficientemente grande
            if (params.value / totalRevenue < 0.03) return '';
            return `{name|${params.name}}\n{value|${formatCurrencyShort(params.value)}}\n{percent|${percentage}%}`;
          },
          rich: {
            name: {
              color: '#fff',
              fontSize: 11,
              fontWeight: 'bold',
              lineHeight: 16
            },
            value: {
              color: '#fff',
              fontSize: 10,
              lineHeight: 14
            },
            percent: {
              color: '#fff',
              fontSize: 9,
              opacity: 0.8,
              lineHeight: 12
            }
          },
          position: 'inside'
        },
        emphasis: {
          itemStyle: {
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          },
          label: {
            fontSize: 12
          }
        }
      }
    ]
  };

  return (
    <div className="h-full">
      <OptimizedEChart
        option={option}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}

export function ChannelSalesChart({ app, web, cash }: ChannelSalesChartProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  // Grayscale palette
  const COLORS = isDark ? [
    "#e5e5e5", // lightest
    "#cccccc", // light
    "#b3b3b3", // medium-light
  ] : [
    "#1a1a1a", // darkest
    "#2a2a2a", // dark
    "#3a3a3a", // medium-dark
  ];

  const total = app + web + cash;

  const data = [
    { name: 'App Móvil', value: app },
    { name: 'Web', value: web },
    { name: 'Efectivo', value: cash }
  ].filter(item => item.value > 0);

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item' as const,
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      borderColor: isDark ? '#303030' : '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#fff' : '#000'
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const percentage = ((params.value / total) * 100).toFixed(1);
        return `<strong>${params.name}</strong><br/>
                ${params.value} tickets<br/>
                ${percentage}%`;
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        padAngle: 3,
        itemStyle: {
          borderRadius: 10,
          borderColor: isDark ? '#1a1a1a' : '#f9fafb',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: (params: any) => {
            const percentage = ((params.value / total) * 100).toFixed(0);
            return `{name|${params.name}}\n{value|${params.value}} {percent|(${percentage}%)}`;
          },
          rich: {
            name: {
              color: isDark ? '#fff' : '#000',
              fontSize: 11,
              fontWeight: 'bold',
              lineHeight: 16
            },
            value: {
              color: isDark ? '#fff' : '#000',
              fontSize: 10,
              lineHeight: 14
            },
            percent: {
              color: isDark ? '#ccc' : '#666',
              fontSize: 9,
              lineHeight: 12
            }
          }
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10,
          lineStyle: {
            color: isDark ? '#707070' : '#d1d5db'
          }
        },
        data: data.map((item, index) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: COLORS[index % COLORS.length]
          }
        }))
      }
    ]
  };

  if (!mounted) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-gray-200 dark:border-white/30 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full">
      <OptimizedEChart
        option={option}
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}

interface DailySalesChartProps {
  orders: Array<{
    createdAt: Date;
    totalAmount: string;
    orderItems: Array<{ quantity: number }>;
  }>;
  colorPalette?: string[];
}

export function DailySalesChart({ orders }: DailySalesChartProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  // Grayscale palette
  const COLORS = isDark ? [
    "#e5e5e5", // lightest
    "#cccccc", // light
    "#b3b3b3", // medium-light
  ] : [
    "#1a1a1a", // darkest
    "#2a2a2a", // dark
    "#3a3a3a", // medium-dark
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Agrupar ventas por día
  const dailySales: Record<string, { revenue: number; quantity: number }> = {};

  orders.forEach(order => {
    const dateKey = order.createdAt.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!dailySales[dateKey]) {
      dailySales[dateKey] = { revenue: 0, quantity: 0 };
    }

    dailySales[dateKey].revenue += parseFloat(order.totalAmount);
    dailySales[dateKey].quantity += order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  });

  // Obtener rango de fechas
  let sortedDates = Object.keys(dailySales).sort();

  // Si hay datos, completar el rango entre la primera y última fecha
  if (sortedDates.length > 0) {
    const firstDate = new Date(sortedDates[0]);
    const lastDate = new Date(sortedDates[sortedDates.length - 1]);

    // Calcular la diferencia en días
    const daysDiff = Math.floor((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

    // Solo completar si hay menos de 60 días de diferencia (para evitar rangos muy grandes)
    if (daysDiff < 60) {
      const allDates: string[] = [];
      const currentDate = new Date(firstDate);

      while (currentDate <= lastDate) {
        const dateKey = currentDate.toISOString().split('T')[0];
        allDates.push(dateKey);

        // Si la fecha no existe en dailySales, agregarla con 0
        if (!dailySales[dateKey]) {
          dailySales[dateKey] = { revenue: 0, quantity: 0 };
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      sortedDates = allDates;
    }
  }
  const dates = sortedDates.map(date => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  });
  const revenues = sortedDates.map(date => dailySales[date].revenue);

  const option: EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      borderColor: isDark ? '#303030' : '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#fff' : '#000'
      },
      axisPointer: {
        type: 'shadow' as const
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const dateIndex = params[0].dataIndex;
        const dateKey = sortedDates[dateIndex];
        return `<strong>${params[0].name}</strong><br/>
                Ingresos: ${formatCurrency(dailySales[dateKey].revenue)}<br/>
                Tickets: ${dailySales[dateKey].quantity}`;
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: {
        lineStyle: {
          color: isDark ? '#303030' : '#d1d5db'
        }
      },
      axisLabel: {
        color: isDark ? '#888' : '#6b7280',
        fontSize: 11,
        rotate: dates.length > 15 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: isDark ? '#303030' : '#d1d5db'
        }
      },
      axisLabel: {
        color: isDark ? '#888' : '#6b7280',
        formatter: (value: number) => {
          if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
          return `$${value}`;
        }
      },
      splitLine: {
        lineStyle: {
          color: isDark ? '#303030' : '#e5e7eb',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'Ingresos',
        type: 'bar',
        data: revenues,
        barMaxWidth: sortedDates.length <= 3 ? 60 : sortedDates.length <= 7 ? 80 : undefined,
        itemStyle: {
          color: COLORS[0],
          borderRadius: [8, 8, 0, 0]
        },
        emphasis: {
          itemStyle: {
            opacity: 0.8
          }
        }
      }
    ]
  };

  if (!mounted) {
    return (
      <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-base">Ventas Diarias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="h-8 w-8 border-2 border-gray-200 dark:border-white/30 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
      <CardHeader>
        <CardTitle className="text-base">Ventas Diarias</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-white/60 mb-1">Total Días</div>
            <div className="text-lg font-bold">{dates.length}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-white/60 mb-1">Promedio Diario</div>
            <div className="text-lg font-bold">
              {formatCurrency(revenues.reduce((sum, val) => sum + val, 0) / dates.length)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500 dark:text-white/60 mb-1">Mejor Día</div>
            <div className="text-lg font-bold">
              {formatCurrency(Math.max(...revenues))}
            </div>
          </div>
        </div>
        <div className="h-[300px]">
          <OptimizedEChart option={option} style={{ height: '100%', width: '100%' }} />
        </div>
      </CardContent>
    </Card>
  );
}
