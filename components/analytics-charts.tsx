"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgeGroupData, GenderData } from "@/lib/supabase/actions/profile";
import { Users, Ticket } from "lucide-react";

interface AnalyticsChartsProps {
  ageGroups: AgeGroupData[];
  genderGroups: GenderData[];
  totalUsers: number;
  totalTicketsSold: number;
}

const COLORS = [
  "bg-violet-500",
  "bg-blue-500",
  "bg-cyan-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-red-500",
  "bg-gray-500",
];

const GENDER_COLORS: Record<string, string> = {
  'Masculino': 'bg-blue-500',
  'Femenino': 'bg-pink-500',
  'Otro': 'bg-emerald-500',
};

export function AnalyticsCharts({ ageGroups, genderGroups, totalUsers, totalTicketsSold }: AnalyticsChartsProps) {
  // Prepare data for pie chart (users by age)
  const usersByAgeData = (ageGroups || [])
    .filter(group => group.ageGroup !== "Sin edad")
    .map((group, index) => ({
      name: group.ageGroup,
      value: group.users,
      color: COLORS[index % COLORS.length]
    }));

  const totalAgeUsers = usersByAgeData.reduce((acc, item) => acc + item.value, 0);

  // Prepare data for bar chart (gender distribution)
  const safeGenderGroups = genderGroups || [];
  const maxGenderValue = Math.max(...safeGenderGroups.map(item => item.users), 1);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios con Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-[#404040] mt-1">Usuarios que han comprado al menos 1 ticket</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Total Tickets Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTicketsSold}</div>
            <p className="text-xs text-[#404040] mt-1">Tickets vendidos en total</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution - Donut Chart */}
        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader>
            <CardTitle className="text-lg">Distribución por Edad</CardTitle>
            <CardDescription>Usuarios que han comprado, agrupados por edad</CardDescription>
          </CardHeader>
          <CardContent>
            {usersByAgeData.length > 0 ? (
              <div className="flex flex-col items-center gap-6">
                {/* Donut Chart */}
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {(() => {
                      let cumulativePercent = 0;
                      return usersByAgeData.map((item, index) => {
                        const percent = (item.value / totalAgeUsers) * 100;
                        const strokeDasharray = `${percent} ${100 - percent}`;
                        const strokeDashoffset = -cumulativePercent;
                        cumulativePercent += percent;

                        const colorMap: Record<string, string> = {
                          'bg-violet-500': '#8b5cf6',
                          'bg-blue-500': '#3b82f6',
                          'bg-cyan-500': '#06b6d4',
                          'bg-emerald-500': '#10b981',
                          'bg-amber-500': '#f59e0b',
                          'bg-red-500': '#ef4444',
                          'bg-gray-500': '#6b7280',
                        };

                        return (
                          <circle
                            key={index}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={colorMap[item.color] || '#6b7280'}
                            strokeWidth="20"
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
                      <div className="text-2xl font-bold">{totalAgeUsers}</div>
                      <div className="text-xs text-white/50">usuarios</div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-3">
                  {usersByAgeData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <span className="text-sm text-white/70">
                        {item.name} ({((item.value / totalAgeUsers) * 100).toFixed(0)}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-[#404040]">
                No hay datos de edad disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gender Distribution - Bar Chart */}
        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader>
            <CardTitle className="text-lg">Distribución por Género</CardTitle>
            <CardDescription>Usuarios que han comprado, agrupados por género</CardDescription>
          </CardHeader>
          <CardContent>
            {safeGenderGroups.length > 0 ? (
              <div className="space-y-4 py-4">
                {safeGenderGroups.map((item, index) => {
                  const percentage = (item.users / maxGenderValue) * 100;
                  const colorClass = GENDER_COLORS[item.gender] || 'bg-gray-500';

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white/70">{item.gender}</span>
                        <span className="text-white font-medium">{item.users} usuarios</span>
                      </div>
                      <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                        <div
                          className={`h-full ${colorClass} rounded-lg transition-all duration-500 flex items-center justify-end pr-3`}
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 20 && (
                            <span className="text-xs font-medium text-white">
                              {item.tickets} tickets
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-[#404040]">
                No hay datos de género disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
        <CardHeader>
          <CardTitle className="text-lg">Resumen Detallado</CardTitle>
          <CardDescription>Estadísticas completas por grupo de edad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-sm font-medium text-white/70">Grupo de Edad</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-white/70">Usuarios</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-white/70">Tickets</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-white/70">Promedio por Usuario</th>
                </tr>
              </thead>
              <tbody>
                {(ageGroups || []).map((group) => (
                  <tr key={group.ageGroup} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-sm text-white">{group.ageGroup}</td>
                    <td className="py-3 px-4 text-sm text-white/70 text-right">{group.users}</td>
                    <td className="py-3 px-4 text-sm text-white/70 text-right">{group.tickets}</td>
                    <td className="py-3 px-4 text-sm text-white/70 text-right">
                      {(group.tickets / group.users).toFixed(1)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-white/10 font-medium">
                  <td className="py-3 px-4 text-sm text-white">Total</td>
                  <td className="py-3 px-4 text-sm text-white text-right">{totalUsers}</td>
                  <td className="py-3 px-4 text-sm text-white text-right">{totalTicketsSold}</td>
                  <td className="py-3 px-4 text-sm text-white text-right">
                    {totalUsers > 0 ? (totalTicketsSold / totalUsers).toFixed(1) : '0.0'}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
