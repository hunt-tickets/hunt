import { XCircle } from "lucide-react";
import Link from "next/link";

interface FailurePageProps {
  searchParams: Promise<{
    payment_id?: string;
    status?: string;
    external_reference?: string;
  }>;
}

export default async function FailurePage({ searchParams }: FailurePageProps) {
  const { payment_id } = await searchParams;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Pago Fallido
          </h1>
          <p className="text-muted-foreground mb-6">
            No se pudo procesar tu pago. No se ha realizado ningún cargo a tu
            cuenta.
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
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p>Razones comunes del fallo:</p>
              <ul className="mt-2 text-left space-y-1 pl-4">
                <li>• Fondos insuficientes</li>
                <li>• Tarjeta vencida o inválida</li>
                <li>• El banco rechazó la transacción</li>
                <li>• El pago fue cancelado</li>
              </ul>
            </div>

            <Link
              href="/"
              className="block w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors font-medium mt-6"
            >
              Volver al inicio
            </Link>

            <p className="text-sm text-muted-foreground mt-4">
              Si continúas experimentando problemas, por favor contacta a
              soporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
