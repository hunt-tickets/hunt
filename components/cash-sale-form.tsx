"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Result Message */}
      {result && (
        <div
          className={`p-4 rounded-lg flex items-start gap-3 ${
            result.success
              ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
          }`}
        >
          {result.success ? (
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className={result.success ? "text-green-800 dark:text-green-200" : "text-red-800 dark:text-red-200"}>
              {result.message}
            </p>
            {result.orderId && (
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Orden: {result.orderId.slice(0, 8).toUpperCase()}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Email Input */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Datos del comprador</CardTitle>
          <CardDescription>
            El usuario debe tener una cuenta registrada
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="email">Email del comprador</Label>
            <Input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ticket Types */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Seleccionar tickets</CardTitle>
          <CardDescription>
            Elige la cantidad de cada tipo de entrada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ticketTypes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No hay tipos de tickets disponibles
            </p>
          ) : (
            ticketTypes.map((ticketType) => {
              const quantity = quantities[ticketType.id] || 0;
              const isAvailable = ticketType.available > 0;

              return (
                <div
                  key={ticketType.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    !isAvailable ? "opacity-50" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{ticketType.name}</span>
                      {!isAvailable && (
                        <Badge variant="secondary" className="text-xs">
                          Agotado
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                      <span>${ticketType.price.toLocaleString()} COP</span>
                      <span>•</span>
                      <span>{ticketType.available} disponibles</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(ticketType.id, -1)}
                      disabled={!isAvailable || quantity === 0 || isLoading}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center font-medium">{quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(ticketType.id, 1)}
                      disabled={
                        !isAvailable ||
                        quantity >= ticketType.available ||
                        quantity >= ticketType.maxPerOrder ||
                        isLoading
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Summary & Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">
                ${totalAmount.toLocaleString()} COP
              </p>
              <p className="text-sm text-muted-foreground">
                {totalTickets} ticket{totalTickets !== 1 ? "s" : ""}
              </p>
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading || totalTickets === 0 || !email.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Vender"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
