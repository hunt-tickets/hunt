"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  CreditCard,
  Smartphone,
  Banknote,
  Calendar,
  FileText,
  ArrowRight,
  Loader2,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
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

interface OrderWithRefund {
  id: string;
  userId: string;
  eventId: string;
  totalAmount: string;
  currency: string;
  paymentStatus: string;
  platform: string;
  createdAt: Date;
  paidAt: Date | null;
  user: {
    id: string;
    name: string;
    nombres: string | null;
    apellidos: string | null;
    email: string;
  };
  orderItems: Array<{
    id: string;
    ticketTypeId: string;
    quantity: number;
    pricePerTicket: string;
    subtotal: string;
  }>;
  refund?: {
    id: string;
    amount: string;
    status: string;
    requestedAt: Date;
    processedAt: Date | null;
    reason: string;
  } | null;
}

interface CancellationMetadata {
  cancelledBy: string | null;
  cancellationReason: string | null;
  cancellationInitiatedAt: string | null;
}

interface RefundManagementTabProps {
  eventId: string;
  orders: OrderWithRefund[];
  isInCancellationPending: boolean;
  cancellationMetadata?: CancellationMetadata | null;
}

export function RefundManagementTab({
  eventId,
  orders,
  isInCancellationPending,
  cancellationMetadata,
}: RefundManagementTabProps) {
  const router = useRouter();
  const [processingOrders, setProcessingOrders] = useState<Set<string>>(
    new Set()
  );

  // Build cancellationData from orders + metadata (client-side transformation)
  // This avoids sending duplicate order data from the RSC
  const cancellationData =
    isInCancellationPending && cancellationMetadata
      ? {
          ...cancellationMetadata,
          totalOrdersToRefund: orders.length,
          totalAmountToRefund: orders.reduce(
            (sum, order) => sum + parseFloat(order.totalAmount),
            0
          ),
          orders: orders.map((order) => ({
            orderId: order.id,
            orderDate: order.createdAt.toISOString(),
            customerName:
              order.user.nombres && order.user.apellidos
                ? `${order.user.nombres} ${order.user.apellidos}`
                : order.user.name,
            customerEmail: order.user.email,
            amount: parseFloat(order.totalAmount),
            platform: order.platform as "web" | "app" | "cash",
            paymentId: null,
            refundStatus:
              (order.refund?.status as
                | "pending"
                | "processing"
                | "completed"
                | "failed") || "pending",
            refundId: null,
          })),
        }
      : null;

  // Helper functions at top level
  const handleProcessRefund = async (order: RefundOrder) => {
    if (order.platform === "cash") {
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

      const data = await response.json();

      if (!response.ok) {
        // Show specific error from server
        const errorMessage =
          data.details || data.error || "Error al procesar el reembolso";
        toast.error(errorMessage);
        console.error("Refund error:", data);
        return;
      }

      toast.success(
        `Reembolso procesado exitosamente para ${order.customerName || "el cliente"}`
      );
      router.refresh();
    } catch (error) {
      console.error("Error processing refund:", error);
      toast.error("Error de conexión. Por favor intenta de nuevo.");
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
      const response = await fetch(
        `/api/events/${eventId}/refunds/mark-completed`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: order.orderId }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to mark as refunded");
      }

      toast.success(
        `Reembolso marcado como completado para ${order.customerName}`
      );
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

  const getStatusConfig = (status: RefundOrder["refundStatus"]) => {
    const configs = {
      pending: {
        label: "Pendiente",
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: Clock,
      },
      processing: {
        label: "Procesando",
        className: "bg-blue-50 text-blue-700 border-blue-200",
        icon: Loader2,
      },
      completed: {
        label: "Completado",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        icon: CheckCircle2,
      },
      failed: {
        label: "Fallido",
        className: "bg-red-50 text-red-700 border-red-200",
        icon: XCircle,
      },
    };
    return configs[status];
  };

  const getPlatformConfig = (platform: RefundOrder["platform"]) => {
    const configs = {
      web: { label: "Web", icon: CreditCard },
      app: { label: "App", icon: Smartphone },
      cash: { label: "Efectivo", icon: Banknote },
    };
    return configs[platform];
  };

  // Render cancellation flow
  function renderCancellationFlow() {
    if (!cancellationData) return null;

    const completedOrders = cancellationData.orders.filter(
      (o) => o.refundStatus === "completed"
    );
    const pendingOrders = cancellationData.orders.filter(
      (o) => o.refundStatus === "pending"
    );
    const failedOrders = cancellationData.orders.filter(
      (o) => o.refundStatus === "failed"
    );
    const totalOrders = cancellationData.orders.length;
    const progressPercentage =
      totalOrders > 0 ? (completedOrders.length / totalOrders) * 100 : 0;

    return (
      <div className="space-y-8">
        {/* Cancellation Status Header */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground mb-1">
                  Evento en Proceso de Cancelación
                </h2>
                <p className="text-muted-foreground text-sm text-pretty">
                  Estamos aquí para ayudarte. Procesa los reembolsos pendientes
                  para completar la cancelación del evento.
                </p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Progreso de reembolsos
                </span>
                <span className="font-medium text-foreground">
                  {completedOrders.length} de {totalOrders} completados
                </span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {cancellationData.cancellationInitiatedAt && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Fecha de cancelación
                    </p>
                    <p className="font-medium text-foreground">
                      {new Date(
                        cancellationData.cancellationInitiatedAt
                      ).toLocaleDateString("es-CO", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              )}
              {cancellationData.cancellationReason && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Motivo</p>
                    <p className="font-medium text-foreground">
                      {cancellationData.cancellationReason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-1">
              Total a Reembolsar
            </p>
            <p className="text-2xl font-semibold text-foreground">
              ${cancellationData.totalAmountToRefund.toLocaleString("es-CO")}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-1">Pendientes</p>
            <p className="text-2xl font-semibold text-amber-600">
              {pendingOrders.length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-1">Completados</p>
            <p className="text-2xl font-semibold text-emerald-600">
              {completedOrders.length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-1">Fallidos</p>
            <p className="text-2xl font-semibold text-red-600">
              {failedOrders.length}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h3 className="font-semibold text-foreground">
              Órdenes a Reembolsar
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {cancellationData.totalOrdersToRefund} órdenes requieren reembolso
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-medium">Cliente</TableHead>
                  <TableHead className="font-medium">ID de Orden</TableHead>
                  <TableHead className="font-medium">Monto</TableHead>
                  <TableHead className="font-medium">Método</TableHead>
                  <TableHead className="font-medium">Estado</TableHead>
                  <TableHead className="text-right font-medium">
                    Acción
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cancellationData.orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-12"
                    >
                      No hay órdenes para reembolsar
                    </TableCell>
                  </TableRow>
                ) : (
                  cancellationData.orders.map((order) => {
                    const statusConfig = getStatusConfig(order.refundStatus);
                    const platformConfig = getPlatformConfig(order.platform);
                    const StatusIcon = statusConfig.icon;
                    const PlatformIcon = platformConfig.icon;
                    const isProcessing = processingOrders.has(order.orderId);

                    return (
                      <TableRow key={order.orderId}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {order.customerName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.customerEmail}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {order.orderId.slice(0, 8)}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-foreground">
                            ${order.amount.toLocaleString("es-CO")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <PlatformIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {platformConfig.label}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${statusConfig.className} gap-1.5`}
                          >
                            <StatusIcon
                              className={`w-3 h-3 ${
                                order.refundStatus === "processing"
                                  ? "animate-spin"
                                  : ""
                              }`}
                            />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {order.refundStatus === "pending" && (
                            <Button
                              size="sm"
                              onClick={() => handleProcessRefund(order)}
                              disabled={isProcessing}
                              className="gap-2"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Procesando
                                </>
                              ) : order.platform === "cash" ? (
                                <>
                                  Marcar Completado
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                </>
                              ) : (
                                <>
                                  Reembolsar
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </Button>
                          )}
                          {order.refundStatus === "failed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleProcessRefund(order)}
                              disabled={isProcessing}
                              className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Reintentando
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  Reintentar
                                </>
                              )}
                            </Button>
                          )}
                          {order.refundStatus === "completed" && (
                            <span className="text-sm text-emerald-600 font-medium">
                              Completado
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  // Render normal refund view
  function renderNormalRefundView() {
    const totalOrders = orders.length;
    const activeOrders = orders.filter((o) => !o.refund);
    const completedRefunds = orders.filter(
      (o) => o.refund?.status === "completed"
    );
    const processingRefunds = orders.filter(
      (o) => o.refund?.status === "processing"
    );

    const handleRefundOrder = async (orderId: string) => {
      setProcessingOrders((prev) => new Set(prev).add(orderId));

      try {
        const response = await fetch(`/api/events/${eventId}/refunds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage =
            data.details || data.error || "Error al procesar el reembolso";
          toast.error(errorMessage);
          console.error("Refund error:", data);
          return;
        }

        toast.success("Reembolso procesado exitosamente");
        router.refresh();
      } catch (error) {
        console.error("Error processing refund:", error);
        toast.error("Error de conexión. Por favor intenta de nuevo.");
      } finally {
        setProcessingOrders((prev) => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
        });
      }
    };

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-1">
            Gestión de Reembolsos
          </h2>
          <p className="text-sm text-muted-foreground">
            Administra los reembolsos de las órdenes de este evento
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-1">Total Órdenes</p>
            <p className="text-2xl font-semibold text-foreground">
              {totalOrders}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-1">Activas</p>
            <p className="text-2xl font-semibold text-blue-600">
              {activeOrders.length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-1">Procesando</p>
            <p className="text-2xl font-semibold text-amber-600">
              {processingRefunds.length}
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground mb-1">Completadas</p>
            <p className="text-2xl font-semibold text-emerald-600">
              {completedRefunds.length}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-6 py-5 border-b border-border">
            <h3 className="font-semibold text-foreground">Todas las Órdenes</h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gestiona los reembolsos de las órdenes del evento
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-medium">Cliente</TableHead>
                  <TableHead className="font-medium">ID de Orden</TableHead>
                  <TableHead className="font-medium">Monto</TableHead>
                  <TableHead className="font-medium">Plataforma</TableHead>
                  <TableHead className="font-medium">Estado</TableHead>
                  <TableHead className="text-right font-medium">
                    Acción
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground py-12"
                    >
                      No hay órdenes disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => {
                    const isProcessing = processingOrders.has(order.id);
                    const customerName =
                      order.user.nombres && order.user.apellidos
                        ? `${order.user.nombres} ${order.user.apellidos}`
                        : order.user.name;

                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium text-foreground">
                              {customerName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.user.email}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {order.id.slice(0, 8)}
                          </code>
                        </TableCell>
                        <TableCell>
                          <span className="font-semibold text-foreground">
                            $
                            {parseFloat(order.totalAmount).toLocaleString(
                              "es-CO"
                            )}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {order.platform === "web" && (
                              <>
                                <CreditCard className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">Web</span>
                              </>
                            )}
                            {order.platform === "app" && (
                              <>
                                <Smartphone className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">App</span>
                              </>
                            )}
                            {order.platform === "cash" && (
                              <>
                                <Banknote className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">Efectivo</span>
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {order.refund ? (
                            order.refund.status === "completed" ? (
                              <Badge
                                variant="outline"
                                className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1.5"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Reembolsado
                              </Badge>
                            ) : order.refund.status === "processing" ? (
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-200 gap-1.5"
                              >
                                <Clock className="w-3 h-3" />
                                Procesando
                              </Badge>
                            ) : order.refund.status === "pending" ? (
                              <Badge
                                variant="outline"
                                className="bg-amber-50 text-amber-700 border-amber-200 gap-1.5"
                              >
                                <Clock className="w-3 h-3" />
                                Pendiente
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-red-50 text-red-700 border-red-200 gap-1.5"
                              >
                                <XCircle className="w-3 h-3" />
                                Fallido
                              </Badge>
                            )
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200 gap-1.5"
                            >
                              <CreditCard className="w-3 h-3" />
                              Pagada
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {order.refund ? (
                            order.refund.status === "completed" ? (
                              <div className="text-sm text-muted-foreground">
                                {order.refund.processedAt ? (
                                  <span>
                                    {new Date(
                                      order.refund.processedAt
                                    ).toLocaleDateString("es-CO", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                  </span>
                                ) : (
                                  <span>Completado</span>
                                )}
                              </div>
                            ) : order.refund.status === "processing" ? (
                              <div className="text-sm text-blue-600 text-right">
                                Procesando
                              </div>
                            ) : order.refund.status === "pending" ||
                              order.refund.status === "failed" ? (
                              <Button
                                size="sm"
                                variant={
                                  order.refund.status === "failed"
                                    ? "outline"
                                    : "default"
                                }
                                onClick={() => handleRefundOrder(order.id)}
                                disabled={isProcessing}
                                className="gap-2"
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Procesando
                                  </>
                                ) : (
                                  <>
                                    {order.refund.status === "failed" ? (
                                      <>
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Reintentar
                                      </>
                                    ) : (
                                      <>
                                        <ArrowRight className="w-3.5 h-3.5" />
                                        Procesar
                                      </>
                                    )}
                                  </>
                                )}
                              </Button>
                            ) : null
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleRefundOrder(order.id)}
                              disabled={isProcessing}
                              className="gap-2"
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  Procesando
                                </>
                              ) : (
                                <>
                                  Reembolsar
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    );
  }

  // Early return logic
  if (isInCancellationPending && cancellationData) {
    return renderCancellationFlow();
  }

  return renderNormalRefundView();
}
