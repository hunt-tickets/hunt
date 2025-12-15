"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutDashboard, Download, HelpCircle, Users } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
}

interface AdminDashboardContentProps {
  organization: Organization | null;
}

// Donut Chart Component
function DonutChart({
  data,
}: {
  data: Array<{ name: string; value: number; color: string }>;
}) {
  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-40 h-40">
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
                  strokeWidth="18"
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
            <div className="text-xl font-bold">{total}%</div>
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
              {item.name} {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardContent({ organization }: AdminDashboardContentProps) {
  const [timeRange, setTimeRange] = useState<"3" | "6" | "12">("12");

  const displayName = organization?.name || "Mi Organización";

  // Age distribution data
  const ageData = [
    { name: '18-24 años', value: 35, color: 'rgba(255, 255, 255, 0.5)' },
    { name: '25-34 años', value: 42, color: 'rgba(255, 255, 255, 0.35)' },
    { name: '35-44 años', value: 18, color: 'rgba(255, 255, 255, 0.25)' },
    { name: '45+ años', value: 5, color: 'rgba(255, 255, 255, 0.15)' }
  ];

  // Gender distribution data
  const genderData = [
    { name: 'Masculino', value: 52, color: 'rgba(255, 255, 255, 0.5)' },
    { name: 'Femenino', value: 45, color: 'rgba(255, 255, 255, 0.35)' },
    { name: 'Otro', value: 3, color: 'rgba(255, 255, 255, 0.2)' }
  ];

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

        {/* Tabs */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="vendedores" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Vendedores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
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
                  <div className="h-[300px] flex items-center justify-center">
                    <DonutChart data={ageData} />
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
                  <div className="h-[300px] flex items-center justify-center">
                    <DonutChart data={genderData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vendedores" className="space-y-6">
            <Card className="bg-white/[0.02] border-white/10">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-white/40 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Gestión de Vendedores</h3>
                  <p className="text-sm text-white/50">
                    Próximamente podrás gestionar y dar seguimiento a tu equipo de vendedores
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
