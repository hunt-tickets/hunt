"use client";

/**
 * Error boundary for the Usuarios page
 *
 * This component catches and handles errors that occur in the usuarios page,
 * providing a user-friendly error UI with recovery options.
 */

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface UsuariosErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function UsuariosError({ error, reset }: UsuariosErrorProps) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Usuarios page error:", error);
  }, [error]);

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Error Icon */}
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 dark:bg-red-500/10 p-4">
                  <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* Error Message */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Algo salió mal
                </h2>
                <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed">
                  Lo sentimos, ocurrió un error inesperado al cargar la lista de usuarios.
                  Por favor, intenta nuevamente.
                </p>
              </div>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === "development" && (
                <div className="p-4 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                  <p className="text-xs font-mono text-left text-gray-700 dark:text-white/70 break-all">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-gray-500 dark:text-white/40 mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={reset}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-gray-900 hover:bg-black/90 dark:hover:bg-white/90"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Intentar de nuevo
                </Button>
                <Button
                  onClick={() => router.push("/")}
                  variant="outline"
                  className="flex-1 border-gray-300 dark:border-white/20"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir al inicio
                </Button>
              </div>

              {/* Help Text */}
              <p className="text-xs text-gray-500 dark:text-white/40">
                Si el problema persiste, por favor contacta a soporte técnico.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
