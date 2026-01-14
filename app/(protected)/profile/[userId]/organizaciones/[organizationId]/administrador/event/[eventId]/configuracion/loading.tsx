/**
 * Loading state for the Event Configuration page
 *
 * This component displays a skeleton loading UI while the event configuration page
 * is being loaded, providing visual feedback to users.
 */

import { Card, CardContent } from "@/components/ui/card";

export default function EventConfigurationLoading() {
  return (
    <>
      {/* Sticky Header Skeleton */}
      <div className="sticky top-0 z-10 bg-white dark:bg-black border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-10 w-32 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="py-3 sm:py-4">
        <div className="space-y-6">
          {/* Información Básica Card */}
          <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
            <div className="p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div>
                  <div className="h-5 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-2" />
                  <div className="h-3 w-56 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-5">
              {/* Field 1 */}
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>

              {/* Field 2 */}
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-32 w-full bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>

              {/* Field 3 */}
              <div className="space-y-2">
                <div className="h-4 w-28 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>

              {/* Field 4 */}
              <div className="space-y-2">
                <div className="h-4 w-36 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>

              {/* Field 5 - Switch */}
              <div className="space-y-2">
                <div className="h-12 w-full bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>
            </CardContent>
          </Card>

          {/* Ubicación Card */}
          <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
            <div className="p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div>
                  <div className="h-5 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-2" />
                  <div className="h-3 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="h-12 w-full bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Fechas Card */}
          <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
            <div className="p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div>
                  <div className="h-5 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-2" />
                  <div className="h-3 w-52 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>
            </CardContent>
          </Card>

          {/* Configuración Regional Card */}
          <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
            <div className="p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div>
                  <div className="h-5 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-2" />
                  <div className="h-3 w-44 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-5">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>
            </CardContent>
          </Card>

          {/* Flyer Card */}
          <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
            <div className="p-6 border-b border-gray-200 dark:border-[#2a2a2a]">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div>
                  <div className="h-5 w-36 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-2" />
                  <div className="h-3 w-64 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
            <CardContent className="p-6 space-y-3">
              <div className="h-3 w-full max-w-xs bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="aspect-[3/4] max-w-xs bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <div className="h-12 w-40 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </>
  );
}
