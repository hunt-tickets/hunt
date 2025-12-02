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
import type { TicketType } from "@/lib/schema";
import { translateError } from "@/lib/error-messages";

interface TicketWithCount extends TicketType {
  count: number;
}

// Simplified user type for checkout - only fields we actually need
interface CheckoutUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
}

interface TicketSummaryDrawerProps {
  user: CheckoutUser;
  eventId: string;
  tickets: TicketWithCount[];
  total: number;
  open: boolean;
  close: () => void;
}

const TicketSummaryDrawer: React.FC<TicketSummaryDrawerProps> = ({
  user,
  eventId,
  tickets,
  total,
  close,
  open,
}) => {
  if (!user) {
    console.log(
      "userId not passed as prop; can't trust the User is signed-in."
    );
    close();
  }
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);


  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    const items = tickets
      .filter((t) => t.count > 0)
      .map((t) => ({ ticket_type_id: t.id, quantity: t.count }));

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, items }),
      });

      const response = await res.json();

      if (!response.success || !response.checkoutUrl) {
        setError(translateError(response.error || "Error al procesar el pago"));
        setIsProcessing(false);
        return;
      }

      // Redirect to MercadoPago checkout
      window.location.href = response.checkoutUrl;
    } catch (error) {
      console.error("Payment error:", error);
      setError(
        translateError(
          error instanceof Error
            ? error.message
            : "Error al procesar el pago. Por favor intenta nuevamente."
        )
      );
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
                      $
                      {(ticket.count * parseFloat(ticket.price)).toLocaleString(
                        "es-CO"
                      )}
                    </span>
                  </div>
                )
            )}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between">
              <span className="text-lg font-bold">Total</span>
              <span
                className="text-lg font-bold text-primary"
                suppressHydrationWarning
              >
                ${total.toLocaleString("es-CO")}
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
