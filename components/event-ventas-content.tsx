"use client";

import { useMemo, useState } from "react";
import { BarChart3, ShoppingCart, Users, DollarSign, Ticket, Globe, Smartphone, Banknote, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useEventTabs } from "@/contexts/event-tabs-context";
import type { OrderWithDetails, TicketTypeStats } from "@/app/(protected)/profile/[userId]/organizaciones/[organizationId]/administrador/event/[eventId]/ventas/page";

interface EventVentasContentProps {
  orders: OrderWithDetails[];
  ticketTypes: TicketTypeStats[];
  showTabsOnly?: boolean;
  showContentOnly?: boolean;
}

const SELLER_FEE_PERCENTAGE = 0.10; // 10% fee for sellers

export function EventVentasContent({
  orders,
  ticketTypes,
  showTabsOnly = false,
  showContentOnly = false,
}: EventVentasContentProps) {
  const { salesTab: activeTab, setSalesTab: setActiveTab } = useEventTabs();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-CO", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate summary stats
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.totalAmount), 0);
    const totalTickets = orders.reduce((sum, o) =>
      sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    const byPlatform = {
      web: { orders: 0, revenue: 0, tickets: 0 },
      app: { orders: 0, revenue: 0, tickets: 0 },
      cash: { orders: 0, revenue: 0, tickets: 0 },
    };

    orders.forEach((order) => {
      const platform = order.platform;
      const tickets = order.items.reduce((sum, item) => sum + item.quantity, 0);
      byPlatform[platform].orders += 1;
      byPlatform[platform].revenue += parseFloat(order.totalAmount);
      byPlatform[platform].tickets += tickets;
    });

    return {
      totalOrders: orders.length,
      totalRevenue,
      totalTickets,
      byPlatform,
    };
  }, [orders]);

  // Calculate seller stats (for cash sales)
  const sellerStats = useMemo(() => {
    const sellers: Record<string, {
      id: string;
      name: string;
      email: string;
      totalSales: number;
      totalOrders: number;
      totalTickets: number;
      feeOwed: number;
    }> = {};

    orders.forEach((order) => {
      if (order.platform === "cash" && order.seller) {
        const sellerId = order.seller.id;
        if (!sellers[sellerId]) {
          sellers[sellerId] = {
            id: sellerId,
            name: order.seller.name || "Sin nombre",
            email: order.seller.email,
            totalSales: 0,
            totalOrders: 0,
            totalTickets: 0,
            feeOwed: 0,
          };
        }
        const orderTotal = parseFloat(order.totalAmount);
        const orderTickets = order.items.reduce((sum, item) => sum + item.quantity, 0);
        sellers[sellerId].totalSales += orderTotal;
        sellers[sellerId].totalOrders += 1;
        sellers[sellerId].totalTickets += orderTickets;
        sellers[sellerId].feeOwed += orderTotal * SELLER_FEE_PERCENTAGE;
      }
    });

    return Object.values(sellers).sort((a, b) => b.totalSales - a.totalSales);
  }, [orders]);

  // Tabs section
  const tabsSection = (
    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <button
        onClick={() => setActiveTab("overview")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "overview"
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
        }`}
      >
        <BarChart3 className="h-4 w-4" />
        Resumen
      </button>
      <button
        onClick={() => setActiveTab("orders")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "orders"
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
        }`}
      >
        <ShoppingCart className="h-4 w-4" />
        Órdenes
      </button>
      <button
        onClick={() => setActiveTab("sellers")}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
          activeTab === "sellers"
            ? "bg-white/10 text-white border border-white/20"
            : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
        }`}
      >
        <Users className="h-4 w-4" />
        Vendedores
      </button>
    </div>
  );

  // Content section
  const contentSection = (
    <>
      {activeTab === "overview" && (
        <OverviewTab stats={stats} ticketTypes={ticketTypes} formatCurrency={formatCurrency} />
      )}
      {activeTab === "orders" && (
        <OrdersTab orders={orders} formatCurrency={formatCurrency} formatDate={formatDate} />
      )}
      {activeTab === "sellers" && (
        <SellersTab sellers={sellerStats} formatCurrency={formatCurrency} />
      )}
    </>
  );

  if (showTabsOnly) return tabsSection;
  if (showContentOnly) return contentSection;

  return (
    <div className="space-y-4">
      {tabsSection}
      {contentSection}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({
  stats,
  ticketTypes,
  formatCurrency,
}: {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalTickets: number;
    byPlatform: Record<string, { orders: number; revenue: number; tickets: number }>;
  };
  ticketTypes: TicketTypeStats[];
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-green-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Ingresos Totales</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Total Órdenes</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Ticket className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Tickets Vendidos</span>
            </div>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-4">Ventas por Plataforma</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="p-2 rounded-full bg-purple-500/10">
                <Globe className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/40">Web</p>
                <p className="font-semibold">{formatCurrency(stats.byPlatform.web.revenue)}</p>
                <p className="text-xs text-white/40">{stats.byPlatform.web.orders} órdenes · {stats.byPlatform.web.tickets} tickets</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="p-2 rounded-full bg-blue-500/10">
                <Smartphone className="h-4 w-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/40">App</p>
                <p className="font-semibold">{formatCurrency(stats.byPlatform.app.revenue)}</p>
                <p className="text-xs text-white/40">{stats.byPlatform.app.orders} órdenes · {stats.byPlatform.app.tickets} tickets</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5">
              <div className="p-2 rounded-full bg-green-500/10">
                <Banknote className="h-4 w-4 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-white/40">Efectivo</p>
                <p className="font-semibold">{formatCurrency(stats.byPlatform.cash.revenue)}</p>
                <p className="text-xs text-white/40">{stats.byPlatform.cash.orders} órdenes · {stats.byPlatform.cash.tickets} tickets</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Types Performance */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-4">Rendimiento por Tipo de Entrada</h3>
          {ticketTypes.length === 0 ? (
            <p className="text-sm text-white/40 text-center py-4">No hay tipos de entrada</p>
          ) : (
            <div className="space-y-3">
              {ticketTypes.map((tt) => {
                const progress = tt.capacity > 0 ? (tt.soldCount / tt.capacity) * 100 : 0;
                return (
                  <div key={tt.id} className="p-3 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">{tt.name}</p>
                        <p className="text-xs text-white/40">{formatCurrency(parseFloat(tt.price))} por ticket</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(tt.revenue)}</p>
                        <p className="text-xs text-white/40">{tt.soldCount} / {tt.capacity} vendidos</p>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Orders Tab Component
function OrdersTab({
  orders,
  formatCurrency,
  formatDate,
}: {
  orders: OrderWithDetails[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string) => string;
}) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case "web":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Globe className="h-3 w-3" /> Web
          </span>
        );
      case "app":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Smartphone className="h-3 w-3" /> App
          </span>
        );
      case "cash":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
            <Banknote className="h-3 w-3" /> Efectivo
          </span>
        );
      default:
        return null;
    }
  };

  if (orders.length === 0) {
    return (
      <Card className="bg-white/[0.02] border-white/10">
        <CardContent className="py-12 text-center">
          <ShoppingCart className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-2">No hay órdenes</p>
          <p className="text-sm text-white/30">Las órdenes pagadas aparecerán aquí</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-white/40 mb-3">{orders.length} órdenes</p>
      {orders.map((order) => {
        const isExpanded = expandedOrder === order.id;
        const totalTickets = order.items.reduce((sum, item) => sum + item.quantity, 0);

        return (
          <Card
            key={order.id}
            className="bg-white/[0.02] border-white/10 overflow-hidden"
          >
            <CardContent className="p-0">
              <button
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium truncate">
                        {order.buyer?.name || order.buyer?.email || "Usuario desconocido"}
                      </p>
                      {getPlatformBadge(order.platform)}
                    </div>
                    <p className="text-xs text-white/40 mt-0.5">
                      {formatDate(order.createdAt)} · {totalTickets} ticket{totalTickets !== 1 ? "s" : ""}
                      {order.platform === "cash" && order.seller && (
                        <> · Vendido por {order.seller.name || order.seller.email}</>
                      )}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold">{formatCurrency(parseFloat(order.totalAmount))}</p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-white/40 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/40 flex-shrink-0" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 border-t border-white/5">
                  <div className="pt-3 space-y-2">
                    <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Detalle de tickets</p>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm py-1">
                        <span className="text-white/70">
                          {item.quantity}x {item.ticketTypeName}
                        </span>
                        <span>{formatCurrency(parseFloat(item.subtotal))}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm pt-2 border-t border-white/10 font-medium">
                      <span>Total</span>
                      <span>{formatCurrency(parseFloat(order.totalAmount))}</span>
                    </div>
                    {order.buyer?.email && (
                      <p className="text-xs text-white/30 pt-2">{order.buyer.email}</p>
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
}

// Sellers Tab Component
function SellersTab({
  sellers,
  formatCurrency,
}: {
  sellers: {
    id: string;
    name: string;
    email: string;
    totalSales: number;
    totalOrders: number;
    totalTickets: number;
    feeOwed: number;
  }[];
  formatCurrency: (amount: number) => string;
}) {
  const totalFeeOwed = sellers.reduce((sum, s) => sum + s.feeOwed, 0);
  const totalCashSales = sellers.reduce((sum, s) => sum + s.totalSales, 0);

  if (sellers.length === 0) {
    return (
      <Card className="bg-white/[0.02] border-white/10">
        <CardContent className="py-12 text-center">
          <Users className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 mb-2">No hay ventas en efectivo</p>
          <p className="text-sm text-white/30">Las ventas realizadas por vendedores aparecerán aquí</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-3">
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Vendedores</span>
            </div>
            <div className="text-2xl font-bold">{sellers.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Banknote className="h-4 w-4 text-green-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Total Efectivo</span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(totalCashSales)}</div>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-yellow-400" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Fee a Cobrar (10%)</span>
            </div>
            <div className="text-2xl font-bold text-yellow-400">{formatCurrency(totalFeeOwed)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Sellers List */}
      <Card className="bg-white/[0.02] border-white/10">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold mb-4">Detalle por Vendedor</h3>
          <div className="space-y-3">
            {sellers.map((seller) => (
              <div
                key={seller.id}
                className="p-4 rounded-lg bg-white/[0.02] border border-white/5"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium">{seller.name}</p>
                    <p className="text-xs text-white/40">{seller.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(seller.totalSales)}</p>
                    <p className="text-xs text-white/40">{seller.totalOrders} órdenes</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-white/5">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white/40">{seller.totalTickets} tickets</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-white/40">Fee (10%): </span>
                    <span className="font-semibold text-yellow-400">{formatCurrency(seller.feeOwed)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
