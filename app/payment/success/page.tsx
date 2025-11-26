import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

interface SuccessPageProps {
  searchParams: Promise<{
    payment_id?: string;
    status?: string;
    external_reference?: string;
    preference_id?: string;
  }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { payment_id, external_reference } = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-green-50 dark:bg-green-950/30 border-2 border-green-200 dark:border-green-800 rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-muted-foreground mb-6">
            Tu pago ha sido procesado correctamente. ¡Gracias por tu compra!
          </p>

          <div className="bg-background rounded-lg p-4 mb-6 text-left border">
            <h2 className="text-sm font-semibold text-muted-foreground mb-3">
              Detalles del pago
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

          <div className="text-sm text-muted-foreground mb-6">
            <p>Recibirás un correo con tus tickets.</p>
            <p className="mt-2">¡Nos vemos en el evento!</p>
          </div>

          <Link
            href={userId ? `/profile/${userId}/entradas` : "/"}
            className="block w-full bg-primary text-primary-foreground py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Ver mis entradas
          </Link>
        </div>
      </div>
    </div>
  );
}
