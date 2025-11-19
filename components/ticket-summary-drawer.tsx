"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Ticket } from "@/lib/supabase/types";
import { useBoldCheckout } from "@/hooks/useBoldCheckout";

interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  lastName?: string;
  document_type_id?: string;
  document_id?: string;
}

interface TicketWithCount extends Ticket {
  count: number;
}

interface TicketSummaryDrawerProps {
  user: User;
  eventId: string;
  variable_fee: number;
  tickets: TicketWithCount[];
  total: number;
  open: boolean;
  close: () => void;
  sellerUid?: string;
}

const TicketSummaryDrawer: React.FC<TicketSummaryDrawerProps> = ({
  variable_fee,
  tickets,
  total,
  open,
  close,
  eventId,
  sellerUid,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const serviceFee = total * (variable_fee ?? 0.16);
  const iva = serviceFee * 0.19;
  const finalTotal = Math.ceil(total + serviceFee + iva);

  const { openCheckout } = useBoldCheckout();

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create ticket selections object from tickets array
      const ticketSelections: Record<string, number> = {};
      tickets.forEach((ticket) => {
        if (ticket.count > 0) {
          ticketSelections[ticket.id] = ticket.count;
        }
      });

      // Call API route to create transaction
      const response = await fetch("/api/transactions/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          ticketSelections,
          variableFee: variable_fee,
          sellerUid,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success || !result.boldCheckoutData) {
        throw new Error(result.error || "Error al crear la transacción");
      }
      console.log(result)

      // Open Bold checkout with server-generated data
      await openCheckout(result.boldCheckoutData);

      // Close the drawer after opening checkout
      close();
    } catch (err) {
      console.error("Error al procesar el pago:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error al procesar el pago. Por favor intenta nuevamente."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <Drawer
      open={open}
      onOpenChange={(isOpen) => !isOpen && close()}
      direction={isMobile ? "bottom" : "right"}
    >
      <DrawerContent className="dark:bg-zinc-900">
        <DrawerHeader>
          <DrawerTitle>Resumen de la compra</DrawerTitle>
          <DrawerDescription>Detalles del pedido</DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {tickets.map(
              (ticket, index) =>
                ticket.count > 0 && (
                  <div key={index} className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {ticket.count}x {ticket.name}
                    </span>
                    <span
                      className="text-sm font-semibold"
                      suppressHydrationWarning
                    >
                      ${(ticket.count * ticket.price).toLocaleString("es-CO")}
                    </span>
                  </div>
                )
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Carrito de compra
              </span>
              <span className="text-sm font-semibold" suppressHydrationWarning>
                ${total.toLocaleString("es-CO")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Tarifa de servicio
              </span>
              <span className="text-sm font-semibold" suppressHydrationWarning>
                ${Math.round(serviceFee).toLocaleString("es-CO")}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">IVA (19%)</span>
              <span className="text-sm font-semibold" suppressHydrationWarning>
                ${Math.round(iva).toLocaleString("es-CO")}
              </span>
            </div>

            <div className="flex justify-between pt-2 border-t">
              <span className="text-lg font-bold">Total</span>
              <span
                className="text-lg font-bold text-primary"
                suppressHydrationWarning
              >
                ${finalTotal.toLocaleString("es-CO")}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-2">
            Al presionar pagar se generará un enlace de pago válido por 10
            minutos. Si expira, se deberá generar una nueva orden.
          </p>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-destructive text-sm text-center">{error}</p>
            </div>
          )}
        </div>

        <DrawerFooter>
          <Button
            className="w-full"
            onClick={handlePayment}
            disabled={isProcessing}
            size="lg"
          >
            {isProcessing ? "Procesando..." : "Proceder al pago"}
          </Button>
          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Cancelar
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default TicketSummaryDrawer;
