/**
 * Reusable Empty State component
 *
 * This component displays user-friendly empty states when there's no data
 * to show, with optional call-to-action buttons.
 */

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  /**
   * Icon component to display
   */
  icon: LucideIcon;

  /**
   * Title/heading for the empty state
   */
  title: string;

  /**
   * Description text explaining the empty state
   */
  description: string;

  /**
   * Optional call-to-action button
   */
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost";
  };

  /**
   * Optional className for additional styling
   */
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex justify-center mb-4">
        <div className="rounded-full bg-gray-100 dark:bg-white/5 p-4">
          <Icon className="h-12 w-12 text-gray-400 dark:text-white/40" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-white/60 max-w-md mx-auto mb-6">
        {description}
      </p>
      {action && (
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          className={
            action.variant === "default"
              ? "bg-black dark:bg-white text-white dark:text-gray-900 hover:bg-black/90 dark:hover:bg-white/90"
              : ""
          }
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

/**
 * Compact empty state (for smaller spaces)
 */
export function CompactEmptyState({
  icon: Icon,
  message,
}: {
  icon: LucideIcon;
  message: string;
}) {
  return (
    <div className="text-center py-8">
      <Icon className="h-8 w-8 text-gray-300 dark:text-white/20 mx-auto mb-3" />
      <p className="text-sm text-gray-500 dark:text-white/40">{message}</p>
    </div>
  );
}
