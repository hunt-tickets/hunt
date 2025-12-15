/**
 * Reusable Loading Skeleton components
 *
 * These components provide consistent loading states across the application.
 * They create placeholder UI that mimics the actual content structure.
 */

import { Card, CardContent } from "@/components/ui/card";

/**
 * Generic skeleton line
 */
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`bg-gray-200 dark:bg-white/10 rounded animate-pulse ${className}`}
    />
  );
}

/**
 * KPI Card Skeleton
 * Used for loading states of stat cards
 */
export function KPICardSkeleton() {
  return (
    <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
      <CardContent className="p-4 sm:p-5">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Chart Skeleton
 * Used for loading states of charts
 */
export function ChartSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-8 w-12" />
            </div>
          </div>
          <Skeleton className={height} />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Table Skeleton
 * Used for loading states of tables
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
      <CardContent className="p-4 sm:p-6">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Referrals Loading Skeleton
 * Specific skeleton for referrals tab
 */
export function ReferralsLoadingSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>

      {/* Table */}
      <TableSkeleton rows={5} />

      {/* Info Cards */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <Card
            key={i}
            className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5"
          >
            <CardContent className="p-4 sm:p-8">
              <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((j) => (
                    <Skeleton key={j} className="h-4" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Payments Loading Skeleton
 * Specific skeleton for payments tab
 */
export function PaymentsLoadingSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>

      {/* Chart */}
      <ChartSkeleton height="h-80" />

      {/* Info Box */}
      <Skeleton className="h-20" />

      {/* History Table */}
      <TableSkeleton rows={4} />
    </div>
  );
}

/**
 * Rebate Loading Skeleton
 * Specific skeleton for rebate tab
 */
export function RebateLoadingSkeleton() {
  return (
    <div className="w-full space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <KPICardSkeleton key={i} />
        ))}
      </div>

      {/* Chart */}
      <ChartSkeleton height="h-[300px]" />

      {/* History Table */}
      <TableSkeleton rows={10} />
    </div>
  );
}
