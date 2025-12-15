"use client";

import { useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, ShoppingCart, DollarSign, CreditCard, Banknote, Ticket, AlertTriangle, Bell, BellOff } from "lucide-react";
import { FormInput } from "@/components/ui/form-input";
import { Switch } from "@/components/ui/switch";

interface TicketTypeSale {
  ticketTypeName: string;
  quantity: number;
  totalSales: number;
}

interface Transaction {
  id: string;
  eventName: string;
  ticketTypeName: string;
  quantity: number;
  total: number;
  platform: string; // 'web' | 'app' | 'cash'
  createdAt: string;
}

interface Seller {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  cashSales: number;
  gatewaySales: number;
  ticketsSold: number;
  commission: number | null;
  created_at: string;
}

interface SellerDetailSheetProps {
  seller: Seller;
  children: ReactNode;
  // These would come from API calls in production
  ticketTypesSales?: TicketTypeSale[];
  transactions?: Transaction[];
}

export function SellerDetailSheet({
  seller,
  children,
  ticketTypesSales = [],
  transactions = []
}: SellerDetailSheetProps) {
  const [open, setOpen] = useState(false);
  const [commissionAmount, setCommissionAmount] = useState(seller.commission?.toString() || "");
  const [notifyVendor, setNotifyVendor] = useState(true);
  const [isSavingCommission, setIsSavingCommission] = useState(false);

  const fullName = [seller.name, seller.lastName].filter(Boolean).join(' ') || 'Sin nombre';
  const initials = fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const totalSales = seller.cashSales + seller.gatewaySales;

  const handleSaveCommission = async () => {
    setIsSavingCommission(true);
    // TODO: Backend call to save commission
    // await saveSellerCommission(seller.id, parseFloat(commissionAmount), notifyVendor);

    // Simulate API call
    setTimeout(() => {
      setIsSavingCommission(false);
      // After successful save, you might want to close the sheet or show success message
    }, 1000);
  };

  // Mock data for ticket types sales (in production, fetch from API)
  const mockTicketSales: TicketTypeSale[] = ticketTypesSales.length > 0 ? ticketTypesSales : [
    { ticketTypeName: "General", quantity: 25, totalSales: 1500000 },
    { ticketTypeName: "VIP", quantity: 15, totalSales: 2250000 },
    { ticketTypeName: "Preferencial", quantity: 5, totalSales: 750000 },
  ];

  // Mock transactions (in production, fetch from API)
  const mockTransactions: Transaction[] = transactions.length > 0 ? transactions : [
    {
      id: "1",
      eventName: "Concierto Rock 2024",
      ticketTypeName: "VIP",
      quantity: 2,
      total: 300000,
      platform: "cash",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      eventName: "Festival Electrónico",
      ticketTypeName: "General",
      quantity: 5,
      total: 500000,
      platform: "cash",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "3",
      eventName: "Concierto Rock 2024",
      ticketTypeName: "Preferencial",
      quantity: 3,
      total: 450000,
      platform: "cash",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-background/95 backdrop-blur-xl border-white/10 p-6">
        <SheetHeader className="space-y-3 pb-6">
          <SheetTitle className="text-2xl font-bold">Detalle de Vendedor</SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
            Información detallada del vendedor, ventas por tipo de entrada y transacciones.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pr-2">
          {/* Seller Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Información del Vendedor</h3>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-xl bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0 font-semibold text-lg text-gray-900 dark:text-white/90 ring-1 ring-gray-200 dark:ring-white/10">
                      {initials}
                    </div>
                    <div className="text-lg font-semibold text-white">{fullName}</div>
                  </div>

                  {seller.email && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Mail className="h-4 w-4 text-white/40" />
                      {seller.email}
                    </div>
                  )}

                  {seller.phone && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Phone className="h-4 w-4 text-white/40" />
                      {seller.phone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sales Stats */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Estadísticas de Ventas</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                  <ShoppingCart className="h-4 w-4" />
                  Tickets Vendidos
                </div>
                <div className="text-2xl font-bold text-white">
                  {seller.ticketsSold.toLocaleString('es-CO')}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                  <DollarSign className="h-4 w-4" />
                  Total Ventas
                </div>
                <div className="text-2xl font-bold text-white">
                  ${totalSales.toLocaleString('es-CO')}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                  <Banknote className="h-4 w-4" />
                  Efectivo
                </div>
                <div className="text-2xl font-bold text-white">
                  ${seller.cashSales.toLocaleString('es-CO')}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                  <CreditCard className="h-4 w-4" />
                  Pasarela
                </div>
                <div className="text-2xl font-bold text-white">
                  ${seller.gatewaySales.toLocaleString('es-CO')}
                </div>
              </div>
            </div>
          </div>

          {/* Commission Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Gestión de Comisión</h3>

            {seller.commission !== null ? (
              // Commission already set - show as read-only
              <div className="p-6 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-blue-400">Comisión Asignada</div>
                  <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                    Guardada
                  </Badge>
                </div>
                <div className="text-3xl font-bold text-blue-400 mb-3">
                  ${seller.commission.toLocaleString('es-CO')} COP
                </div>
                <div className="text-xs text-blue-400/60">
                  Esta comisión ya ha sido guardada y no puede modificarse.
                </div>
              </div>
            ) : (
              // Commission not set - show form
              <div className="p-6 rounded-xl bg-white/[0.03] border border-white/5 space-y-4">
                <div className="space-y-4">
                  <FormInput
                    id="commission"
                    type="number"
                    label="Monto de Comisión"
                    placeholder="0"
                    value={commissionAmount}
                    onChange={(e) => setCommissionAmount(e.target.value)}
                    icon={<DollarSign className="h-4 w-4" />}
                    hint="Ingresa el monto en pesos colombianos (COP)"
                    min="0"
                    step="1"
                  />

                  {/* Notify Toggle */}
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="flex items-center gap-3">
                      {notifyVendor ? (
                        <Bell className="h-4 w-4 text-white/60" />
                      ) : (
                        <BellOff className="h-4 w-4 text-white/40" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">Notificar al vendedor</div>
                        <div className="text-xs text-white/50">
                          {notifyVendor
                            ? "Se enviará un email al vendedor informando sobre la comisión asignada"
                            : "No se enviará ninguna notificación"
                          }
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={notifyVendor}
                      onCheckedChange={setNotifyVendor}
                    />
                  </div>

                  {/* Warning Message */}
                  <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-amber-400 mb-1">
                          Advertencia importante
                        </div>
                        <div className="text-xs text-amber-400/80">
                          Esta acción no se podrá deshacer ni editar después de guardarse. Asegúrate de que el monto sea correcto antes de continuar.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveCommission}
                    disabled={!commissionAmount || parseFloat(commissionAmount) <= 0 || isSavingCommission}
                    className="w-full bg-white hover:bg-gray-100 text-black"
                    size="lg"
                  >
                    {isSavingCommission ? (
                      <>
                        <div className="h-4 w-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Guardar Comisión
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sales by Ticket Type */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Ventas por Tipo de Entrada</h3>

            {mockTicketSales.length > 0 ? (
              <div className="space-y-2">
                {mockTicketSales.map((ticketType, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-white/5 bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-white">{ticketType.ticketTypeName}</div>
                      <Badge variant="outline" className="border-white/10 text-white/50 text-xs">
                        {ticketType.quantity} tickets
                      </Badge>
                    </div>
                    <div className="text-sm text-white/60">
                      ${ticketType.totalSales.toLocaleString('es-CO')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl bg-white/[0.02] border border-white/5">
                <Ticket className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm text-white/40">No hay ventas registradas</p>
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Historial de Transacciones</h3>

            {mockTransactions.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {mockTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-lg border border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{tx.eventName}</div>
                        <div className="text-sm text-white/60 truncate">{tx.ticketTypeName}</div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-white/10 text-white/50 text-xs ml-2"
                      >
                        {tx.platform === 'app' ? 'App' : tx.platform === 'web' ? 'Web' : 'Efectivo'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/40">
                        {tx.quantity} ticket{tx.quantity > 1 ? 's' : ''}
                      </span>
                      <span className="font-semibold text-white">${tx.total.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="text-xs text-white/30 mt-2">
                      {new Date(tx.createdAt).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl bg-white/[0.02] border border-white/5">
                <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm text-white/40">No hay transacciones registradas</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
