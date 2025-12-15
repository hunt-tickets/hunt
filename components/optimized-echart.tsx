"use client";

/**
 * Optimized ECharts component with tree-shaking
 * Only imports the necessary ECharts components instead of the entire library
 * Reduces bundle size from ~400KB to ~150-200KB
 */

import { useEffect, useRef } from "react";
import * as echarts from 'echarts/core';
import {
  PieChart,
  BarChart,
} from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components';
import {
  CanvasRenderer
} from 'echarts/renderers';
import type { EChartsOption } from 'echarts';

// Register only the components we need
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  PieChart,
  BarChart,
  CanvasRenderer
]);

interface OptimizedEChartProps {
  option: EChartsOption;
  style?: React.CSSProperties;
  className?: string;
  theme?: string;
  notMerge?: boolean;
  lazyUpdate?: boolean;
}

export function OptimizedEChart({
  option,
  style,
  className,
  theme,
  notMerge = true,
  lazyUpdate = false
}: OptimizedEChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  // Initialize chart
  useEffect(() => {
    if (!chartRef.current) return;

    // Create chart instance
    chartInstance.current = echarts.init(chartRef.current, theme);

    // Handle resize
    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [theme]);

  // Update chart when option changes
  useEffect(() => {
    if (!chartInstance.current) return;

    chartInstance.current.setOption(option, notMerge, lazyUpdate);
  }, [option, notMerge, lazyUpdate]);

  return (
    <div
      ref={chartRef}
      style={style || { width: '100%', height: '300px' }}
      className={className}
    />
  );
}
