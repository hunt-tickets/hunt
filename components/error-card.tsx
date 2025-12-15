/**
 * Reusable ErrorCard component
 *
 * This component displays user-friendly error messages with optional
 * retry functionality. It can be used throughout the application
 * for consistent error handling UI.
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ErrorCardProps {
  /**
   * The error title to display
   * @default "Error al cargar los datos"
   */
  title?: string;

  /**
   * The error message/description to display
   * @default "Ocurrió un error inesperado. Por favor, intenta nuevamente."
   */
  message?: string;

  /**
   * Optional retry callback function
   * If provided, a "Reintentar" button will be shown
   */
  onRetry?: () => void;

  /**
   * Optional custom button text
   * @default "Reintentar"
   */
  retryButtonText?: string;

  /**
   * Whether to show the retry button
   * @default true (if onRetry is provided)
   */
  showRetryButton?: boolean;

  /**
   * Optional className for additional styling
   */
  className?: string;
}

export function ErrorCard({
  title = "Error al cargar los datos",
  message = "Ocurrió un error inesperado. Por favor, intenta nuevamente.",
  onRetry,
  retryButtonText = "Reintentar",
  showRetryButton = true,
  className = "",
}: ErrorCardProps) {
  return (
    <Card
      className={`bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 ${className}`}
    >
      <CardContent className="p-8">
        <div className="text-center space-y-4">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 dark:bg-red-500/10 p-3">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Error Text */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-white/60 max-w-md mx-auto">
              {message}
            </p>
          </div>

          {/* Retry Button */}
          {onRetry && showRetryButton && (
            <Button
              onClick={onRetry}
              variant="outline"
              className="border-gray-300 dark:border-white/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryButtonText}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Inline error state component (smaller, for use within other components)
 */
export function InlineError({
  message = "Error al cargar",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-sm text-gray-600 dark:text-white/60">{message}</p>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reintentar
          </Button>
        )}
      </div>
    </div>
  );
}
