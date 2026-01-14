/**
 * Loading state for the Organizaciones page
 *
 * This component displays a skeleton loading UI while the organizaciones page
 * is being loaded, providing visual feedback to users.
 */

export default function OrganizacionesLoading() {
  return (
    <div className="space-y-4 sm:space-y-6 overflow-x-hidden">
      {/* Page Header Skeleton */}
      <div className="space-y-4">
        <div className="flex flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <div className="h-8 w-56 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-72 bg-gray-200 dark:bg-white/10 rounded animate-pulse mt-2" />
          </div>
          {/* Button Skeleton */}
          <div className="h-10 w-10 sm:w-48 bg-gray-200 dark:bg-white/10 rounded-full sm:rounded-xl animate-pulse" />
        </div>
      </div>

      {/* Organizations Grid Skeleton */}
      <div className="grid gap-3 grid-cols-1 lg:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]"
          >
            {/* Avatar Skeleton */}
            <div className="h-14 w-14 rounded-xl bg-gray-200 dark:bg-white/10 animate-pulse flex-shrink-0" />

            {/* Text Skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-5 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
