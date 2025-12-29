/**
 * Loading state for the Configuración page
 *
 * This component displays a skeleton loading UI while the configuración page
 * is being loaded, providing visual feedback to users.
 */

import { Card, CardContent } from "@/components/ui/card";

export default function ConfiguracionLoading() {
  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-white/10">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-10 w-32 bg-gray-200 dark:bg-white/10 rounded-t animate-pulse"
          />
        ))}
      </div>

      {/* Content Card Skeleton */}
      <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
        <CardContent className="p-6 space-y-6">
          {/* Form Fields Skeleton */}
          <div className="space-y-6">
            {/* Field 1 */}
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>

            {/* Field 2 */}
            <div className="space-y-2">
              <div className="h-4 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>

            {/* Field 3 */}
            <div className="space-y-2">
              <div className="h-4 w-36 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-24 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>

            {/* Field 4 */}
            <div className="space-y-2">
              <div className="h-4 w-28 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>

            {/* Field 5 */}
            <div className="space-y-2">
              <div className="h-4 w-44 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-10 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
          </div>

          {/* Image Upload Skeleton */}
          <div className="space-y-3">
            <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Action Buttons Skeleton */}
          <div className="flex justify-end gap-3 pt-4">
            <div className="h-10 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
