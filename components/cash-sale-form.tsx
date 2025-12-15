"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FormInput } from "@/components/ui/form-input";
import { Minus, Plus, Loader2, CheckCircle, AlertCircle, Mail, Ticket, Info, CreditCard, UserCheck } from "lucide-react";
import { translateError } from "@/lib/error-messages";

interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number;
  minPerOrder: number;
  maxPerOrder: number;
}

interface CashSaleFormProps {
  eventId: string;
  ticketTypes: TicketType[];
}

export function CashSaleForm({ eventId, ticketTypes }: CashSaleFormProps) {
  const [email, setEmail] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    orderId?: string;
  } | null>(null);

  const updateQuantity = (ticketTypeId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[ticketTypeId] || 0;
      const ticketType = ticketTypes.find((t) => t.id === ticketTypeId);
      if (!ticketType) return prev;

      const newValue = Math.max(0, Math.min(current + delta, ticketType.available, ticketType.maxPerOrder));

      if (newValue === 0) {
        const { [ticketTypeId]: _removed, ...rest } = prev;
        void _removed;
        return rest;
      }

      return { ...prev, [ticketTypeId]: newValue };
    });
  };

  const totalAmount = Object.entries(quantities).reduce((sum, [id, qty]) => {
    const ticketType = ticketTypes.find((t) => t.id === id);
    return sum + (ticketType?.price || 0) * qty;
  }, 0);

  const totalTickets = Object.values(quantities).reduce((sum, qty) => sum + qty, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (!email.trim()) {
      setResult({ success: false, message: "Ingresa el email del comprador" });
      return;
    }

    if (totalTickets === 0) {
      setResult({ success: false, message: "Selecciona al menos un ticket" });
      return;
    }

    setIsLoading(true);

    try {
      const items = Object.entries(quantities)
        .filter(([, qty]) => qty > 0)
        .map(([ticket_type_id, quantity]) => ({
          ticket_type_id,
          quantity,
        }));

      const response = await fetch("/api/cash-sale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          items,
          buyerEmail: email.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: `¡Venta exitosa! ${data.tickets_count} ticket(s) asignados a ${data.buyer.email}`,
          orderId: data.order_id,
        });
        // Reset form
        setEmail("");
        setQuantities({});
      } else {
        setResult({ success: false, message: translateError(data.error) });
      }
    } catch {
      setResult({
        success: false,
        message: translateError("Error al procesar la venta. Intenta de nuevo."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Form */}
      <div className="lg:col-span-2">
        {/* Result Message */}
        {result && (
          <div
            className={`mb-6 p-4 rounded-xl flex items-start gap-3 border ${
              result.success
                ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
                : "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
            }`}
          >
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={result.success ? "text-green-800 dark:text-green-200 font-medium" : "text-red-800 dark:text-red-200 font-medium"}>
                {result.message}
              </p>
              {result.orderId && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  ID de orden: {result.orderId.slice(0, 8).toUpperCase()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Single Form Box */}
        <form onSubmit={handleSubmit} className="p-6 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
          {/* Email Input */}
          <div className="space-y-3 pb-6 border-b border-gray-200 dark:border-[#2a2a2a]">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="h-5 w-5 text-gray-600 dark:text-white/60" />
              <h3 className="text-base font-semibold">Datos del comprador</h3>
            </div>
            <FormInput
              id="email"
              type="email"
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              icon={<Mail className="h-4 w-4" />}
              hint="El usuario debe tener una cuenta registrada"
              required
            />
          </div>

          {/* Ticket Selection */}
          <div className="space-y-3 py-6 border-b border-gray-200 dark:border-[#2a2a2a]">
            <div className="flex items-center gap-2 mb-4">
              <Ticket className="h-5 w-5 text-gray-600 dark:text-white/60" />
              <h3 className="text-base font-semibold">Seleccionar entradas</h3>
            </div>

            <div className="space-y-3">
              {ticketTypes.length === 0 ? (
                <div className="text-center py-12 rounded-lg border border-dashed border-gray-300 dark:border-[#2a2a2a]">
                  <Ticket className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-white/50">
                    No hay tipos de tickets disponibles
                  </p>
                </div>
              ) : (
                ticketTypes.map((ticketType) => {
                  const quantity = quantities[ticketType.id] || 0;
                  const isAvailable = ticketType.available > 0;

                  return (
                    <div
                      key={ticketType.id}
                      className={`flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#202020] ${
                        !isAvailable ? "opacity-50" : ""
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-sm">{ticketType.name}</span>
                          {!isAvailable && (
                            <Badge variant="secondary" className="text-xs">
                              Agotado
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-white/50">
                          <span className="font-medium">${ticketType.price.toLocaleString('es-CO')}</span>
                          <span>•</span>
                          <span>{ticketType.available} disponibles</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-md"
                          onClick={() => updateQuantity(ticketType.id, -1)}
                          disabled={!isAvailable || quantity === 0 || isLoading}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center font-bold text-base">{quantity}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-md"
                          onClick={() => updateQuantity(ticketType.id, 1)}
                          disabled={
                            !isAvailable ||
                            quantity >= ticketType.available ||
                            quantity >= ticketType.maxPerOrder ||
                            isLoading
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Summary & Submit */}
          <div className="pt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-600 dark:text-white/60 mb-1">Total a cobrar</p>
                <p className="text-3xl font-bold">
                  ${totalAmount.toLocaleString('es-CO')}{" "}
                  <span className="text-base font-normal text-gray-500 dark:text-white/50">COP</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-white/60 mt-1">
                  {totalTickets} entrada{totalTickets !== 1 ? "s" : ""} seleccionada{totalTickets !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading || totalTickets === 0 || !email.trim()}
              className="w-full bg-gray-900 hover:bg-black text-white dark:bg-white/90 dark:hover:bg-white dark:text-black"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando venta...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Completar Venta en Efectivo
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Right Column - Instructions */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-4">
          {/* Instructions Card */}
          <div className="p-6 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
            <div className="flex items-center gap-2 mb-4">
              <Info className="h-5 w-5 text-gray-600 dark:text-white/60" />
              <h3 className="text-base font-semibold">Instrucciones</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 dark:bg-white/90 text-white dark:text-black flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Verifica el email</p>
                    <p className="text-xs text-gray-600 dark:text-white/50 mt-1">
                      Asegúrate que el comprador tenga una cuenta registrada en la plataforma
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 dark:bg-white/90 text-white dark:text-black flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Selecciona las entradas</p>
                    <p className="text-xs text-gray-600 dark:text-white/50 mt-1">
                      Elige el tipo y cantidad de entradas que el cliente desea comprar
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 dark:bg-white/90 text-white dark:text-black flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Cobra el efectivo</p>
                    <p className="text-xs text-gray-600 dark:text-white/50 mt-1">
                      Verifica el monto total y recibe el pago en efectivo antes de completar la venta
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-900 dark:bg-white/90 text-white dark:text-black flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                  <div>
                    <p className="text-sm font-medium">Completa la venta</p>
                    <p className="text-xs text-gray-600 dark:text-white/50 mt-1">
                      Las entradas se asignarán automáticamente al email del comprador
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Important Note */}
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30">
            <div className="flex items-start gap-3">
              <UserCheck className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Importante
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                  El comprador recibirá las entradas en su cuenta y podrá verlas en su perfil inmediatamente.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
