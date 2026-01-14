/**
 * Loading state for the Access Control page
 */

import { Card, CardContent } from "@/components/ui/card";

export default function AccessControlLoading() {
  return (
    <div className="py-3 sm:py-4">
      <div className="space-y-4">
        {/* KPI Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-3 sm:p-4 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.01]"
            >
              <div className="h-3 w-16 bg-gray-200 dark:bg-white/10 rounded animate-pulse mb-1" />
              <div className="h-6 sm:h-8 w-12 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
          ))}
        </div>

        {/* Main Content */}
        <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 min-h-[60vh]">
          <CardContent className="p-6">
            <div className="text-center py-16 space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-white/5 animate-pulse" />
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse mx-auto" />
                <div className="h-4 w-80 max-w-full bg-gray-200 dark:bg-white/10 rounded animate-pulse mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
