"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutDashboard, Download, HelpCircle } from "lucide-react";
import ReactECharts from 'echarts-for-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

interface AdminDashboardContentProps {
  organization: Organization | null;
}

export function AdminDashboardContent({ organization }: AdminDashboardContentProps) {
  const [timeRange, setTimeRange] = useState<"3" | "6" | "12">("12");

  const displayName = organization?.name || "Mi Organización";

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Header with organization info */}
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Organization Logo */}
            <div className="flex-shrink-0">
              {organization?.logo ? (
                <img
                  src={organization.logo}
                  alt={displayName}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-white/10"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-primary/10 flex items-center justify-center ring-2 ring-white/10">
                  <LayoutDashboard className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                </div>
              )}
            </div>

            {/* Organization Name */}
            <div className="min-w-0">
              <h1 className="text-lg font-bold sm:text-xl md:text-2xl truncate">{displayName}</h1>
              <p className="text-xs text-muted-foreground">
                {organization?.slug ? `@${organization.slug}` : "Panel de Administración"}
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="space-y-6">
            {/* Monthly Sales Chart */}
            <Card className="bg-white/[0.02] border-white/10 min-w-0">
              <CardContent className="pt-6">
                <div className="mb-6 flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Ventas Mensuales</h3>
                    <p className="text-xs sm:text-sm text-white/50">Ingresos por mes</p>
                  </div>

                  {/* Time Range Filters and Actions */}
                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <div className="flex gap-2 items-center">
                      <button
                        onClick={() => setTimeRange("3")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                          timeRange === "3"
                            ? "bg-white/10 text-white border border-white/20"
                            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        3M
                      </button>
                      <button
                        onClick={() => setTimeRange("6")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                          timeRange === "6"
                            ? "bg-white/10 text-white border border-white/20"
                            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        6M
                      </button>
                      <button
                        onClick={() => setTimeRange("12")}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                          timeRange === "12"
                            ? "bg-white/10 text-white border border-white/20"
                            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
                        }`}
                      >
                        12M
                      </button>

                      {/* Help Icon with Tooltip */}
                      <div className="relative group">
                        <button className="flex items-center justify-center h-6 w-6 rounded-full transition-all bg-white/5 hover:bg-white/10 border border-white/10">
                          <HelpCircle className="h-3.5 w-3.5 text-white/60" />
                        </button>

                        {/* Tooltip */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                          <div className="bg-[#18181b] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
                            <div className="text-white/80">Selecciona el rango de tiempo para visualizar</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-6 w-px bg-white/10" />

                    <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-white/90 hover:bg-white text-black border border-white/80">
                      Ventas Históricas
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Dummy chart bars */}
                <div className="space-y-2 mb-6">
                  <div className="flex items-end gap-2 h-48">
                    {[
                      { month: 'Ene', value: 65, amount: '$12,450', tickets: 456 },
                      { month: 'Feb', value: 78, amount: '$15,230', tickets: 523 },
                      { month: 'Mar', value: 92, amount: '$18,920', tickets: 678 },
                      { month: 'Abr', value: 58, amount: '$10,780', tickets: 389 },
                      { month: 'May', value: 85, amount: '$16,430', tickets: 598 },
                      { month: 'Jun', value: 100, amount: '$21,340', tickets: 756 },
                      { month: 'Jul', value: 72, amount: '$14,120', tickets: 502 },
                      { month: 'Ago', value: 88, amount: '$17,650', tickets: 634 },
                      { month: 'Sep', value: 95, amount: '$19,890', tickets: 712 },
                      { month: 'Oct', value: 82, amount: '$16,320', tickets: 587 },
                      { month: 'Nov', value: 70, amount: '$13,580', tickets: 489 },
                      { month: 'Dic', value: 90, amount: '$18,450', tickets: 658 }
                    ].slice(-parseInt(timeRange)).map((data, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center relative group">
                        {/* Bar */}
                        <div className="w-full flex flex-col justify-end" style={{ height: '160px' }}>
                          <div
                            className="w-full bg-white/[0.18] border border-white/20 rounded-t-lg transition-all duration-300 hover:bg-white/[0.28] hover:border-white/30 relative cursor-pointer overflow-hidden"
                            style={{ height: `${data.value}%` }}
                          >
                            {/* Dot pattern */}
                            <div
                              className="absolute inset-0 opacity-30 pointer-events-none"
                              style={{
                                backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 0.3px, transparent 0.3px)',
                                backgroundSize: '6px 6px'
                              }}
                            />
                          </div>
                        </div>

                        {/* Tooltip on hover - Outside the bar */}
                        <div className="absolute bottom-[170px] left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="bg-[#18181b] border border-white/10 rounded-lg px-3 py-2 text-xs whitespace-nowrap shadow-xl">
                            <div className="font-semibold text-white mb-1">{data.month}</div>
                            <div className="text-white/80 mb-0.5">{data.amount}</div>
                            <div className="text-white/60 text-[10px]">{data.tickets} tickets</div>
                          </div>
                        </div>

                        {/* Month label */}
                        <span className="text-xs text-white/50 mt-2">{data.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4 border-t border-white/10">
                  <div className="text-center p-3 sm:p-0 rounded-lg sm:rounded-none bg-white/[0.02] sm:bg-transparent border sm:border-0 border-white/5">
                    <div className="text-xs text-white/40 mb-1">
                      {timeRange === "12" ? "Total Anual" : `Total ${timeRange} meses`}
                    </div>
                    <div className="text-base sm:text-lg font-bold">
                      {timeRange === "12" && "$195,160"}
                      {timeRange === "6" && "$102,570"}
                      {timeRange === "3" && "$48,650"}
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-0 rounded-lg sm:rounded-none bg-white/[0.02] sm:bg-transparent border sm:border-0 border-white/5">
                    <div className="text-xs text-white/40 mb-1">Promedio Mensual</div>
                    <div className="text-base sm:text-lg font-bold">
                      {timeRange === "12" && "$16,263"}
                      {timeRange === "6" && "$17,095"}
                      {timeRange === "3" && "$16,217"}
                    </div>
                  </div>
                  <div className="text-center p-3 sm:p-0 rounded-lg sm:rounded-none bg-white/[0.02] sm:bg-transparent border sm:border-0 border-white/5">
                    <div className="text-xs text-white/40 mb-1">Mejor Mes</div>
                    <div className="text-base sm:text-lg font-bold">
                      {timeRange === "12" && "Jun - $21,340"}
                      {timeRange === "6" && "Sep - $19,890"}
                      {timeRange === "3" && "Nov - $13,580"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Age and Gender Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <Card className="bg-white/[0.02] border-white/10 min-w-0">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Distribución por Edad</h3>
                    <p className="text-xs sm:text-sm text-white/50">Rango de edades del público</p>
                  </div>
                  <div className="h-[300px]">
                    <ReactECharts
                      option={{
                        backgroundColor: 'transparent',
                        tooltip: {
                          trigger: 'item',
                          backgroundColor: '#18181b',
                          borderColor: '#303030',
                          borderWidth: 1,
                          textStyle: { color: '#fff' },
                          formatter: '{b}: {c}%'
                        },
                        series: [{
                          type: 'pie',
                          radius: ['40%', '70%'],
                          center: ['50%', '50%'],
                          avoidLabelOverlap: false,
                          padAngle: 3,
                          itemStyle: {
                            borderRadius: 10,
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 2,
                            color: {
                              type: 'pattern',
                              image: (() => {
                                const canvas = document.createElement('canvas');
                                canvas.width = 6;
                                canvas.height = 6;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
                                  ctx.fillRect(0, 0, 6, 6);
                                  ctx.fillStyle = 'rgba(255, 255, 255, 0.30)';
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
                            formatter: '{b}\n{d}%',
                            color: '#888',
                            fontSize: 11
                          },
                          emphasis: {
                            label: {
                              show: true,
                              fontSize: 13,
                              fontWeight: 'bold',
                              color: '#fff'
                            },
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
                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
                                    ctx.fillRect(0, 0, 6, 6);
                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
                                    ctx.beginPath();
                                    ctx.arc(3, 3, 0.3, 0, Math.PI * 2);
                                    ctx.fill();
                                  }
                                  return canvas;
                                })(),
                                repeat: 'repeat'
                              },
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              shadowBlur: 0
                            }
                          },
                          data: [
                            { name: '18-24 años', value: 35 },
                            { name: '25-34 años', value: 42 },
                            { name: '35-44 años', value: 18 },
                            { name: '45+ años', value: 5 }
                          ]
                        }]
                      }}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Gender Distribution */}
              <Card className="bg-white/[0.02] border-white/10 min-w-0">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Distribución por Género</h3>
                    <p className="text-xs sm:text-sm text-white/50">Composición del público</p>
                  </div>
                  <div className="h-[300px]">
                    <ReactECharts
                      option={{
                        backgroundColor: 'transparent',
                        tooltip: {
                          trigger: 'item',
                          backgroundColor: '#18181b',
                          borderColor: '#303030',
                          borderWidth: 1,
                          textStyle: { color: '#fff' },
                          formatter: '{b}: {c}%'
                        },
                        series: [{
                          type: 'pie',
                          radius: ['40%', '70%'],
                          center: ['50%', '50%'],
                          avoidLabelOverlap: false,
                          padAngle: 3,
                          itemStyle: {
                            borderRadius: 10,
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            borderWidth: 2,
                            color: {
                              type: 'pattern',
                              image: (() => {
                                const canvas = document.createElement('canvas');
                                canvas.width = 6;
                                canvas.height = 6;
                                const ctx = canvas.getContext('2d');
                                if (ctx) {
                                  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
                                  ctx.fillRect(0, 0, 6, 6);
                                  ctx.fillStyle = 'rgba(255, 255, 255, 0.30)';
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
                            formatter: '{b}\n{d}%',
                            color: '#888',
                            fontSize: 11
                          },
                          emphasis: {
                            label: {
                              show: true,
                              fontSize: 13,
                              fontWeight: 'bold',
                              color: '#fff'
                            },
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
                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
                                    ctx.fillRect(0, 0, 6, 6);
                                    ctx.fillStyle = 'rgba(255, 255, 255, 0.40)';
                                    ctx.beginPath();
                                    ctx.arc(3, 3, 0.3, 0, Math.PI * 2);
                                    ctx.fill();
                                  }
                                  return canvas;
                                })(),
                                repeat: 'repeat'
                              },
                              borderColor: 'rgba(255, 255, 255, 0.3)',
                              shadowBlur: 0
                            }
                          },
                          data: [
                            { name: 'Masculino', value: 52 },
                            { name: 'Femenino', value: 45 },
                            { name: 'Otro', value: 3 }
                          ]
                        }]
                      }}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
    </div>
  );
}
