"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download } from "lucide-react";

interface Transaction {
  id: string;
  quantity: number;
  total: number;
  price: number;
  status: string;
  created_at: string;
  type: string;
  ticket_name: string;
  user_fullname: string;
  user_email: string;
  promoter_fullname: string;
  promoter_email: string;
  cash?: boolean;
}

interface Ticket {
  id: string;
  name?: string;
  price?: number;
  quantity: number;
  analytics: {
    total: { quantity: number; total: number };
    app?: { quantity: number; total: number };
    web?: { quantity: number; total: number };
    cash?: { quantity: number; total: number };
  };
}

interface EventBordeauxProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  financialReport: any;
  transactions: Transaction[];
  tickets: Ticket[];
}

export function EventBorderaux({
  financialReport,
  tickets,
}: EventBordeauxProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate ticket breakdown
  const ticketBreakdown = useMemo(() => {
    return tickets.map((ticket) => ({
      name: ticket.name || "Sin nombre",
      price: ticket.price || 0,
      quantity: ticket.analytics.total.quantity,
      total: ticket.analytics.total.total,
    }));
  }, [tickets]);

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log("Export borderaux to PDF");
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Borderaux del Evento</h3>
          <p className="text-xs text-white/40 mt-1">
            Documento de liquidación financiera
          </p>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-white/90 hover:bg-white text-black border border-white/80"
        >
          Exportar PDF
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Ticket Sales Breakdown */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Desglose de Ventas por Entrada</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ticketBreakdown.map((ticket, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 px-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold">{ticket.name}</p>
                  <p className="text-xs text-white/40">
                    {formatCurrency(ticket.price)} × {ticket.quantity} tickets
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{formatCurrency(ticket.total)}</p>
                </div>
              </div>
            ))}
            <div className="pt-3 mt-2 border-t border-white/10 flex justify-between items-center px-4">
              <span className="text-sm font-semibold">Total Bruto</span>
              <span className="text-lg font-bold">
                {formatCurrency(financialReport.channels_total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income by Channel */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Ingresos por Canal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm py-2">
              <span className="text-white/40">App Móvil</span>
              <span className="font-medium">{formatCurrency(financialReport.app_total)}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-white/40">Web</span>
              <span className="font-medium">{formatCurrency(financialReport.web_total)}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-white/40">Efectivo</span>
              <span className="font-medium">{formatCurrency(financialReport.cash_total)}</span>
            </div>
            <div className="pt-3 mt-2 border-t border-white/10 flex justify-between items-center">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-lg font-bold">
                {formatCurrency(financialReport.channels_total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deductions - Hunt Sales */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Deducciones Hunt-Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm py-2">
              <span className="text-white/40">Precio base vendido</span>
              <span className="font-medium">{formatCurrency(financialReport.hunt_sales.price)}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-white/40">IVA (19%)</span>
              <span className="font-medium text-red-400">
                {formatCurrency(financialReport.hunt_sales.tax)}
              </span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-white/40">Tarifa variable</span>
              <span className="font-medium text-red-400">
                {formatCurrency(financialReport.hunt_sales.variable_fee)}
              </span>
            </div>
            <div className="pt-3 mt-2 border-t border-white/10 flex justify-between items-center">
              <span className="text-sm font-semibold">Total Deducciones</span>
              <span className="text-lg font-bold text-red-400">
                -{formatCurrency(financialReport.hunt_sales.total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Producer Cash Sales */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Ventas Efectivo (Productor)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm py-2">
              <span className="text-white/40">Precio base</span>
              <span className="font-medium">{formatCurrency(financialReport.producer_sales.price)}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-white/40">IVA (19%)</span>
              <span className="font-medium">{formatCurrency(financialReport.producer_sales.tax)}</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-white/40">Tarifa variable</span>
              <span className="font-medium">{formatCurrency(financialReport.producer_sales.variable_fee)}</span>
            </div>
            <div className="pt-3 mt-2 border-t border-white/10 flex justify-between items-center">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-lg font-bold">
                {formatCurrency(financialReport.producer_sales.total)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Calculations */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardHeader>
          <CardTitle className="text-base">Cálculos Globales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm py-2">
              <span className="text-white/40">Ganancia bruta Hunt</span>
              <span className="font-medium">
                {formatCurrency(financialReport.global_calculations.ganancia_bruta_hunt)}
              </span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-white/40">Deducciones Bold</span>
              <span className="font-medium text-red-400">
                -{formatCurrency(financialReport.global_calculations.deducciones_bold_total)}
              </span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-white/40">Impuesto 4x1000</span>
              <span className="font-medium text-red-400">
                -{formatCurrency(financialReport.global_calculations.impuesto_4x1000)}
              </span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-white/40">IVA acumulado (19%)</span>
              <span className="font-medium text-red-400">
                -{formatCurrency(financialReport.total_tax)}
              </span>
            </div>
            <div className="pt-3 mt-2 border-t border-white/10 flex justify-between items-center">
              <span className="text-sm font-semibold">Ganancia Neta Hunt</span>
              <span className="text-lg font-bold text-green-400">
                {formatCurrency(
                  financialReport.global_calculations.ganancia_neta_hunt - financialReport.total_tax
                )}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final Settlement */}
      <Card className="bg-white/[0.02] border-white/5">
        <CardHeader>
          <CardTitle className="text-base">Liquidación Final</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-white/40 mb-1">Monto a Liquidar al Productor</p>
                  <p className="text-sm text-white/60">
                    Incluye ventas efectivo + deducciones
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-cyan-400">
                    {formatCurrency(financialReport.settlement_amount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Datafono if exists */}
            {financialReport.datafono_calculations &&
              financialReport.datafono_calculations.total_amount > 0 && (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <h4 className="text-sm font-semibold mb-3">Transacciones Datáfono</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/40">Monto Total</span>
                      <span className="font-medium">
                        {formatCurrency(financialReport.datafono_calculations.total_amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Tarifa POS</span>
                      <span className="font-medium text-red-400">
                        -{formatCurrency(financialReport.datafono_calculations.pos_fee)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Comisión Hunt</span>
                      <span className="font-medium">
                        {formatCurrency(financialReport.datafono_calculations.hunt_commission)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/40">Impuesto comisión</span>
                      <span className="font-medium text-red-400">
                        -{formatCurrency(financialReport.datafono_calculations.tax_on_commission)}
                      </span>
                    </div>
                    <div className="pt-2 mt-2 border-t border-white/10 flex justify-between">
                      <span className="font-semibold">Neto Productor (Datáfono)</span>
                      <span className="font-bold text-cyan-400">
                        {formatCurrency(financialReport.datafono_calculations.producer_net_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
