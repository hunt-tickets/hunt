"use client";

import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SalesDistributionChartProps {
  app: number;
  web: number;
  cash: number;
  colorPalette?: string[];
}

export function SalesDistributionChart({ app, web, cash, colorPalette = [] }: SalesDistributionChartProps) {
  const data = [
    { name: 'App', value: app },
    { name: 'Web', value: web },
    { name: 'Efectivo', value: cash },
  ].filter(item => item.value > 0);

  // Create pattern canvas only on client side
  const createPatternCanvas = () => {
    if (typeof window === 'undefined') return undefined;
    const canvas = document.createElement('canvas');
    canvas.width = 6;
    canvas.height = 6;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fillRect(0, 0, 6, 6);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.beginPath();
      ctx.arc(3, 3, 0.3, 0, Math.PI * 2);
      ctx.fill();
    }
    return canvas;
  };

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#18181b',
      borderColor: '#303030',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
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
          borderColor: '#707070',
          borderWidth: 2,
          color: {
            type: 'pattern',
            image: createPatternCanvas(),
            repeat: 'repeat'
          }
        },
        label: {
          show: true,
          formatter: '{b} {d}%',
          color: '#ccc',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff'
          },
          scale: false,
          itemStyle: colorPalette.length === 0 ? {
            color: {
              type: 'pattern',
              image: (() => {
                const canvas = document.createElement('canvas');
                canvas.width = 6;
                canvas.height = 6;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                  ctx.fillRect(0, 0, 6, 6);
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
                  ctx.beginPath();
                  ctx.arc(3, 3, 0.3, 0, Math.PI * 2);
                  ctx.fill();
                }
                return canvas;
              })(),
              repeat: 'repeat'
            },
            borderColor: '#707070',
            shadowBlur: 0
          } : {
            borderColor: 'rgba(255, 255, 255, 0.3)',
            shadowBlur: 0
          }
        },
        data: colorPalette.length === 0
          ? data.map(item => ({ ...item, itemStyle: undefined }))
          : data.map((item, index) => ({
              ...item,
              itemStyle: {
                color: colorPalette[index % colorPalette.length]
              }
            }))
      }
    ]
  };

  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardHeader>
        <CardTitle className="text-base">Distribución por Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
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

export function RevenueByChannelChart({ appTotal, webTotal, cashTotal, colorPalette = [] }: RevenueByChannelChartProps) {
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

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#18181b',
      borderColor: '#303030',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      axisPointer: {
        type: 'shadow'
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
          color: '#707070'
        }
      },
      axisLabel: {
        color: '#ccc'
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#707070'
        }
      },
      axisLabel: {
        color: '#ccc',
        formatter: (value: number) => {
          if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
          return `$${value}`;
        }
      },
      splitLine: {
        lineStyle: {
          color: '#707070',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        type: 'bar',
        data: colorPalette.length === 0
          ? data.map(d => ({ value: d.value }))
          : data.map((d, index) => ({
              value: d.value,
              itemStyle: {
                color: colorPalette[index % colorPalette.length],
                borderColor: colorPalette[(index + 1) % colorPalette.length] || colorPalette[index % colorPalette.length],
                borderWidth: 1,
                borderRadius: [6, 6, 0, 0]
              }
            })),
        itemStyle: colorPalette.length === 0 ? {
          color: 'rgba(255, 255, 255, 0.35)',
          borderColor: 'rgba(255, 255, 255, 0.45)',
          borderWidth: 1,
          borderRadius: [6, 6, 0, 0]
        } : undefined,
        emphasis: {
          itemStyle: colorPalette.length === 0 ? {
            color: 'rgba(255, 255, 255, 0.45)',
            borderColor: 'rgba(255, 255, 255, 0.55)',
            shadowBlur: 0
          } : {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ]
  };

  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardHeader>
        <CardTitle className="text-base">Ingresos por Canal</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
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

export function SalesFunnelChart({ visits, addedToCart, completed, colorPalette = [] }: SalesFunnelChartProps) {
  const useGrayScale = colorPalette.length === 0;
  const stages = [
    { name: 'Visitas', value: visits, color: useGrayScale ? '#3b82f6' : colorPalette[0] },
    { name: 'Carrito', value: addedToCart, color: useGrayScale ? '#8b5cf6' : colorPalette[1] },
    { name: 'Completado', value: completed, color: useGrayScale ? '#10b981' : colorPalette[2] }
  ];

  const conversionRates = [
    100,
    visits > 0 ? (addedToCart / visits) * 100 : 0,
    addedToCart > 0 ? (completed / addedToCart) * 100 : 0
  ];

  const maxValue = Math.max(...stages.map(s => s.value));
  const svgWidth = 600;
  const svgHeight = 320;
  const padding = 20;

  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardHeader>
        <CardTitle className="text-base">Embudo de Ventas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <svg width="100%" height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="max-w-full">
            {stages.map((stage, index) => {
              const widthRatio = stage.value / maxValue;
              const nextRatio = index < stages.length - 1 ? stages[index + 1].value / maxValue : 0.3;

              const y = padding + index * 90;
              const nextY = y + 80;

              const maxWidth = svgWidth - padding * 2;
              const currentWidth = maxWidth * widthRatio;
              const nextWidth = maxWidth * nextRatio;

              const x1 = (svgWidth - currentWidth) / 2;
              const x2 = x1 + currentWidth;
              const nextX1 = (svgWidth - nextWidth) / 2;
              const nextX2 = nextX1 + nextWidth;

              return (
                <g key={index}>
                  {/* Smooth funnel section */}
                  <path
                    d={`M ${x1} ${y} L ${x2} ${y} Q ${x2 + (nextX2 - x2) * 0.3} ${y + 40}, ${nextX2} ${nextY} L ${nextX1} ${nextY} Q ${x1 - (nextX1 - x1) * 0.3} ${y + 40}, ${x1} ${y} Z`}
                    fill="rgba(255, 255, 255, 0.35)"
                    fillOpacity="1"
                    stroke="rgba(255, 255, 255, 0.45)"
                    strokeWidth="1"
                    strokeOpacity="1"
                    className="hover:fill-opacity-100 transition-opacity"
                  />

                  {/* Label */}
                  <text
                    x={svgWidth / 2}
                    y={y + 25}
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                    className="pointer-events-none"
                  >
                    {stage.name}
                  </text>
                  <text
                    x={svgWidth / 2}
                    y={y + 45}
                    textAnchor="middle"
                    fill="#ccc"
                    fontSize="12"
                    className="pointer-events-none"
                  >
                    {stage.value} ({conversionRates[index].toFixed(0)}%)
                  </text>
                </g>
              );
            })}
          </svg>
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

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
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
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}

export function ChannelSalesChart({ app, web, cash }: ChannelSalesChartProps) {
  const total = app + web + cash;

  const data = [
    {
      name: 'App Móvil',
      value: app,
      itemStyle: { color: '#8b5cf6' }
    },
    {
      name: 'Web',
      value: web,
      itemStyle: { color: '#06b6d4' }
    },
    {
      name: 'Efectivo',
      value: cash,
      itemStyle: { color: '#10b981' }
    }
  ].filter(item => item.value > 0);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#18181b',
      borderColor: '#303030',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
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
        radius: ['45%', '75%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        padAngle: 3,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#707070',
          borderWidth: 2,
          color: {
            type: 'pattern',
            image: (() => {
              const canvas = document.createElement('canvas');
              canvas.width = 6;
              canvas.height = 6;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
                ctx.fillRect(0, 0, 6, 6);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
                ctx.beginPath();
                ctx.arc(3, 3, 0.3, 0, Math.PI * 2);
                ctx.fill();
              }
              return canvas;
            })(),
            repeat: 'repeat'
          }
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
              color: '#ccc',
              fontSize: 9,
              lineHeight: 12
            }
          }
        },
        emphasis: {
          scale: false,
          itemStyle: {
            color: {
              type: 'pattern',
              image: (() => {
                const canvas = document.createElement('canvas');
                canvas.width = 6;
                canvas.height = 6;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
                  ctx.fillRect(0, 0, 6, 6);
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
                  ctx.beginPath();
                  ctx.arc(3, 3, 0.3, 0, Math.PI * 2);
                  ctx.fill();
                }
                return canvas;
              })(),
              repeat: 'repeat'
            },
            borderColor: '#707070',
            shadowBlur: 0
          },
          label: {
            fontSize: 12
          }
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10,
          lineStyle: {
            color: '#707070'
          }
        },
        data: data.map(item => ({ name: item.name, value: item.value }))
      }
    ]
  };

  return (
    <div className="h-full">
      <ReactECharts
        option={option}
        style={{ height: '100%', width: '100%' }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}

interface DailySalesChartProps {
  transactions: Array<{
    created_at: string;
    total: number;
    quantity: number;
  }>;
  colorPalette?: string[];
}

export function DailySalesChart({ transactions, colorPalette = [] }: DailySalesChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Agrupar transacciones por día
  const dailySales: Record<string, { revenue: number; quantity: number }> = {};

  transactions.forEach(transaction => {
    const date = new Date(transaction.created_at);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!dailySales[dateKey]) {
      dailySales[dateKey] = { revenue: 0, quantity: 0 };
    }

    dailySales[dateKey].revenue += transaction.total;
    dailySales[dateKey].quantity += transaction.quantity;
  });

  // Ordenar por fecha y preparar datos para el gráfico
  const sortedDates = Object.keys(dailySales).sort();
  const dates = sortedDates.map(date => {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    return `${day}/${month}`;
  });
  const revenues = sortedDates.map(date => dailySales[date].revenue);

  const useGrayScale = colorPalette.length === 0;
  const barColor = useGrayScale ? 'rgba(255, 255, 255, 0.35)' : colorPalette[0];
  const barBorderColor = useGrayScale ? 'rgba(255, 255, 255, 0.45)' : colorPalette[1] || colorPalette[0];
  const barEmphasisColor = useGrayScale ? 'rgba(255, 255, 255, 0.45)' : colorPalette[2] || colorPalette[1] || colorPalette[0];

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#18181b',
      borderColor: '#303030',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      axisPointer: {
        type: 'shadow'
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
          color: '#707070'
        }
      },
      axisLabel: {
        color: '#ccc',
        fontSize: 11,
        rotate: dates.length > 15 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#707070'
        }
      },
      axisLabel: {
        color: '#ccc',
        formatter: (value: number) => {
          if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
          if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
          return `$${value}`;
        }
      },
      splitLine: {
        lineStyle: {
          color: '#707070',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: 'Ingresos',
        type: 'bar',
        data: revenues,
        itemStyle: {
          color: barColor,
          borderColor: barBorderColor,
          borderWidth: 1,
          borderRadius: [6, 6, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: barEmphasisColor,
            borderColor: barBorderColor
          }
        }
      }
    ]
  };

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
              {formatCurrency(revenues.reduce((sum, val) => sum + val, 0) / dates.length)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-white/40 mb-1">Mejor Día</div>
            <div className="text-lg font-bold">
              {formatCurrency(Math.max(...revenues))}
            </div>
          </div>
        </div>
        <div className="h-[300px]">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} />
        </div>
      </CardContent>
    </Card>
  );
}
