/**
 * Loading state for the Integraciones page
 *
 * This component displays a skeleton loading UI while the integraciones page
 * is being loaded, providing visual feedback to users.
 */

import { Card, CardContent } from "@/components/ui/card";

export default function IntegracionesLoading() {
  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="relative flex-1 max-w-md">
        <div className="h-12 w-full bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
      </div>

      {/* Integrations Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card
            key={i}
            className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5"
          >
            <CardContent className="p-5 sm:p-6 flex flex-col h-full">
              <div className="flex flex-col items-center text-center space-y-4 flex-1">
                {/* Logo Skeleton */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-200 dark:bg-white/10 animate-pulse" />

                {/* Name Skeleton */}
                <div className="h-6 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />

                {/* Description Skeleton */}
                <div className="space-y-2 w-full">
                  <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-5/6 mx-auto bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="h-3 w-4/6 mx-auto bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                </div>

                {/* Button Skeleton */}
                <div className="h-10 sm:h-11 w-full bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
