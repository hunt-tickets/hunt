"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface RefundOrder {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  platform: "web" | "app" | "cash";
  paymentId: string | null;
  refundStatus: "pending" | "processing" | "completed" | "failed";
  refundId?: string | null;
}

interface CancellationData {
  cancelledBy: string | null;
  cancellationReason: string | null;
  cancellationInitiatedAt: string | null;
  totalOrdersToRefund: number;
  totalAmountToRefund: number;
  orders: RefundOrder[];
}

interface RefundManagementTabProps {
  eventId: string;
  cancellationData: CancellationData;
}

export function RefundManagementTab({
  eventId,
  cancellationData,
}: RefundManagementTabProps) {
  const router = useRouter();
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(
    new Set()
  );

  const handleProcessRefund = async (order: RefundOrder) => {
    if (order.platform === "cash") {
      // For cash orders, just mark as completed
      handleMarkAsRefunded(order);
      return;
    }

    setProcessingOrders((prev) => new Set(prev).add(order.orderId));

    try {
      const response = await fetch(`/api/events/${eventId}/refunds`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: order.orderId,
          platform: order.platform,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process refund");
      }

      toast.success(`Reembolso procesado para ${order.customerName}`);
      router.refresh();
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Error al procesar el reembolso");
    } finally {
      setProcessingOrders((prev) => {
        const next = new Set(prev);
        next.delete(order.orderId);
        return next;
      });
    }
  };

  const handleMarkAsRefunded = async (order: RefundOrder) => {
    setProcessingOrders((prev) => new Set(prev).add(order.orderId));

    try {
      const response = await fetch(`/api/events/${eventId}/refunds/mark-completed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as refunded");
      }

      toast.success(`Reembolso marcado como completado para ${order.customerName}`);
      router.refresh();
    } catch (error) {
      console.error("Error marking as refunded:", error);
      toast.error("Error al marcar como reembolsado");
    } finally {
      setProcessingOrders((prev) => {
        const next = new Set(prev);
        next.delete(order.orderId);
        return next;
      });
    }
  };

  const pendingOrders = cancellationData.orders.filter(
    (o) => o.refundStatus === "pending"
  );
  const completedOrders = cancellationData.orders.filter(
    (o) => o.refundStatus === "completed"
  );
  const failedOrders = cancellationData.orders.filter(
    (o) => o.refundStatus === "failed"
  );

  const getStatusBadge = (status: RefundOrder["refundStatus"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <Clock className="h-3 w-3 mr-1 animate-spin" />
            Procesando
          </Badge>
        );
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completado
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Fallido
          </Badge>
        );
    }
  };

  const getPlatformBadge = (platform: RefundOrder["platform"]) => {
    switch (platform) {
      case "web":
        return <Badge variant="secondary">Web</Badge>;
      case "app":
        return <Badge variant="secondary">App</Badge>;
      case "cash":
        return (
          <Badge variant="secondary" className="bg-green-500/10 text-green-700 border-green-500/20">
            <DollarSign className="h-3 w-3 mr-1" />
            Efectivo
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-200">
              Evento en Proceso de Cancelación
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Este evento está siendo cancelado. Se requiere procesar{" "}
              <strong>{pendingOrders.length}</strong> reembolsos antes de completar la cancelación.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-amber-700 dark:text-amber-400 mt-3">
              {cancellationData.cancellationInitiatedAt && (
                <div>
                  <span className="font-medium">Fecha:</span>{" "}
                  {new Date(cancellationData.cancellationInitiatedAt).toLocaleString("es-CO")}
                </div>
              )}
              {cancellationData.cancellationReason && (
                <div>
                  <span className="font-medium">Razón:</span> {cancellationData.cancellationReason}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <DollarSign className="h-4 w-4" />
            Total a Reembolsar
          </div>
          <div className="text-2xl font-bold">
            ${cancellationData.totalAmountToRefund.toLocaleString("es-CO")}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Clock className="h-4 w-4" />
            Pendientes
          </div>
          <div className="text-2xl font-bold text-yellow-600">
            {pendingOrders.length}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <CheckCircle className="h-4 w-4" />
            Completados
          </div>
          <div className="text-2xl font-bold text-green-600">
            {completedOrders.length}
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <XCircle className="h-4 w-4" />
            Fallidos
          </div>
          <div className="text-2xl font-bold text-red-600">
            {failedOrders.length}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-lg border bg-card">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Órdenes a Reembolsar</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {cancellationData.totalOrdersToRefund} órdenes requieren reembolso
          </p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Orden</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Plataforma</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cancellationData.orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No hay órdenes para reembolsar
                  </TableCell>
                </TableRow>
              ) : (
                cancellationData.orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-mono text-sm">
                      {order.orderId.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.customerName}</span>
                        <span className="text-sm text-muted-foreground">
                          {order.customerEmail}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ${order.amount.toLocaleString("es-CO")}
                    </TableCell>
                    <TableCell>{getPlatformBadge(order.platform)}</TableCell>
                    <TableCell>{getStatusBadge(order.refundStatus)}</TableCell>
                    <TableCell className="text-right">
                      {order.refundStatus === "pending" && (
                        <Button
                          size="sm"
                          variant={order.platform === "cash" ? "outline" : "default"}
                          onClick={() => handleProcessRefund(order)}
                          disabled={processingOrders.has(order.orderId)}
                        >
                          {processingOrders.has(order.orderId)
                            ? "Procesando..."
                            : order.platform === "cash"
                              ? "Marcar Reembolsado"
                              : "Procesar Reembolso"}
                        </Button>
                      )}
                      {order.refundStatus === "failed" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleProcessRefund(order)}
                          disabled={processingOrders.has(order.orderId)}
                        >
                          Reintentar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
