"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CreditCard,
  AlertCircle,
  Ticket,
  Users,
} from "lucide-react";
import { SalesDistributionChart, RevenueByChannelChart, SalesFunnelChart, DailySalesChart } from "@/components/event-charts";

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
  cash?: boolean;
}

interface Ticket {
  id: string;
  quantity: number;
  analytics: {
    total: { quantity: number; total: number };
  };
}

interface EventDashboardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  financialReport: any;
  transactions: Transaction[];
  tickets: Ticket[];
  chartColor?: string;
  colorPalette?: string[];
}

export function EventDashboard({ financialReport, transactions, tickets, colorPalette = [] }: EventDashboardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate total tickets available and sold
  const totalTicketsAvailable = tickets.reduce((sum, ticket) => sum + ticket.quantity, 0);
  const totalTicketsSold = tickets.reduce((sum, ticket) => sum + ticket.analytics.total.quantity, 0);
  const ticketsSoldPercentage = totalTicketsAvailable > 0
    ? (totalTicketsSold / totalTicketsAvailable) * 100
    : 0;

  // Calculate sales funnel data
  const totalVisits = totalTicketsAvailable;
  const totalAddedToCart = transactions.length > 0 ? Math.ceil(transactions.length * 0.8) : 0;
  const totalCompleted = totalTicketsSold;

  return (
    <div className="space-y-4">
      {/* Key Metrics */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Recaudo Total</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(financialReport.channels_total)}
            </div>
            <p className="text-xs text-white/30">
              Promedio: {formatCurrency(financialReport.channels_total / (financialReport.tickets_sold.total || 1))}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Total Tickets</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {totalTicketsSold} / {totalTicketsAvailable}
            </div>
            <p className="text-xs text-white/30">
              {ticketsSoldPercentage.toFixed(1)}% vendidos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Monto a Liquidar</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(financialReport.settlement_amount)}
            </div>
            <p className="text-xs text-white/30">
              Para el productor
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Sales Chart */}
      <DailySalesChart transactions={transactions} colorPalette={colorPalette} />

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <SalesDistributionChart
          app={financialReport.tickets_sold.app}
          web={financialReport.tickets_sold.web}
          cash={financialReport.tickets_sold.cash}
          colorPalette={colorPalette}
        />
        <RevenueByChannelChart
          appTotal={financialReport.app_total}
          webTotal={financialReport.web_total}
          cashTotal={financialReport.cash_total}
          colorPalette={colorPalette}
        />
      </div>

      <SalesFunnelChart
        visits={totalVisits}
        addedToCart={totalAddedToCart}
        completed={totalCompleted}
        colorPalette={colorPalette}
      />

      {/* Sales Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ventas Hunt-Tickets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Precio base</span>
              <span className="font-medium">{formatCurrency(financialReport.hunt_sales.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Impuesto</span>
              <span className="font-medium">{formatCurrency(financialReport.hunt_sales.tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Tarifa variable</span>
              <span className="font-medium">
                {formatCurrency(financialReport.hunt_sales.variable_fee)}
              </span>
            </div>
            <div className="pt-3 mt-2 border-t border-white/10 flex justify-between items-center">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-lg font-bold">
                {formatCurrency(financialReport.hunt_sales.total)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ventas Efectivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Precio base</span>
              <span className="font-medium">
                {formatCurrency(financialReport.producer_sales.price)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Impuesto</span>
              <span className="font-medium">
                {formatCurrency(financialReport.producer_sales.tax)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/40">Tarifa variable</span>
              <span className="font-medium">
                {formatCurrency(financialReport.producer_sales.variable_fee)}
              </span>
            </div>
            <div className="pt-3 mt-2 border-t border-white/10 flex justify-between items-center">
              <span className="text-sm font-semibold">Total</span>
              <span className="text-lg font-bold">
                {formatCurrency(financialReport.producer_sales.total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card className="bg-white/[0.02] border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">
                Cálculos Hunt
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Ganancia bruta</span>
                  <span className="font-medium">
                    {formatCurrency(
                      financialReport.global_calculations.ganancia_bruta_hunt
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Deducciones Bold</span>
                  <span className="font-medium text-red-400">
                    -{formatCurrency(
                      financialReport.global_calculations.deducciones_bold_total
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/40">Impuesto 4x1000</span>
                  <span className="font-medium text-red-400">
                    -{formatCurrency(
                      financialReport.global_calculations.impuesto_4x1000
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
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
            </div>

            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3">
                Liquidación Productor
              </h4>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Total a liquidar</span>
                <span className="text-lg font-bold text-cyan-400">
                  {formatCurrency(financialReport.settlement_amount)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Datafono Calculations */}
      {financialReport.datafono_calculations &&
        financialReport.datafono_calculations.total_amount > 0 && (
          <Card className="bg-white/[0.02] border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                Transacciones Datáfono
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Monto Total</span>
                    <span className="font-medium">
                      {formatCurrency(
                        financialReport.datafono_calculations.total_amount
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Tarifa POS</span>
                    <span className="font-medium text-red-400">
                      -{formatCurrency(
                        financialReport.datafono_calculations.pos_fee
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Comisión Hunt</span>
                    <span className="font-medium">
                      {formatCurrency(
                        financialReport.datafono_calculations.hunt_commission
                      )}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Impuesto comisión</span>
                    <span className="font-medium text-red-400">
                      -{formatCurrency(
                        financialReport.datafono_calculations.tax_on_commission
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/40">Beneficio Hunt</span>
                    <span className="font-medium text-green-400">
                      {formatCurrency(
                        financialReport.datafono_calculations.hunt_net_benefit
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-white/10">
                    <span className="font-semibold">Neto Productor</span>
                    <span className="font-bold text-cyan-400">
                      {formatCurrency(
                        financialReport.datafono_calculations.producer_net_amount
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      {/* Validation Status */}
      {financialReport.validation &&
        (financialReport.validation.revenue_discrepancy !== 0 ||
          financialReport.validation.mismatched_transactions !== 0) && (
          <Card className="bg-white/[0.02] border-yellow-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                </div>
                Validación de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {financialReport.validation.revenue_discrepancy !== 0 && (
                  <div className="flex justify-between text-sm p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                    <span className="text-white/40">
                      Discrepancia de ingresos
                    </span>
                    <span className="font-semibold text-yellow-400">
                      {formatCurrency(
                        financialReport.validation.revenue_discrepancy
                      )}
                    </span>
                  </div>
                )}
                {financialReport.validation.mismatched_transactions !== 0 && (
                  <div className="flex justify-between text-sm p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
                    <span className="text-white/40">
                      Transacciones no coincidentes
                    </span>
                    <span className="font-semibold text-yellow-400">
                      {financialReport.validation.mismatched_transactions}
                    </span>
                  </div>
                )}
                <p className="text-xs text-white/30 mt-3 p-3 rounded-lg bg-white/[0.01]">
                  Se detectaron discrepancias. Contacte al equipo de soporte si es necesario.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
