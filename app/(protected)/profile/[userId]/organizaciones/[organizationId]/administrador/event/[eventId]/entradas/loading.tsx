/**
 * Loading state for the Tickets (Entradas) page
 */

import { Card, CardContent } from "@/components/ui/card";

export default function EntradasLoading() {
  return (
    <div className="py-3 sm:py-4">
      <div className="space-y-4">
        {/* Header with title and buttons */}
        <div className="flex items-center justify-between mb-4">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-32 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
            <div className="h-9 w-20 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-9 w-24 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse"
            />
          ))}
        </div>

        {/* Ticket cards grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card
              key={i}
              className="border-gray-200 dark:border-white/5 bg-white dark:bg-white/[0.02]"
            >
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="h-5 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-10 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                    <div className="h-6 w-6 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>
                </div>

                {/* Analytics section */}
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/[0.03] space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                      <div className="h-8 w-12 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    </div>
                    <div className="space-y-2 text-right">
                      <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse ml-auto" />
                      <div className="h-7 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse ml-auto" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 dark:border-white/5">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="text-center space-y-1">
                        <div className="h-3 w-8 bg-gray-200 dark:bg-white/10 rounded animate-pulse mx-auto" />
                        <div className="h-4 w-6 bg-gray-200 dark:bg-white/10 rounded animate-pulse mx-auto" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price section */}
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/[0.03] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="h-3 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                      <div className="h-6 w-28 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    </div>
                    <div className="h-5 w-16 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-12 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-white/5 rounded-full animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
