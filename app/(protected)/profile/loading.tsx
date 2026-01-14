/**
 * Loading state for the Profile page
 *
 * This component displays a skeleton loading UI while the profile page
 * is being loaded, providing visual feedback to users.
 */

export default function ProfileLoading() {
  return (
    <div className="space-y-6 sm:space-y-10 overflow-x-hidden py-4 sm:py-8 px-0 pb-20 sm:pb-16">
      {/* Profile Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
        <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
          {/* Avatar Skeleton */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse flex-shrink-0" />

          {/* Name and Email Skeleton */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-8 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            <div className="h-5 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* User Data Section Skeleton */}
      <div className="space-y-4 sm:space-y-5">
        <div className="h-6 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px]"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="h-5 w-5 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-4 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connected Accounts Section Skeleton */}
      <div className="space-y-4 sm:space-y-5">
        <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px]"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="h-5 w-5 rounded-full bg-gray-200 dark:bg-white/10 animate-pulse" />
                <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Section Skeleton */}
      <div className="space-y-4 sm:space-y-5">
        <div className="h-6 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px]">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-5 w-5 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-4 w-40 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Active Devices Skeleton */}
      <div className="space-y-4 sm:space-y-5 pt-4 sm:pt-6">
        <div className="h-6 w-48 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px]">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-5 w-5 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-56 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone Skeleton */}
      <div className="space-y-4 sm:space-y-5">
        <div className="h-6 w-40 bg-red-500/20 rounded animate-pulse" />
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px]">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-5 w-5 bg-red-500/20 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
