/**
 * Loading state for the Referidos page
 *
 * This component displays a skeleton loading UI while the referidos page
 * is being loaded, providing visual feedback to users.
 */

import { Card, CardContent } from "@/components/ui/card";

export default function ReferidosLoading() {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-96 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-10 w-32 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse"
            />
          ))}
        </div>

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card
              key={i}
              className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5"
            >
              <CardContent className="p-4 sm:p-5">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="h-8 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-64 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>

        {/* Secondary Content Skeleton */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card
              key={i}
              className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5"
            >
              <CardContent className="p-4 sm:p-8">
                <div className="space-y-4">
                  <div className="h-6 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div
                        key={j}
                        className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
