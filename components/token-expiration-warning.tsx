"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface TokenExpirationWarningProps {
  accountId: string;
  processorName: string;
  tokenExpiresAt: Date | null;
  hasRefreshToken: boolean;
}

/**
 * Client component that displays a warning when a MercadoPago token is expiring soon
 * and provides a button to refresh it.
 */
export function TokenExpirationWarning({
  accountId,
  processorName,
  tokenExpiresAt,
  hasRefreshToken,
}: TokenExpirationWarningProps) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate days until expiration
  const getDaysUntilExpiry = () => {
    if (!tokenExpiresAt) return null;
    const now = new Date();
    const expiry = new Date(tokenExpiresAt);
    const days = Math.floor(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const daysUntilExpiry = getDaysUntilExpiry();

  // Don't show warning if more than 30 days until expiration
  if (daysUntilExpiry === null || daysUntilExpiry > 30) {
    return null;
  }

  // Determine warning level
  const isUrgent = daysUntilExpiry <= 7;
  const isCritical = daysUntilExpiry <= 0;

  const handleRefreshToken = async () => {
    if (!hasRefreshToken) {
      toast.error("No se puede renovar el token", {
        description: "Por favor, vuelve a conectar tu cuenta de MercadoPago",
      });
      return;
    }

    setIsRefreshing(true);

    try {
      const response = await fetch("/api/mercadopago/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ accountId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al renovar el token");
      }

      toast.success("Token renovado exitosamente", {
        description: `Tu token de ${processorName} ha sido renovado`,
        icon: <CheckCircle2 className="h-4 w-4" />,
      });

      // Refresh the page to show updated expiration date
      router.refresh();
    } catch (error) {
      console.error("Error refreshing token:", error);
      toast.error("Error al renovar el token", {
        description:
          error instanceof Error
            ? error.message
            : "Por favor, intenta de nuevo o vuelve a conectar tu cuenta",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Alert
      className={`mt-3 ${
        isCritical
          ? "border-red-500 bg-red-50 dark:bg-red-900/10"
          : isUrgent
            ? "border-orange-500 bg-orange-50 dark:bg-orange-900/10"
            : "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10"
      }`}
    >
      <AlertTriangle
        className={`h-4 w-4 ${
          isCritical
            ? "text-red-600 dark:text-red-400"
            : isUrgent
              ? "text-orange-600 dark:text-orange-400"
              : "text-yellow-600 dark:text-yellow-400"
        }`}
      />
      <AlertDescription className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p
            className={`text-sm font-medium ${
              isCritical
                ? "text-red-900 dark:text-red-100"
                : isUrgent
                  ? "text-orange-900 dark:text-orange-100"
                  : "text-yellow-900 dark:text-yellow-100"
            }`}
          >
            {isCritical
              ? "⚠️ Token expirado"
              : isUrgent
                ? "Token por expirar pronto"
                : "Token expira pronto"}
          </p>
          <p
            className={`text-xs mt-1 ${
              isCritical
                ? "text-red-700 dark:text-red-200"
                : isUrgent
                  ? "text-orange-700 dark:text-orange-200"
                  : "text-yellow-700 dark:text-yellow-200"
            }`}
          >
            {isCritical
              ? "Tu token ha expirado. Renuévalo ahora para seguir aceptando pagos."
              : daysUntilExpiry === 1
                ? "Tu token expira mañana."
                : `Tu token expira en ${daysUntilExpiry} días.`}{" "}
            {hasRefreshToken
              ? "Haz clic en renovar para extender la validez por 180 días más."
              : "Por favor, vuelve a conectar tu cuenta."}
          </p>
        </div>
        {hasRefreshToken && (
          <Button
            size="sm"
            onClick={handleRefreshToken}
            disabled={isRefreshing}
            className={`flex-shrink-0 ${
              isCritical
                ? "bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700"
                : isUrgent
                  ? "bg-orange-600 hover:bg-orange-700 text-white dark:bg-orange-600 dark:hover:bg-orange-700"
                  : "bg-yellow-600 hover:bg-yellow-700 text-white dark:bg-yellow-600 dark:hover:bg-yellow-700"
            }`}
          >
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Renovando...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Renovar
              </>
            )}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
