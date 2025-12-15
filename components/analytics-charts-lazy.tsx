"use client";

/**
 * Lazy-loaded wrapper for AnalyticsCharts
 * Loads the charts only when they are about to become visible
 * Reduces initial bundle size and improves Time to Interactive
 */

import dynamic from 'next/dynamic';
import type { AgeGroupData, GenderData } from "@/lib/supabase/actions/profile";

// Dynamic import with loading skeleton
const AnalyticsCharts = dynamic(
  () => import('@/components/analytics-charts').then(mod => ({ default: mod.AnalyticsCharts })),
  {
    loading: () => (
      <div className="space-y-6 animate-pulse">
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-200 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg h-32" />
          ))}
        </div>

        {/* Users Growth Chart Skeleton */}
        <div className="bg-gray-200 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg h-[400px]" />

        {/* Pie Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <div className="bg-gray-200 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg h-[400px]" />
          <div className="bg-gray-200 dark:bg-[#1a1a1a] border border-gray-300 dark:border-[#2a2a2a] rounded-lg h-[400px]" />
        </div>
      </div>
    ),
    ssr: false, // Disable SSR for charts (they use browser-only features)
  }
);

interface AnalyticsChartsLazyProps {
  ageGroups: AgeGroupData[];
  genderGroups: GenderData[];
  totalUsers: number;
  totalTicketsSold: number;
  totalRegisteredUsers?: number;
}

export function AnalyticsChartsLazy(props: AnalyticsChartsLazyProps) {
  return <AnalyticsCharts {...props} />;
}
