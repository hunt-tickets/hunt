import { Clock, RefreshCw } from "lucide-react";
import Link from "next/link";

interface PendingPageProps {
  searchParams: Promise<{
    payment_id?: string;
    status?: string;
    external_reference?: string;
  }>;
}

export default async function PendingPage({ searchParams }: PendingPageProps) {
  const { payment_id, external_reference } = await searchParams;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-yellow-50 dark:bg-yellow-950/30 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Clock className="h-16 w-16 text-yellow-600" />
              <RefreshCw className="h-6 w-6 text-yellow-600 absolute -bottom-1 -right-1 animate-spin" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Pago Pendiente
          </h1>
          <p className="text-muted-foreground mb-6">
            Tu pago está siendo procesado. Esto puede tomar unos momentos.
          </p>

          <div className="bg-background rounded-lg p-4 mb-6 text-left border">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              Detalles
            </h2>

            <div className="space-y-2 text-sm">
              {payment_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID de pago:</span>
                  <span className="font-mono text-xs text-foreground">
                    {payment_id}
                  </span>
                </div>
              )}

              {external_reference && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Referencia:</span>
                  <span className="font-mono text-xs text-foreground">
                    {external_reference}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 text-sm text-yellow-900 dark:text-yellow-100">
              <p className="font-medium mb-2">¿Qué sucede ahora?</p>
              <ul className="text-left space-y-1 pl-4">
                <li>• Tu pago está siendo verificado</li>
                <li>• Recibirás una confirmación pronto</li>
                <li>• No es necesario realizar otro pago</li>
              </ul>
            </div>

            <div className="text-sm text-muted-foreground">
              <p className="mb-2">Razones comunes del estado pendiente:</p>
              <ul className="text-left space-y-1 pl-4">
                <li>• El banco está verificando la transacción</li>
                <li>• Se requiere autenticación adicional</li>
                <li>• Demora en el procesamiento (suele resolverse en minutos)</li>
              </ul>
            </div>

            <Link
              href="/"
              className="block w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors font-medium mt-6"
            >
              Volver al inicio
            </Link>

            <div className="pt-4 border-t border-yellow-200 dark:border-yellow-800">
              <p className="text-sm text-muted-foreground">
                Por favor guarda este número de referencia. Si no recibes
                confirmación en 10 minutos, contacta a soporte.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
