/**
 * Loading state for the Soporte page
 *
 * This component displays a skeleton loading UI while the soporte page
 * is being loaded, providing visual feedback to users.
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SoporteLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div>
        <div className="h-8 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        <div className="h-4 w-96 max-w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse mt-2" />
      </div>

      {/* Contact Buttons Skeleton */}
      <div className="grid sm:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start gap-4">
                {/* Icon Skeleton */}
                <div className="p-3 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse">
                  <div className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-12 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* FAQ Section Skeleton */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            {/* Icon Skeleton */}
            <div className="p-3 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse">
              <div className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-8 w-full bg-gray-200 dark:bg-white/10 rounded-md animate-pulse"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
