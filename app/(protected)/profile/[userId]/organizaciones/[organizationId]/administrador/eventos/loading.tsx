/**
 * Loading state for the Eventos page
 *
 * This component displays a skeleton loading UI while the eventos page
 * is being loaded, providing visual feedback to users.
 */

import { Card, CardContent } from "@/components/ui/card";

export default function EventosLoading() {
  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Search Bar and Button Skeleton */}
      <div className="flex flex-row gap-3">
        <div className="flex-1">
          <div className="h-12 w-full bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
        </div>
        <div className="flex items-center">
          <div className="h-12 w-32 sm:w-40 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Events Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Card
            key={i}
            className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 overflow-hidden"
          >
            {/* Event Image Skeleton */}
            <div className="relative h-48 bg-gray-200 dark:bg-white/10 animate-pulse" />

            <CardContent className="p-4 space-y-3">
              {/* Event Title */}
              <div className="h-6 w-3/4 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />

              {/* Event Date and Location */}
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              </div>

              {/* Event Stats */}
              <div className="flex gap-2 pt-2">
                <div className="h-8 w-20 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
              </div>

              {/* Action Button */}
              <div className="h-10 w-full bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
