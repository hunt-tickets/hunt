"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  Ticket,
  Banknote,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";
import Image from "next/image";

interface EventStatsDialogProps {
  event: {
    id: string;
    name: string;
    flyer: string | null;
    date: string;
    status: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventStatsDialog({
  event,
  open,
  onOpenChange,
}: EventStatsDialogProps) {
  // Fake data for now
  const stats = {
    ventasTotales: 1250000,
    entradas: 325,
    ventasEfectivo: 450000,
    ingresosBrutos: 1250000,
    vendedores: [
      { id: "1", name: "Carlos Rodríguez", ventas: 450000, tickets: 120 },
      { id: "2", name: "María García", ventas: 380000, tickets: 95 },
      { id: "3", name: "Juan López", ventas: 290000, tickets: 75 },
      { id: "4", name: "Ana Martínez", ventas: 130000, tickets: 35 },
    ],
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] sm:max-w-2xl lg:max-w-4xl max-h-[85vh] overflow-y-auto p-5 sm:p-8">
        <DialogHeader className="space-y-4">
          <div className="flex items-start gap-4">
            {event.flyer && (
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={event.flyer}
                  alt={event.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 64px, 80px"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                <DialogTitle className="text-lg sm:text-2xl truncate">
                  {event.name}
                </DialogTitle>
                <Badge
                  variant={
                    event.status === "ACTIVO"
                      ? "default"
                      : event.status === "FINALIZADO"
                      ? "secondary"
                      : "outline"
                  }
                  className="w-fit"
                >
                  {event.status}
                </Badge>
              </div>
              <DialogDescription className="flex items-center gap-2 text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                {event.date}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 sm:space-y-8 mt-4 sm:mt-6">
          {/* Quick Stats Grid */}
          <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Ventas Totales
                </CardTitle>
                <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">
                  {formatCurrency(stats.ventasTotales)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Total vendido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Entradas
                </CardTitle>
                <Ticket className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">
                  {stats.entradas}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Tickets vendidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Ventas Efectivo
                </CardTitle>
                <Banknote className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">
                  {formatCurrency(stats.ventasEfectivo)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  En efectivo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium">
                  Ingresos Brutos
                </CardTitle>
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg sm:text-2xl font-bold">
                  {formatCurrency(stats.ingresosBrutos)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Hunt-Tickets
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sellers Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                Vendedores
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Detalle de ventas por vendedor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {stats.vendedores.map((vendedor) => (
                  <div
                    key={vendedor.id}
                    className="flex items-center justify-between p-4 sm:p-5 rounded-lg border hover:bg-muted transition-colors duration-300"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {vendedor.name}
                      </p>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {vendedor.tickets} tickets
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-bold text-sm sm:text-lg">
                        {formatCurrency(vendedor.ventas)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(
                          (vendedor.ventas / stats.ventasTotales) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                <div className="flex items-center justify-between font-semibold text-sm sm:text-base">
                  <div>
                    <p>Total</p>
                    <p className="text-xs sm:text-sm text-muted-foreground font-normal">
                      {stats.vendedores.length} vendedores
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base sm:text-lg">
                      {formatCurrency(stats.ventasTotales)}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground font-normal">
                      {stats.entradas} entradas
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
