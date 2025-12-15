/**
 * Loading state for the Usuarios page
 *
 * This component displays a skeleton loading UI while the usuarios page
 * is being loaded, providing visual feedback to users.
 */

import { Card, CardContent } from "@/components/ui/card";

export default function UsuariosLoading() {
  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
          </div>
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

        {/* Search Bar Skeleton */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-12 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
          <div className="h-12 w-32 bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
        </div>

        {/* Table Skeleton */}
        <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 pb-3 border-b border-gray-200 dark:border-white/5">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 dark:bg-white/10 rounded animate-pulse"
                  />
                ))}
              </div>

              {/* Table Rows */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="grid grid-cols-4 gap-4 py-4">
                  {/* User column with avatar */}
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse" />
                    <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>

                  {/* Other columns */}
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="flex items-center"
                    >
                      <div className="h-4 w-full max-w-[200px] bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pagination Skeleton */}
        <div className="flex items-center justify-center gap-2 pt-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-8 w-8 bg-gray-200 dark:bg-white/10 rounded animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
