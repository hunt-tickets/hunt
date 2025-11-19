"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket, HelpCircle, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTicketDialog } from "@/components/create-ticket-dialog";
import { EditTicketSheet } from "@/components/edit-ticket-sheet";
import { ChannelSalesChart, TicketRevenueDistributionChart } from "@/components/event-charts";
import { SendCourtesyDialog } from "@/components/send-courtesy-dialog";

interface TicketType {
  id: string;
  name: string;
}

interface TicketData {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  price: number;
  max_date: string | null;
  quantity: number;
  reference: string | null;
  status: boolean;
  section: string | null;
  row: string | null;
  seat: string | null;
  palco: string | null;
  capacity: number | null;
  hex: string | null;
  family: string | null;
  ticket_type?: {
    id: string;
    name: string;
  } | null;
}

interface TicketAnalytics {
  ticketId: string;
  app: { quantity: number; total: number };
  web: { quantity: number; total: number };
  cash: { quantity: number; total: number };
  total: { quantity: number; total: number };
}

interface EventTicketsContentProps {
  eventId: string;
  tickets: TicketData[];
  ticketsAnalytics?: Record<string, TicketAnalytics>;
  ticketTypes: TicketType[];
  variableFee: number;
}

export function EventTicketsContent({
  eventId,
  tickets,
  ticketsAnalytics,
  ticketTypes,
  variableFee,
}: EventTicketsContentProps) {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [selectedTicketType, setSelectedTicketType] = useState<string>("all");
  const [selectedPriceTab, setSelectedPriceTab] = useState<Record<string, 'app' | 'cash'>>({});

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">Tipos de Entrada</h3>
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-white/40 hover:text-white/60 cursor-help transition-colors" />
              <div className="absolute left-0 top-6 w-64 p-3 bg-zinc-900 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <p className="text-xs text-white/80 leading-relaxed">
                  Los <strong>Tipos de Entrada</strong> permiten organizar tus boletas por categorías (VIP, General, Palco, etc.). Cada tipo puede tener múltiples tickets con diferentes precios y ubicaciones.
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {tickets.length} tipo{tickets.length !== 1 ? 's' : ''} de entrada configurado{tickets.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SendCourtesyDialog eventId={eventId} />
          <CreateTicketDialog eventId={eventId} ticketTypes={ticketTypes} />
          <Button
            size="sm"
            variant="outline"
            className="rounded-lg"
            onClick={() => router.push(`/profile/${userId}/administrador/event/${eventId}/mapa`)}
          >
            <Map className="h-4 w-4 mr-2" />
            Mapa
          </Button>
        </div>
      </div>

      {/* Filtros por tipo de ticket */}
      {(() => {
        // Filtrar solo tipos que tengan al menos un ticket
        const typesWithTickets = ticketTypes.filter(type =>
          tickets.some(t => t.ticket_type?.id === type.id)
        );

        if (typesWithTickets.length === 0) return null;

        return (
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedTicketType("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTicketType === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 hover:bg-white/10 text-white/60"
              }`}
            >
              Todos ({tickets.length})
            </button>
            {typesWithTickets.map((type) => {
              const count = tickets.filter(t => t.ticket_type?.id === type.id).length;
              return (
                <button
                  key={type.id}
                  onClick={() => setSelectedTicketType(type.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedTicketType === type.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/5 hover:bg-white/10 text-white/60"
                  }`}
                >
                  {type.name} ({count})
                </button>
              );
            })}
            {/* QR Huérfanos Tab */}
            <button
              onClick={() => setSelectedTicketType("orphan_qrs")}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedTicketType === "orphan_qrs"
                  ? "bg-primary text-primary-foreground"
                  : "bg-white/5 hover:bg-white/10 text-white/60"
              }`}
            >
              QR Huérfanos (0)
            </button>
          </div>
        );
      })()}

      {/* Analytics Overview */}
      {ticketsAnalytics && Object.keys(ticketsAnalytics).length > 0 && selectedTicketType !== "orphan_qrs" && (() => {
        // Filtrar tickets según el tipo seleccionado
        const filteredTicketsForAnalytics = selectedTicketType === "all"
          ? tickets
          : tickets.filter(t => t.ticket_type?.id === selectedTicketType);

        // Calcular totales solo para los tickets filtrados
        const totals = filteredTicketsForAnalytics.reduce((acc, ticket) => {
          const analytics = ticketsAnalytics[ticket.id];
          if (!analytics) return acc;
          return {
            total: acc.total + analytics.total.quantity,
            revenue: acc.revenue + analytics.total.total,
            app: acc.app + analytics.app.quantity,
            web: acc.web + analytics.web.quantity,
            cash: acc.cash + analytics.cash.quantity,
          };
        }, { total: 0, revenue: 0, app: 0, web: 0, cash: 0 });

        // Distribución de ingresos por ticket (ordenado por recaudo) - Solo tickets filtrados
        const revenueTickets = filteredTicketsForAnalytics
          .map(ticket => ({
            ...ticket,
            analytics: ticketsAnalytics[ticket.id]
          }))
          .filter(t => t.analytics)
          .sort((a, b) => b.analytics.total.total - a.analytics.total.total);

        // Si no hay datos para mostrar, no renderizar analytics
        if (totals.total === 0) return null;

        return (
          <div className="mb-6 space-y-4">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <div className="text-xs text-white/40 mb-1">Total Vendidos</div>
                <div className="text-2xl font-bold">{totals.total}</div>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <div className="text-xs text-white/40 mb-1">Recaudo Total</div>
                <div className="text-2xl font-bold">{formatCurrency(totals.revenue)}</div>
              </div>
              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01]">
                <div className="text-xs text-white/40 mb-1">Ticket Promedio</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(totals.total > 0 ? totals.revenue / totals.total : 0)}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Ventas por Canal */}
              <div className="p-5 rounded-xl border border-white/5 bg-white/[0.01]">
                <h4 className="text-sm font-semibold mb-4">Ventas por Canal</h4>
                <div className="h-[350px]">
                  <ChannelSalesChart
                    app={totals.app}
                    web={totals.web}
                    cash={totals.cash}
                  />
                </div>
              </div>

              {/* Distribución de Ingresos */}
              <div className="p-5 rounded-xl border border-white/5 bg-white/[0.01]">
                <h4 className="text-sm font-semibold mb-4">Distribución de Ingresos por Ticket</h4>
                <div className="h-[350px]">
                  <TicketRevenueDistributionChart
                    tickets={revenueTickets.map((ticket) => ({
                      name: ticket.name,
                      revenue: ticket.analytics.total.total,
                      quantity: ticket.analytics.total.quantity,
                      percentage: (ticket.analytics.total.total / totals.revenue) * 100,
                      color: ticket.hex || undefined
                    }))}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {(() => {
        // Handle QR Huérfanos tab
        if (selectedTicketType === "orphan_qrs") {
          return (
            <Card>
              <CardContent className="py-12 text-center">
                <Ticket className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-1">
                  QR Huérfanos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Aquí aparecerán los códigos QR sin ticket asociado
                </p>
              </CardContent>
            </Card>
          );
        }

        // Filtrar tickets según el tipo seleccionado
        const filteredTickets = selectedTicketType === "all"
          ? tickets
          : tickets.filter(t => t.ticket_type?.id === selectedTicketType);

        return filteredTickets.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Ticket className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">
                {tickets.length === 0 ? "No hay entradas configuradas" : "No hay entradas de este tipo"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {tickets.length === 0 ? "Crea tipos de entrada para empezar a vender" : "Prueba con otro filtro"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTickets.map((ticket) => {
              const variableFeeAmount = ticket.price * variableFee;
              const taxAmount = variableFeeAmount * 0.19;
              const totalPrice = ticket.price + variableFeeAmount + taxAmount;
              const analytics = ticketsAnalytics?.[ticket.id];

              return (
                <Card key={ticket.id} className="bg-white/[0.02] border-white/5 hover:border-white/10 transition-all duration-300 group">
                  <CardContent className="p-5">
                    {/* Header con nombre y estado */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        {ticket.hex && (
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: ticket.hex }}
                          />
                        )}
                        <h3 className="text-base font-bold">{ticket.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${ticket.status ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                          {ticket.status ? 'Activo' : 'Inactivo'}
                        </div>
                        <EditTicketSheet ticket={ticket} />
                      </div>
                    </div>

                    {/* Analytics destacados */}
                    {analytics && (
                      <div className="mb-4 p-4 rounded-lg bg-white/[0.03] border border-white/5">
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-white/40 mb-1">Vendidos</p>
                            <p className="text-2xl font-bold">{analytics.total.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/40 mb-1">Recaudo</p>
                            <p className="text-xl font-bold">{formatCurrency(analytics.total.total)}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5">
                          <div className="text-center">
                            <p className="text-xs text-white/30 mb-1">App</p>
                            <p className="text-sm font-semibold text-white/80">{analytics.app.quantity}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-white/30 mb-1">Web</p>
                            <p className="text-sm font-semibold text-white/80">{analytics.web.quantity}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-white/30 mb-1">Cash</p>
                            <p className="text-sm font-semibold text-white/80">{analytics.cash.quantity}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Precio con switch */}
                    <div className="mb-4 p-4 rounded-lg bg-white/[0.03] border border-white/5">
                      {/* Switch con etiquetas */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-xs text-white/40 mb-1">
                            {(selectedPriceTab[ticket.id] || 'app') === 'app' ? 'Precio App/Web' : 'Precio Efectivo'}
                          </p>
                          <p className="text-xl font-bold">
                            {(selectedPriceTab[ticket.id] || 'app') === 'app'
                              ? formatCurrency(totalPrice)
                              : formatCurrency(ticket.price)
                            }
                          </p>
                        </div>
                        {/* Switch con labels */}
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-medium transition-colors ${
                            (selectedPriceTab[ticket.id] || 'app') === 'app'
                              ? 'text-white/80'
                              : 'text-white/30'
                          }`}>
                            App
                          </span>
                          <button
                            onClick={() => setSelectedPriceTab({
                              ...selectedPriceTab,
                              [ticket.id]: selectedPriceTab[ticket.id] === 'cash' ? 'app' : 'cash'
                            })}
                            className="relative inline-flex h-5 w-9 items-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                                selectedPriceTab[ticket.id] === 'cash' ? 'translate-x-[1.4rem]' : 'translate-x-0.5'
                              }`}
                            />
                          </button>
                          <span className={`text-[10px] font-medium transition-colors ${
                            selectedPriceTab[ticket.id] === 'cash'
                              ? 'text-white/80'
                              : 'text-white/30'
                          }`}>
                            Cash
                          </span>
                        </div>
                      </div>

                      {/* Desglose solo para App/Web */}
                      {(selectedPriceTab[ticket.id] || 'app') === 'app' ? (
                        <div>
                          <details className="group/details">
                            <summary className="text-xs text-white/40 cursor-pointer hover:text-white/60 list-none flex items-center gap-1 pt-3 border-t border-white/5">
                              <span>Ver desglose</span>
                              <svg className="w-3 h-3 transition-transform group-open/details:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </summary>
                            <div className="mt-3 space-y-2 text-xs">
                              <div className="flex justify-between">
                                <span className="text-white/40">Precio base</span>
                                <span className="font-medium">{formatCurrency(ticket.price)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">Fee ({(variableFee * 100).toFixed(0)}%)</span>
                                <span className="font-medium">{formatCurrency(variableFeeAmount)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/40">IVA (19%)</span>
                                <span className="font-medium">{formatCurrency(taxAmount)}</span>
                              </div>
                            </div>
                          </details>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-white/30 pt-3 border-t border-white/5">Sin fee adicional</p>
                        </div>
                      )}
                    </div>

                    {/* Barra de progreso de ventas */}
                    {analytics && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs text-white/40">Ventas</span>
                          <span className="text-xs font-medium">
                            {analytics.total.quantity} / {ticket.quantity}
                          </span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-white rounded-full transition-all duration-500"
                            style={{ width: `${((analytics.total.quantity / ticket.quantity) * 100).toFixed(1)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1">
                          <span className="text-xs text-white/30">Vendidos: {analytics.total.quantity}</span>
                          <span className="text-xs text-white/30">Disponibles: {ticket.quantity - analytics.total.quantity}</span>
                        </div>
                      </div>
                    )}

                    {/* Info adicional */}
                    {!analytics && (
                      <div className="mb-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/40">Disponibles</span>
                          <span className="font-medium">{ticket.quantity}</span>
                        </div>
                      </div>
                    )}

                    {(ticket.capacity || ticket.family) && (
                      <div className="space-y-2 text-sm mb-4">
                        {ticket.capacity && (
                          <div className="flex justify-between">
                            <span className="text-white/40">Capacidad</span>
                            <span className="font-medium">{ticket.capacity}</span>
                          </div>
                        )}
                        {ticket.family && (
                          <div className="flex justify-between">
                            <span className="text-white/40">Familia</span>
                            <span className="font-medium">{ticket.family}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Metadata (ubicación, fecha, etc) */}
                    {(ticket.section || ticket.row || ticket.seat || ticket.palco || ticket.max_date) && (
                      <div className="pt-4 mt-4 border-t border-white/5">
                        <div className="flex flex-wrap gap-2">
                          {ticket.section && (
                            <span className="px-2 py-1 rounded text-xs text-white/50 bg-white/[0.02] border border-white/5">
                              Sec. {ticket.section}
                            </span>
                          )}
                          {ticket.row && (
                            <span className="px-2 py-1 rounded text-xs text-white/50 bg-white/[0.02] border border-white/5">
                              Fila {ticket.row}
                            </span>
                          )}
                          {ticket.seat && (
                            <span className="px-2 py-1 rounded text-xs text-white/50 bg-white/[0.02] border border-white/5">
                              Asiento {ticket.seat}
                            </span>
                          )}
                          {ticket.palco && (
                            <span className="px-2 py-1 rounded text-xs text-white/50 bg-white/[0.02] border border-white/5">
                              Palco {ticket.palco}
                            </span>
                          )}
                          {ticket.max_date && (
                            <span className="px-2 py-1 rounded text-xs text-white/50 bg-white/[0.02] border border-white/5">
                              Hasta {new Date(ticket.max_date).toLocaleDateString('es-CO', { month: 'short', day: 'numeric' })} {new Date(ticket.max_date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        );
      })()}
    </div>
  );
}
