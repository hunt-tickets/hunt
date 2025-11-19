"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Home,
  Receipt,
} from "lucide-react";
import Link from "next/link";

interface Transaction {
  id: string;
  payment_status: "approved" | "rejected" | "pending" | "failed";
  amount: number;
  currency: string;
  created_at: string;
  customer_email?: string;
}

interface PaymentConfirmContentProps {
  transaction?: Transaction;
  urlStatus?: string;
  error?: string;
  orderId?: string;
}

/**
 * Get status display information based on verified payment status
 */
function getStatusInfo(status: string) {
  switch (status.toLowerCase()) {
    case "approved":
      return {
        icon: CheckCircle2,
        color: "text-green-600",
        bgColor: "bg-green-50 dark:bg-green-950",
        title: "Pago Aprobado",
        description: "Tu pago ha sido procesado exitosamente.",
        variant: "default" as const,
      };
    case "rejected":
    case "failed":
      return {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-50 dark:bg-red-950",
        title: "Pago Rechazado",
        description: "Tu pago no pudo ser procesado.",
        variant: "destructive" as const,
      };
    case "pending":
      return {
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-50 dark:bg-yellow-950",
        title: "Pago Pendiente",
        description: "Tu pago está siendo procesado.",
        variant: "secondary" as const,
      };
    default:
      return {
        icon: AlertCircle,
        color: "text-gray-600",
        bgColor: "bg-gray-50 dark:bg-gray-950",
        title: "Estado Desconocido",
        description: "No se pudo determinar el estado del pago.",
        variant: "secondary" as const,
      };
  }
}

export function PaymentConfirmContent({
  transaction,
  urlStatus,
  error,
  orderId,
}: PaymentConfirmContentProps) {
  // Error state
  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-red-50 dark:bg-red-950">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Error de Verificación</CardTitle>
          </div>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderId && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">ID de Orden:</span>{" "}
              <span className="font-mono">{orderId}</span>
            </div>
          )}
          <Button asChild className="w-full">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Success state with verified transaction
  if (!transaction) {
    return null;
  }

  const statusInfo = getStatusInfo(transaction.payment_status);
  const StatusIcon = statusInfo.icon;

  // Format amount
  const formattedAmount = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: transaction.currency || "COP",
  }).format(transaction.amount);

  // Format date
  const formattedDate = new Date(transaction.created_at).toLocaleString(
    "es-CO",
    {
      dateStyle: "long",
      timeStyle: "short",
    }
  );

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-full ${statusInfo.bgColor}`}>
            <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
          </div>
          <CardTitle>{statusInfo.title}</CardTitle>
        </div>
        <CardDescription>{statusInfo.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Transaction Details */}
        <div className="space-y-3 p-4 rounded-lg bg-muted/50">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Monto</span>
            <span className="font-semibold text-lg">{formattedAmount}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              ID de Transacción
            </span>
            <span className="font-mono text-sm">{transaction.id}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Estado</span>
            <Badge variant={statusInfo.variant}>
              {transaction.payment_status.toUpperCase()}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Fecha</span>
            <span className="text-sm">{formattedDate}</span>
          </div>
        </div>

        {/* Important notice for pending payments */}
        {transaction.payment_status === "pending" && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              El estado final de tu pago puede tardar unos minutos en
              confirmarse. Recibirás una notificación cuando se complete.
            </AlertDescription>
          </Alert>
        )}

        {/* Debug info: Show if URL status differs from API status */}
        {urlStatus &&
          urlStatus.toLowerCase() !==
            transaction.payment_status.toLowerCase() && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Nota: El estado mostrado en Bold ({urlStatus}) difiere del
                estado verificado ({transaction.payment_status}
                ). Mostramos el estado verificado desde nuestra API.
              </AlertDescription>
            </Alert>
          )}

        {/* Action buttons */}
        <div className="flex gap-2 pt-2">
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Inicio
            </Link>
          </Button>
          <Button asChild className="flex-1">
            <Link href="/orders">
              <Receipt className="mr-2 h-4 w-4" />
              Mis Órdenes
            </Link>
          </Button>
        </div>

        {/* Next steps for approved payments */}
        {transaction.payment_status === "approved" && (
          <div className="pt-4 border-t">
            <h4 className="font-semibold mb-2 text-sm">Próximos pasos:</h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Recibirás un correo de confirmación</li>
              <li>Puedes ver tu orden en &ldquo;Mis Órdenes&rdquo;</li>
              <li>El producto será enviado pronto</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
