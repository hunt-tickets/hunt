/**
 * Loading state for the Entradas page
 *
 * This component displays a skeleton loading UI while the entradas page
 * is being loaded, providing visual feedback to users.
 */

import { Card, CardContent } from "@/components/ui/card";

export default function EntradasLoading() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 dark:bg-white/10 rounded animate-pulse mt-2" />
      </div>

      {/* Empty State or Content Skeleton */}
      <Card className="border-gray-200 dark:border-[#2a2a2a] rounded-2xl">
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            {/* Icon Circle Skeleton */}
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />

            {/* Text Skeletons */}
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse mx-auto" />
              <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
