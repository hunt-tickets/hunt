"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, Plus, Calendar, CreditCard, FileText, AlertCircle, Pencil, ArrowDown, ArrowUp, MinusCircle } from "lucide-react";
import { useState } from "react";
import { AddAdvanceDialog } from "@/components/add-advance-dialog";
import { EditAdvanceDialog } from "@/components/edit-advance-dialog";

interface Advance {
  id: string;
  amount: number;
  concept: string;
  payment_date: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  file: string | null;
  event_id: string;
  debt: boolean;
}

interface EventAdvancesContentProps {
  eventId: string;
  advances: Advance[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  financialReport: any;
}

export function EventAdvancesContent({
  eventId,
  advances,
  financialReport,
}: EventAdvancesContentProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAdvance, setEditingAdvance] = useState<Advance | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Calculate totals with T-account logic
  const totalPayments = advances
    .filter(adv => !adv.debt)
    .reduce((sum, adv) => sum + adv.amount, 0);

  const totalDebts = advances
    .filter(adv => adv.debt)
    .reduce((sum, adv) => sum + adv.amount, 0);

  const totalAdvances = totalPayments - totalDebts; // Net advances paid
  const settlementAmount = financialReport?.settlement_amount || 0;
  const remainingBalance = settlementAmount - totalAdvances;
  const advancePercentage = settlementAmount > 0 ? (totalAdvances / settlementAmount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">A Liquidar</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(settlementAmount)}
            </div>
            <p className="text-xs text-white/30">
              Total del evento
            </p>
          </CardContent>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ArrowDown className="h-3.5 w-3.5 text-green-400" />
              <span className="text-xs text-green-400/60 uppercase tracking-wider">Pagos</span>
            </div>
            <div className="text-2xl font-bold mb-1 text-green-400">
              {formatCurrency(totalPayments)}
            </div>
            <p className="text-xs text-green-400/40">
              {advances.filter(a => !a.debt).length} pago{advances.filter(a => !a.debt).length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-red-500/5 border-red-500/20">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUp className="h-3.5 w-3.5 text-red-400" />
              <span className="text-xs text-red-400/60 uppercase tracking-wider">Saldos a Favor</span>
            </div>
            <div className="text-2xl font-bold mb-1 text-red-400">
              {formatCurrency(totalDebts)}
            </div>
            <p className="text-xs text-red-400/40">
              {advances.filter(a => a.debt).length} registro{advances.filter(a => a.debt).length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <MinusCircle className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Neto Pagado</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(totalAdvances)}
            </div>
            <p className="text-xs text-white/30">
              Pagos - Saldos a Favor
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Saldo Pendiente</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {formatCurrency(remainingBalance)}
            </div>
            <p className="text-xs text-white/30">
              Por liquidar
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/[0.02] border-white/5">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">% Adelantado</span>
            </div>
            <div className="text-2xl font-bold mb-1">
              {advancePercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-white/30">
              Del total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="bg-white/[0.02] border-white/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Progreso de Liquidación</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-white/60">Avances</span>
              <span className="font-bold">{formatCurrency(totalAdvances)}</span>
            </div>
            <div className="relative h-8 bg-white/5 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-white/20 rounded-full transition-all duration-1000 flex items-center justify-end pr-3"
                style={{ width: `${Math.min(advancePercentage, 100)}%` }}
              >
                {advancePercentage >= 10 && (
                  <span className="text-xs font-bold text-white">
                    {advancePercentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-xs text-white/40">
              <span>$0</span>
              <span>{formatCurrency(settlementAmount / 4)}</span>
              <span>{formatCurrency(settlementAmount / 2)}</span>
              <span>{formatCurrency((settlementAmount * 3) / 4)}</span>
              <span>{formatCurrency(settlementAmount)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advances List */}
      <Card className="bg-white/[0.02] border-white/5">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Historial de Avances</CardTitle>
            <button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
            >
              <Plus className="h-4 w-4" />
              Nuevo
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {advances.length === 0 ? (
            <div className="py-12 text-center">
              <DollarSign className="h-12 w-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No hay avances registrados
              </h3>
              <p className="text-sm text-white/40 mb-4">
                Registra los anticipos de pago realizados al productor
              </p>
              <button
                onClick={() => setIsAddDialogOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
              >
                <Plus className="h-4 w-4" />
                Registrar Primer Avance
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {advances.map((advance) => (
                <div
                  key={advance.id}
                  className={`p-4 rounded-lg border hover:border-white/10 transition-colors ${
                    advance.debt
                      ? 'bg-red-500/5 border-red-500/20'
                      : 'bg-white/[0.02] border-white/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          advance.debt
                            ? 'bg-red-500/10'
                            : 'bg-green-500/10'
                        }`}>
                          {advance.debt ? (
                            <ArrowUp className="h-4 w-4 text-red-400" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-green-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{advance.concept}</h4>
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              advance.debt
                                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                : 'bg-green-500/10 text-green-400 border border-green-500/20'
                            }`}>
                              {advance.debt ? 'Saldo a Favor' : 'Pago'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-white/40 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(advance.payment_date)}
                            </div>
                            <div className="flex items-center gap-1">
                              <CreditCard className="h-3 w-3" />
                              {advance.payment_method}
                            </div>
                          </div>
                        </div>
                      </div>
                      {advance.notes && (
                        <p className="text-xs text-white/40 ml-12 mt-1">
                          <span className="font-medium">Notas:</span> {advance.notes}
                        </p>
                      )}
                      {advance.file && (
                        <p className="text-xs text-white/40 ml-12 mt-1">
                          <span className="font-medium">Archivo:</span> {advance.file}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`text-xl font-bold ${
                          advance.debt ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {advance.debt ? '-' : ''}{formatCurrency(advance.amount)}
                        </div>
                        <div className="text-xs text-white/30 mt-1">
                          {new Date(advance.created_at).toLocaleDateString("es-CO", {
                            day: "2-digit",
                            month: "short",
                          })}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingAdvance(advance)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Warning if over-advanced */}
      {remainingBalance < 0 && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/20">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm text-red-400">
                  Avances Exceden Liquidación
                </h4>
                <p className="text-xs text-red-300/80 mt-1">
                  Los avances pagados ({formatCurrency(totalAdvances)}) superan el monto a liquidar ({formatCurrency(settlementAmount)})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Advance Dialog */}
      <AddAdvanceDialog
        eventId={eventId}
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
      />

      {/* Edit Advance Dialog */}
      <EditAdvanceDialog
        advance={editingAdvance}
        isOpen={!!editingAdvance}
        onClose={() => setEditingAdvance(null)}
      />
    </div>
  );
}
