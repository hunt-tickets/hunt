/**
 * Loading state for the Cash Sale (Vender) page
 */

import { Card, CardContent } from "@/components/ui/card";

export default function VenderLoading() {
  return (
    <div className="py-3 sm:py-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Ticket Selection */}
        <div className="space-y-6">
          {/* Day Selector (for multi-day events) */}
          <div className="space-y-3">
            <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 w-32 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse flex-shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Customer Email Input */}
          <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-12 w-full bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>
            </CardContent>
          </Card>

          {/* Ticket Cards */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    {/* Left side - Ticket info */}
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                      <div className="h-3 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    </div>

                    {/* Right side - Quantity controls */}
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
                      <div className="h-10 w-12 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
                      <div className="h-10 w-10 bg-gray-200 dark:bg-white/10 rounded-lg animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Column - Instructions & Summary */}
        <div className="space-y-6">
          {/* Instructions Card */}
          <Card className="border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a]">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-5 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-4 w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary Card */}
          <Card className="border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] sticky top-4">
            <CardContent className="p-6 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-[#2a2a2a]">
                <div className="h-5 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 dark:bg-white/10 rounded-full animate-pulse" />
              </div>

              {/* Items list */}
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div key={i} className="flex justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                      <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 dark:border-[#2a2a2a] pt-4 space-y-3">
                <div className="flex justify-between">
                  <div className="h-4 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-[#2a2a2a]">
                <div className="h-6 w-20 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-7 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              </div>

              {/* Complete Sale Button */}
              <div className="pt-4">
                <div className="h-12 w-full bg-gray-200 dark:bg-white/10 rounded-xl animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
