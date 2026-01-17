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
import { BillingInfoDialog, type BillingInfo } from "@/components/billing-info-dialog";

interface TicketWithCount extends TicketType {
  count: number;
}

// Extended user type for checkout with billing fields
interface CheckoutUser {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  tipoPersona?: string | null;
  documentTypeId?: string | null;
  documentId?: string | null;
  nombres?: string | null;
  apellidos?: string | null;
  razonSocial?: string | null;
  nit?: string | null;
}

interface TicketSummaryDrawerProps {
  user: CheckoutUser;
  eventId: string;
  tickets: TicketWithCount[];
  total: number;
  open: boolean;
  close: () => void;
  documentTypes: Array<{ id: string; name: string }>;
}

const TicketSummaryDrawer: React.FC<TicketSummaryDrawerProps> = ({
  user,
  eventId,
  tickets,
  total,
  close,
  open,
  documentTypes,
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
  const [showBillingDialog, setShowBillingDialog] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);

  // Step 1: Create reservation (locks tickets)
  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    const items = tickets
      .filter((t) => t.count > 0)
      .map((t) => ({ ticket_type_id: t.id, quantity: t.count }));

    try {
      const res = await fetch("/api/checkout/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, items }),
      });

      const response = await res.json();

      if (!response.success || !response.reservation) {
        setError(translateError(response.error || "Error al crear la reserva"));
        setIsProcessing(false);
        return;
      }

      // Save reservation ID and show billing dialog
      setReservationId(response.reservation.id);
      setShowBillingDialog(true);
      setIsProcessing(false);
    } catch (error) {
      console.error("Reservation error:", error);
      setError(
        translateError(
          error instanceof Error
            ? error.message
            : "Error al crear la reserva. Por favor intenta nuevamente."
        )
      );
      setIsProcessing(false);
    }
  };

  // Step 2: Submit billing info and create MercadoPago checkout
  const handleBillingSubmit = async (billingInfo: BillingInfo) => {
    if (!reservationId) {
      setError("No se encontró la reserva");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const items = tickets
      .filter((t) => t.count > 0)
      .map((t) => ({ ticket_type_id: t.id, quantity: t.count }));

    try {
      const res = await fetch("/api/checkout/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId,
          eventId,
          items,
          billingInfo,
        }),
      });

      const response = await res.json();

      if (!response.success || !response.checkoutUrl) {
        setError(translateError(response.error || "Error al procesar el pago"));
        setIsProcessing(false);
        setShowBillingDialog(false);
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
      setShowBillingDialog(false);
    }
  };

  const handleBillingClose = () => {
    setShowBillingDialog(false);
    setIsProcessing(false);
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

      {/* Billing Information Dialog */}
      <BillingInfoDialog
        open={showBillingDialog}
        onClose={handleBillingClose}
        onSubmit={handleBillingSubmit}
        isProcessing={isProcessing}
        defaultValues={{
          tipoPersona: user.tipoPersona,
          documentTypeId: user.documentTypeId,
          documentId: user.documentId,
          nombres: user.nombres,
          apellidos: user.apellidos,
          razonSocial: user.razonSocial,
          nit: user.nit,
          email: user.email,
        }}
        documentTypes={documentTypes}
      />
    </Drawer>
  );
};

export default TicketSummaryDrawer;
