/**
 * Loading state for the Access Control page
 *
 * This component displays a skeleton loading UI while the access control page
 * is being loaded, providing visual feedback to users.
 */

import { Card, CardContent } from "@/components/ui/card";

export default function AccessControlLoading() {
  return (
    <div className="py-3 sm:py-4">
      <div className="space-y-4">
        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01]"
            >
              <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-1" />
              <div className="h-6 sm:h-8 w-12 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main Content Card Skeleton */}
        <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 min-h-[60vh]">
          <CardContent className="p-6">
            {/* Empty State Skeleton */}
            <div className="text-center py-16 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse mx-auto" />
                <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ticket Breakdown Card Skeleton */}
        <Card className="hidden md:block bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-5 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 pb-3 border-b border-gray-200 dark:border-white/5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-3 bg-gray-200 dark:bg-white/10 rounded animate-pulse"
                  />
                ))}
              </div>

              {/* Table Rows */}
              {[1, 2, 3].map((row) => (
                <div
                  key={row}
                  className="grid grid-cols-6 gap-4 py-3 border-b border-gray-200 dark:border-white/5"
                >
                  {[1, 2, 3, 4, 5, 6].map((col) => (
                    <div
                      key={col}
                      className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse"
                    />
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Cards Skeleton */}
        <div className="md:hidden space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-4 rounded-xl bg-gray-100 dark:bg-gradient-to-br dark:from-white/[0.07] dark:to-white/[0.02] border border-gray-200 dark:border-white/10"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    <div className="h-4 w-14 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-2 w-full bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
