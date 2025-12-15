"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTheme } from "next-themes";
import { OptimizedEChart } from "@/components/optimized-echart";

interface DailyUserData {
  date: string;
  newUsers: number;
  returningUsers: number;
}

export function UsersGrowthChart() {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90" | "180" | "365">("30");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  // Memoized colors
  const NEW_USERS_COLOR = useMemo(
    () => isDark ? "#e5e5e5" : "#1a1a1a",
    [isDark]
  );
  const RETURNING_USERS_COLOR = useMemo(
    () => isDark ? "#999999" : "#4a4a4a",
    [isDark]
  );

  // Memoized mock data generation
  const displayData = useMemo(() => {
    const days = parseInt(timeRange);
    const data: DailyUserData[] = [];
    const today = new Date();

    // For 3 months (90), 6 months (180) and 12 months (365), group by month
    if (timeRange === "90" || timeRange === "180" || timeRange === "365") {
      const months = timeRange === "90" ? 3 : timeRange === "180" ? 6 : 12;

      for (let i = months - 1; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthIndex = months - i;

        data.push({
          date: date.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }),
          newUsers: Math.floor(150 + (monthIndex % 12) * 15 + Math.sin(monthIndex * 0.3) * 50),
          returningUsers: Math.floor(120 + (monthIndex % 10) * 18 + Math.cos(monthIndex * 0.25) * 45),
        });
      }
    } else {
      // For 7 and 30 days, show daily data
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        const dayIndex = days - i;
        data.push({
          date: date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' }),
          newUsers: Math.floor(20 + (dayIndex % 30) * 1.2 + Math.sin(dayIndex * 0.5) * 10),
          returningUsers: Math.floor(15 + (dayIndex % 35) * 1.4 + Math.cos(dayIndex * 0.4) * 12),
        });
      }
    }

    return data;
  }, [timeRange]);

  // Memoized totals
  const { totalNew, totalReturning } = useMemo(() => {
    const totalNew = displayData.reduce((sum, d) => sum + d.newUsers, 0);
    const totalReturning = displayData.reduce((sum, d) => sum + d.returningUsers, 0);
    return { totalNew, totalReturning };
  }, [displayData]);

  // Memoized ECharts configuration
  const chartOption = useMemo(() => {
    const dates = displayData.map(d => d.date);
    const newUsersData = displayData.map(d => d.newUsers);
    const returningUsersData = displayData.map(d => d.returningUsers);

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
          type: 'line',
          lineStyle: {
            color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            width: 1,
            type: 'dashed'
          }
        },
        formatter: (params: any) => {
          const date = params[0].axisValue;
          const returningUsers = params[0].value;
          const newUsers = params[1].value;
          const total = newUsers + returningUsers;

          return `
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px;">${date}</div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; margin-bottom: 4px;">
              <div style="width: 8px; height: 8px; border-radius: 2px; background-color: ${NEW_USERS_COLOR};"></div>
              <span style="color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};">Nuevos:</span>
              <span style="font-weight: 500;">${newUsers}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; margin-bottom: 4px;">
              <div style="width: 8px; height: 8px; border-radius: 2px; background-color: ${RETURNING_USERS_COLOR};"></div>
              <span style="color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};">Recurrentes:</span>
              <span style="font-weight: 500;">${returningUsers}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 11px; padding-top: 4px; margin-top: 4px; border-top: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'};">
              <span style="color: ${isDark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)'};">Total:</span>
              <span style="font-weight: 500;">${total}</span>
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
        data: dates,
        axisLine: {
          lineStyle: {
            color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
          }
        },
        axisLabel: {
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
          fontSize: 11,
          interval: timeRange === '7' ? 0
            : timeRange === '30' ? 4
            : 0, // For 90, 180 and 365, show all months
          rotate: 0
        },
        axisTick: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false
        },
        axisLabel: {
          color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)',
          fontSize: 11
        },
        splitLine: {
          lineStyle: {
            color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            type: 'dashed'
          }
        }
      },
      series: [
        {
          name: 'Usuarios Recurrentes',
          type: 'bar',
          stack: 'total',
          data: returningUsersData,
          itemStyle: {
            color: RETURNING_USERS_COLOR,
            borderRadius: 0,
            opacity: 0.85
          },
          emphasis: {
            itemStyle: {
              opacity: 1
            }
          },
          barMaxWidth: timeRange === '7' ? 60
            : timeRange === '30' ? 30
            : timeRange === '90' ? 60  // 3 months
            : timeRange === '180' ? 50 // 6 months
            : 40 // 365 days (12 months)
        },
        {
          name: 'Usuarios Nuevos',
          type: 'bar',
          stack: 'total',
          data: newUsersData,
          itemStyle: {
            color: NEW_USERS_COLOR,
            borderRadius: [8, 8, 0, 0],
            opacity: 0.85
          },
          emphasis: {
            itemStyle: {
              opacity: 1
            }
          },
          barMaxWidth: timeRange === '7' ? 60
            : timeRange === '30' ? 30
            : timeRange === '90' ? 60  // 3 months
            : timeRange === '180' ? 50 // 6 months
            : 40 // 365 days (12 months)
        }
      ]
    };
  }, [displayData, isDark, NEW_USERS_COLOR, RETURNING_USERS_COLOR, timeRange]);

  if (!mounted) {
    return (
      <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="h-6 w-64 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 w-12 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
          <div className="h-64 sm:h-80 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Comportamiento de Compradores
            </h3>
            <p className="text-sm text-gray-500 dark:text-white/50">
              Análisis de usuarios nuevos y recurrentes
            </p>
          </div>

          {/* Time Range Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTimeRange("7")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                timeRange === "7"
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setTimeRange("30")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                timeRange === "30"
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
              }`}
            >
              1M
            </button>
            <button
              onClick={() => setTimeRange("90")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                timeRange === "90"
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
              }`}
            >
              3M
            </button>
            <button
              onClick={() => setTimeRange("180")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                timeRange === "180"
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setTimeRange("365")}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                timeRange === "365"
                  ? "bg-gray-200 dark:bg-white/10 text-gray-900 dark:text-white border border-gray-300 dark:border-white/20"
                  : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
              }`}
            >
              1A
            </button>
          </div>
        </div>

        {/* ECharts Chart */}
        <div className="h-64 sm:h-80">
          <OptimizedEChart
            option={chartOption}
            style={{ height: '100%', width: '100%' }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-200 dark:border-white/5">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: NEW_USERS_COLOR }}></div>
            <span className="text-sm text-gray-600 dark:text-white/60">Usuarios Nuevos</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">({totalNew.toLocaleString('es-CO')})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: RETURNING_USERS_COLOR }}></div>
            <span className="text-sm text-gray-600 dark:text-white/60">Usuarios Recurrentes</span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">({totalReturning.toLocaleString('es-CO')})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
