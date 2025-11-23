"use client";

import { useState, useEffect } from "react";
import ReactECharts from 'echarts-for-react';
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
  "#8b5cf6", // purple
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#10b981", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#6b7280", // gray
];

export function AnalyticsCharts({ ageGroups, genderGroups, totalUsers, totalTicketsSold }: AnalyticsChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Gender colors
  const genderColors: Record<string, string> = {
    'Masculino': '#3b82f6', // blue
    'Femenino': '#ec4899', // pink
    'Otro': '#10b981', // green
  };

  // Pie Chart Option (Age Distribution)
  const pieChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: '#18181b',
      borderColor: '#303030',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
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
          borderColor: '#0a0a0a',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          color: '#888',
          fontSize: 12
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#fff'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
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
      backgroundColor: '#18181b',
      borderColor: '#303030',
      borderWidth: 1,
      textStyle: {
        color: '#fff'
      },
      axisPointer: {
        type: 'shadow'
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
          color: '#303030'
        }
      },
      axisLabel: {
        color: '#888',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#303030'
        }
      },
      axisLabel: {
        color: '#888'
      },
      splitLine: {
        lineStyle: {
          color: '#303030',
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

        {/* Loading skeletons for charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
            <CardHeader>
              <CardTitle className="text-lg">Distribución por Edad</CardTitle>
              <CardDescription>Usuarios que han comprado, agrupados por edad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
            <CardHeader>
              <CardTitle className="text-lg">Distribución por Género</CardTitle>
              <CardDescription>Usuarios que han comprado, agrupados por género</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
        {/* Age Distribution - Pie Chart */}
        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
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
              <div className="h-[300px]">
                <ReactECharts option={barChartOption} style={{ height: '100%', width: '100%' }} />
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
