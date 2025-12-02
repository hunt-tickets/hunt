"use client";

import { useState, useEffect } from "react";
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AgeGroupData, GenderData } from "@/lib/supabase/actions/profile";
import { Users, Ticket } from "lucide-react";
import { useTheme } from "next-themes";

interface AnalyticsChartsProps {
  ageGroups: AgeGroupData[];
  genderGroups: GenderData[];
  totalUsers: number;
  totalTicketsSold: number;
  totalRegisteredUsers: number;
}

export function AnalyticsCharts({ ageGroups, genderGroups, totalUsers, totalTicketsSold, totalRegisteredUsers }: AnalyticsChartsProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  // Color palette that adapts to theme
  const COLORS = isDark ? [
    "#e5e5e5", // lightest
    "#cccccc", // light
    "#b3b3b3", // medium-light
    "#999999", // medium
    "#808080", // medium-dark
    "#666666", // dark
    "#4d4d4d", // darkest
  ] : [
    "#1a1a1a", // darkest
    "#2a2a2a", // dark
    "#3a3a3a", // medium-dark
    "#4a4a4a", // medium
    "#5a5a5a", // medium-light
    "#6a6a6a", // light
    "#7a7a7a", // lightest
  ];

  // Prepare data for pie chart (users by age)
  const usersByAgeData = (ageGroups || [])
    .filter(group => group.ageGroup !== "Sin edad")
    .map((group, index) => ({
      name: group.ageGroup,
      value: group.users,
      itemStyle: { color: COLORS[index % COLORS.length] }
    }));

  // Prepare data for bar chart (gender distribution)
  const safeGenderGroups = genderGroups || [];
  const genderLabels = safeGenderGroups.map(item => item.gender);
  const genderValues = safeGenderGroups.map(item => item.users);

  // Gender colors - monochromatic, adapts to theme
  const genderColors: Record<string, string> = isDark ? {
    'Masculino': '#e5e5e5', // lightest
    'Femenino': '#999999', // medium
    'Otro': '#666666', // dark
  } : {
    'Masculino': '#1a1a1a', // darkest
    'Femenino': '#4a4a4a', // medium
    'Otro': '#6a6a6a', // light
  };

  // Pie Chart Option (Age Distribution)
  const pieChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      borderColor: isDark ? '#303030' : '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#fff' : '#000'
      },
      formatter: '{b}: {c} usuarios ({d}%)'
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: isDark ? '#0a0a0a' : '#ffffff',
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
        data: usersByAgeData
      }
    ]
  };

  // Bar Chart Option (Gender Distribution)
  const barChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#18181b' : '#ffffff',
      borderColor: isDark ? '#303030' : '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: isDark ? '#fff' : '#000'
      },
      formatter: (params: { dataIndex: number; name: string; value: number }[]) => {
        const dataIndex = params[0].dataIndex;
        const item = safeGenderGroups[dataIndex];
        if (!item) return `${params[0].name}<br/>${params[0].value} usuarios`;
        return `${params[0].name}<br/>${params[0].value} usuarios<br/>${item.tickets} tickets`;
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
      data: genderLabels,
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
        color: isDark ? '#888' : '#6b7280'
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
        data: genderValues.map((value, index) => ({
          value,
          itemStyle: {
            color: genderColors[genderLabels[index]] || '#6b7280',
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
      <div className="space-y-6">
        {/* Stats Cards - Show immediately */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gray-50 dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-[#303030]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Usuarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRegisteredUsers}</div>
              <p className="text-xs text-gray-500 dark:text-[#404040] mt-1">Usuarios registrados en el sistema</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-[#303030]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usuarios con Compras
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-gray-500 dark:text-[#404040] mt-1">Usuarios que han comprado al menos 1 ticket</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-[#303030]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Total Tickets Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTicketsSold}</div>
              <p className="text-xs text-gray-500 dark:text-[#404040] mt-1">Tickets vendidos en total</p>
            </CardContent>
          </Card>
        </div>

        {/* Loading skeletons for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gray-50 dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-[#303030]">
            <CardHeader>
              <CardTitle className="text-lg">Distribución por Edad</CardTitle>
              <CardDescription>Usuarios que han comprado, agrupados por edad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-gray-200 dark:border-white/30 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-50 dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-[#303030]">
            <CardHeader>
              <CardTitle className="text-lg">Distribución por Género</CardTitle>
              <CardDescription>Usuarios que han comprado, agrupados por género</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-gray-200 dark:border-white/30 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gray-50 dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-[#303030]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRegisteredUsers}</div>
            <p className="text-xs text-gray-500 dark:text-[#404040] mt-1">Usuarios registrados en el sistema</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-[#303030]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Usuarios con Compras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-gray-500 dark:text-[#404040] mt-1">Usuarios que han comprado al menos 1 ticket</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-[#303030]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Total Tickets Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTicketsSold}</div>
            <p className="text-xs text-gray-500 dark:text-[#404040] mt-1">Tickets vendidos en total</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Age Distribution - Pie Chart */}
        <Card className="bg-gray-50 dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-[#303030]">
          <CardHeader>
            <CardTitle className="text-lg">Distribución por Edad</CardTitle>
            <CardDescription>Usuarios que han comprado, agrupados por edad</CardDescription>
          </CardHeader>
          <CardContent>
            {usersByAgeData.length > 0 ? (
              <div className="h-[300px]">
                <ReactECharts option={pieChartOption} style={{ height: '100%', width: '100%' }} />
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-gray-500 dark:text-[#404040]">
                No hay datos de edad disponibles
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gender Distribution - Bar Chart */}
        <Card className="bg-gray-50 dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-[#303030]">
          <CardHeader>
            <CardTitle className="text-lg">Distribución por Género</CardTitle>
            <CardDescription>Usuarios que han comprado, agrupados por género</CardDescription>
          </CardHeader>
          <CardContent>
            {safeGenderGroups.length > 0 ? (
              <div className="h-[300px]">
                <ReactECharts option={barChartOption} style={{ height: '100%', width: '100%' }} />
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-gray-500 dark:text-[#404040]">
                No hay datos de género disponibles
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Table */}
      <Card className="bg-gray-50 dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-[#303030]">
        <CardHeader>
          <CardTitle className="text-lg">Resumen Detallado</CardTitle>
          <CardDescription>Estadísticas completas por grupo de edad</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-white/5">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-white/70">Grupo de Edad</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-white/70">Usuarios</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-white/70">Tickets</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-white/70">Tickets Promedio</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-white/70">Precio Promedio</th>
                </tr>
              </thead>
              <tbody>
                {(ageGroups || []).map((group) => (
                  <tr key={group.ageGroup} className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.02]">
                    <td className="py-3 px-4 text-sm">{group.ageGroup}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-white/70 text-right">{group.users}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-white/70 text-right">{group.tickets}</td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-white/70 text-right">
                      {(group.tickets / group.users).toFixed(1)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-white/70 text-right">
                      {group.averagePrice ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(group.averagePrice) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-300 dark:border-white/10 font-medium">
                  <td className="py-3 px-4 text-sm">Total</td>
                  <td className="py-3 px-4 text-sm text-right">{totalUsers}</td>
                  <td className="py-3 px-4 text-sm text-right">{totalTicketsSold}</td>
                  <td className="py-3 px-4 text-sm text-right">
                    {totalUsers > 0 ? (totalTicketsSold / totalUsers).toFixed(1) : '0.0'}
                  </td>
                  <td className="py-3 px-4 text-sm text-right">
                    {(() => {
                      const totalPrice = (ageGroups || []).reduce((sum, group) => sum + (group.averagePrice || 0) * group.users, 0);
                      const avgPrice = totalUsers > 0 ? totalPrice / totalUsers : 0;
                      return avgPrice > 0 ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(avgPrice) : '-';
                    })()}
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
