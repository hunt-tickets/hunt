"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Receipt, Download, MoreVertical, Mail, Edit, ShoppingCart, Smartphone, Globe, Banknote } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";

interface Transaction {
  id: string;
  quantity: number;
  total: number;
  status: string;
  created_at: string;
  source: string;
  tickets: {
    name: string;
    price: number;
  };
  user: {
    name: string | null;
    lastName: string | null;
    email: string | null;
  } | null;
}

interface CompleteTransaction {
  id: string;
  created_at: string;
  user_fullname: string;
  user_email: string;
  ticket_name: string;
  event_name: string;
  quantity: number;
  price: number;
  variable_fee: number;
  tax: number;
  total: number;
  status: string;
  type: string;
  cash: boolean;
  order_id: string;
  promoter_fullname: string;
  promoter_email: string;
  // Basic Bold data - always present for all users
  bold_id: string | null;
  bold_fecha: string | null;
  bold_estado: string | null;
  bold_metodo_pago: string | null;
  // Detailed Bold financial data - only present for admins
  bold_valor_compra?: number | null;
  bold_propina?: number | null;
  bold_iva?: number | null;
  bold_impoconsumo?: number | null;
  bold_valor_total?: number | null;
  bold_rete_fuente?: number | null;
  bold_rete_iva?: number | null;
  bold_rete_ica?: number | null;
  bold_comision_porcentaje?: number | null;
  bold_comision_fija?: number | null;
  bold_total_deduccion?: number | null;
  bold_deposito_cuenta?: number | null;
  bold_banco?: string | null;
  bold_franquicia?: string | null;
  bold_pais_tarjeta?: string | null;
}

interface EventTransactionsContentProps {
  eventName: string;
  transactions: Transaction[];
  completeTransactions: CompleteTransaction[];
  isAdmin: boolean;
}

export function EventTransactionsContent({
  eventName,
  transactions,
  completeTransactions,
  isAdmin,
}: EventTransactionsContentProps) {
  const [selectedTransaction, setSelectedTransaction] = useState<CompleteTransaction | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleEdit = (transactionId: string) => {
    const complete = completeTransactions.find(t => t.id === transactionId);
    if (complete) {
      setSelectedTransaction(complete);
    }
  };

  const handleResendEmail = (transactionId: string) => {
    // TODO: Implementar reenvío de correo
    console.log("Reenviar correo para transacción:", transactionId);
  };

  const handleDownloadCSV = () => {
    // Generate complete CSV similar to edge function Excel
    const baseHeaders = [
      'ID Transacción',
      'Fecha y Hora',
      'Nombre Completo',
      'Correo Electrónico',
      'Tipo de Entrada',
      'Cantidad',
      'Precio Unitario',
      'Comisión Hunt',
      'Impuesto',
      'Total Transacción',
      'Estado',
      'Canal de Venta',
      'Pago en Efectivo',
      'ID de Orden',
      'Promotor',
      'Correo Promotor',
      'Bold ID',
      'Bold Fecha',
      'Bold Estado',
      'Bold Método Pago',
      'Tiene Datos Bold',
    ];

    const adminHeaders = isAdmin ? [
      'Bold Valor Compra',
      'Bold Propina',
      'Bold IVA',
      'Bold Impoconsumo',
      'Bold Valor Total',
      'Bold Retefuente',
      'Bold ReteIVA',
      'Bold ReteICA',
      'Bold Comisión %',
      'Bold Comisión Fija',
      'Bold Total Deducción',
      'Bold Depósito',
      'Bold Banco',
      'Bold Franquicia',
      'Bold País Tarjeta',
      'Diferencia Total',
    ] : [];

    const headers = [...baseHeaders, ...adminHeaders, 'Nombre del Evento'];

    const rows = completeTransactions.map(t => {
      const baseRow = [
        t.id,
        t.created_at,
        t.user_fullname || 'N/A',
        t.user_email || 'N/A',
        t.ticket_name,
        t.quantity,
        t.price,
        t.variable_fee,
        t.tax,
        t.total,
        t.status,
        t.type === 'app' ? 'App Móvil' : t.type === 'web' ? 'Sitio Web' : 'Efectivo',
        t.cash ? 'Sí' : 'No',
        t.order_id || 'N/A',
        t.promoter_fullname || 'N/A',
        t.promoter_email || 'N/A',
        t.bold_id || 'N/A',
        t.bold_fecha || 'N/A',
        t.bold_estado || 'N/A',
        t.bold_metodo_pago || 'N/A',
        t.bold_id ? 'Sí' : 'No',
      ];

      const adminRow = isAdmin ? [
        t.bold_valor_compra !== undefined && t.bold_valor_compra !== null ? t.bold_valor_compra : 'N/A',
        t.bold_propina !== undefined && t.bold_propina !== null ? t.bold_propina : 'N/A',
        t.bold_iva !== undefined && t.bold_iva !== null ? t.bold_iva : 'N/A',
        t.bold_impoconsumo !== undefined && t.bold_impoconsumo !== null ? t.bold_impoconsumo : 'N/A',
        t.bold_valor_total !== undefined && t.bold_valor_total !== null ? t.bold_valor_total : 'N/A',
        t.bold_rete_fuente !== undefined && t.bold_rete_fuente !== null ? t.bold_rete_fuente : 'N/A',
        t.bold_rete_iva !== undefined && t.bold_rete_iva !== null ? t.bold_rete_iva : 'N/A',
        t.bold_rete_ica !== undefined && t.bold_rete_ica !== null ? t.bold_rete_ica : 'N/A',
        t.bold_comision_porcentaje !== undefined && t.bold_comision_porcentaje !== null ? t.bold_comision_porcentaje : 'N/A',
        t.bold_comision_fija !== undefined && t.bold_comision_fija !== null ? t.bold_comision_fija : 'N/A',
        t.bold_total_deduccion !== undefined && t.bold_total_deduccion !== null ? t.bold_total_deduccion : 'N/A',
        t.bold_deposito_cuenta !== undefined && t.bold_deposito_cuenta !== null ? t.bold_deposito_cuenta : 'N/A',
        t.bold_banco || 'N/A',
        t.bold_franquicia || 'N/A',
        t.bold_pais_tarjeta || 'N/A',
        // Calculate difference between Hunt total and Bold total (similar to edge function)
        (t.bold_valor_total !== undefined && t.bold_valor_total !== null && t.total !== undefined && t.total !== null)
          ? (parseFloat(String(t.total)) - parseFloat(String(t.bold_valor_total))).toFixed(2)
          : 'N/A',
      ] : [];

      return [...baseRow, ...adminRow, t.event_name || 'N/A'];
    });

    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const csvContent = BOM + [
      headers.join(','),
      ...rows.map(row => row.map(cell => {
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        const cellStr = String(cell);
        if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacciones_${eventName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-4">
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">
                Total Transacciones
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{transactions.length.toLocaleString('es-CO')}</div>
            <p className="text-xs text-white/30">Todas las ventas</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Smartphone className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">
                Por App
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{transactions.filter(t => t.source === 'app').length.toLocaleString('es-CO')}</div>
            <p className="text-xs text-white/30">Aplicación móvil</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">
                Por Web
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{transactions.filter(t => t.source === 'web').length.toLocaleString('es-CO')}</div>
            <p className="text-xs text-white/30">Sitio web</p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Banknote className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">
                En Efectivo
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{transactions.filter(t => t.source === 'cash').length.toLocaleString('es-CO')}</div>
            <p className="text-xs text-white/30">Ventas en efectivo</p>
          </CardContent>
        </Card>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold">Transacciones del Evento</h3>
          <p className="text-xs text-white/40 mt-1">
            {transactions.length.toLocaleString('es-CO')} transaccion{transactions.length !== 1 ? 'es' : ''} registrada{transactions.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleDownloadCSV}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-full transition-all bg-white/90 hover:bg-white text-black border border-white/80"
        >
          Descargar CSV
          <Download className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Transactions Table */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-1">
              No hay transacciones
            </h3>
            <p className="text-sm text-muted-foreground">
              Las transacciones aparecerán aquí cuando se realicen ventas
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Tipo Entrada</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-white/40 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-white/40 uppercase tracking-wider">Cant.</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-white/40 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-white/40 uppercase tracking-wider">Canal</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-white/40 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => handleEdit(transaction.id)}
                    >
                      <td className="px-4 py-3 text-sm">
                        <div className="text-white/90">
                          {new Date(transaction.created_at).toLocaleDateString('es-CO', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                        <div className="text-xs text-white/40">
                          {new Date(transaction.created_at).toLocaleTimeString('es-CO', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/90">
                        {transaction.tickets.name}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {transaction.user ? (
                          <div>
                            <div className="text-white/90">
                              {transaction.user.name} {transaction.user.lastName}
                            </div>
                            <div className="text-xs text-white/40">
                              {transaction.user.email}
                            </div>
                          </div>
                        ) : (
                          <span className="text-white/40">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-center font-medium text-white/90">
                        {transaction.quantity}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium text-white/90">
                        {formatCurrency(transaction.total)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.source === 'app'
                            ? 'bg-purple-500/10 text-purple-400'
                            : transaction.source === 'web'
                            ? 'bg-cyan-500/10 text-cyan-400'
                            : 'bg-green-500/10 text-green-400'
                        }`}>
                          {transaction.source === 'app' ? 'App' : transaction.source === 'web' ? 'Web' : 'Efectivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-white/10"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#202020] border-[#303030]">
                            <DropdownMenuItem
                              onClick={() => handleEdit(transaction.id)}
                              className="cursor-pointer text-sm text-white/90 hover:text-white hover:bg-white/10"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleResendEmail(transaction.id)}
                              className="cursor-pointer text-sm text-white/90 hover:text-white hover:bg-white/10"
                            >
                              <Mail className="mr-2 h-4 w-4" />
                              Reenviar Correo
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction Details Sheet */}
      <Sheet open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <SheetContent side="right" className="w-full sm:max-w-2xl p-0 bg-[#101010] border-l border-[#303030] overflow-hidden">
          <SheetHeader className="px-6 py-6 border-b border-[#303030] sticky top-0 z-10 bg-[#101010]">
            <SheetTitle className="text-xl font-bold text-white">Detalles de Transacción</SheetTitle>
            <SheetClose className="absolute right-4 top-4" />
          </SheetHeader>

          {selectedTransaction && (
            <div className="overflow-y-auto h-[calc(100vh-80px)]">
              <div className="p-6 space-y-6">
                {/* Cliente Card */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">👤 Cliente</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Nombre</p>
                      <p className="text-sm text-white font-medium">{selectedTransaction.user_fullname}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">Email</p>
                      <p className="text-sm text-white/90 break-all">{selectedTransaction.user_email}</p>
                    </div>
                  </div>
                </div>

                {/* Entrada Card */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">🎫 Entrada</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Tipo</p>
                      <p className="text-sm text-white font-medium">{selectedTransaction.ticket_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">Cantidad</p>
                      <p className="text-sm text-white font-medium">{selectedTransaction.quantity.toLocaleString('es-CO')}</p>
                    </div>
                  </div>
                </div>

                {/* Detalles Financieros */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">💰 Detalles Financieros</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-xs text-white/40">Precio Unitario</span>
                      <span className="text-sm text-white font-medium">{formatCurrency(selectedTransaction.price)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-xs text-white/40">Cantidad</span>
                      <span className="text-sm text-white font-medium">{selectedTransaction.quantity}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-xs text-white/40">Comisión Hunt</span>
                      <span className="text-sm text-orange-400 font-medium">{formatCurrency(selectedTransaction.variable_fee)}</span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-white/5">
                      <span className="text-xs text-white/40">Impuesto</span>
                      <span className="text-sm text-blue-400 font-medium">{formatCurrency(selectedTransaction.tax)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-sm text-white font-semibold">Total</span>
                      <span className="text-lg text-green-400 font-bold">{formatCurrency(selectedTransaction.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Información de Transacción */}
                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">📋 Transacción</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-white/40 mb-1">ID Transacción</p>
                      <p className="text-xs text-white/90 font-mono bg-white/5 rounded p-2 break-all">{selectedTransaction.order_id}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-white/40 mb-1">Estado</p>
                        <div className="inline-block px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-medium">
                          {selectedTransaction.status}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Canal</p>
                        <div className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium ${
                          selectedTransaction.type === 'app'
                            ? 'bg-purple-500/20 text-purple-300'
                            : selectedTransaction.type === 'web'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-green-500/20 text-green-300'
                        }`}>
                          {selectedTransaction.type}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">Fecha</p>
                      <p className="text-sm text-white">{new Date(selectedTransaction.created_at).toLocaleString('es-CO')}</p>
                    </div>
                  </div>
                </div>

                {/* Información del Promotor */}
                {selectedTransaction.promoter_fullname && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">👨‍💼 Promotor</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-white/40 mb-1">Nombre</p>
                        <p className="text-sm text-white font-medium">{selectedTransaction.promoter_fullname}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 mb-1">Email</p>
                        <p className="text-sm text-white/90 break-all">{selectedTransaction.promoter_email}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Bold Information */}
                {isAdmin && selectedTransaction.bold_id && (
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-white uppercase tracking-wider">💳 Pago (Bold)</h3>
                    <div className="space-y-3">
                      {selectedTransaction.bold_id && (
                        <div>
                          <p className="text-xs text-white/40 mb-1">ID Bold</p>
                          <p className="text-xs text-white/90 font-mono bg-white/5 rounded p-2 break-all">{selectedTransaction.bold_id}</p>
                        </div>
                      )}
                      {selectedTransaction.bold_estado && (
                        <div>
                          <p className="text-xs text-white/40 mb-1">Estado</p>
                          <p className="text-sm text-white">{selectedTransaction.bold_estado}</p>
                        </div>
                      )}
                      {selectedTransaction.bold_metodo_pago && (
                        <div>
                          <p className="text-xs text-white/40 mb-1">Método de Pago</p>
                          <p className="text-sm text-white">{selectedTransaction.bold_metodo_pago}</p>
                        </div>
                      )}
                      {selectedTransaction.bold_fecha && (
                        <div>
                          <p className="text-xs text-white/40 mb-1">Fecha</p>
                          <p className="text-sm text-white">{selectedTransaction.bold_fecha}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pb-6" />
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
