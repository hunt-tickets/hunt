"use client";

import { useState, useMemo } from "react";
import { authClient } from "@/lib/auth-client";
import type { TicketType } from "@/lib/schema";
import { TicketQuantitySelector } from "./ticket-quantity-selector";
import { BuyTicketsButton } from "./buy-tickets-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import TicketSummaryDrawer from "./ticket-summary-drawer";
import { Checkbox } from "./ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface TicketsContainerProps {
  tickets: TicketType[];
  eventId: string;
  variableFee?: number;
}

export function TicketsContainer({
  tickets,
  eventId,
  variableFee,
}: TicketsContainerProps) {
  const [ticketSelections, setTicketSelections] = useState<
    Record<string, number>
  >({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showSummaryDrawer, setShowSummaryDrawer] = useState(false);
  const router = useRouter();

  // Get session from Better Auth
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const handleQuantityChange = (ticketId: string, quantity: number) => {
    setTicketSelections((prev) => ({
      ...prev,
      [ticketId]: quantity,
    }));
  };

  const handlePurchase = async (selections: Record<string, number>) => {
    // Check if user is authenticated
    if (!user) {
      // Show auth required dialog instead of redirecting
      setShowAuthDialog(true);
      return;
    }
    console.log("Tiquetes seleccionados: ", selections);

    // Show summary drawer with order details
    setShowSummaryDrawer(true);
  };

  /**
   * Calculate total price across all selected tickets
   * Used for displaying cart total to user
   */
  const totalPrice = Object.entries(ticketSelections).reduce(
    (sum, [ticketId, quantity]) => {
      const ticket = tickets.find((t) => t.id === ticketId);
      const price = ticket?.price ? parseFloat(ticket.price) : 0;
      return sum + price * quantity;
    },
    0
  );

  /**
   * Prepare tickets with count for summary drawer
   * Memoized to prevent unnecessary re-renders
   */
  const ticketsWithCount = useMemo(
    () =>
      tickets.map((ticket) => ({
        ...ticket, // All original ticket fields (id, name, price, description)
        count: ticketSelections[ticket.id] || 0, // ADD count field
      })),
    [tickets, ticketSelections]
  );

  /**
   * Prepare user data for summary drawer
   * Memoized to prevent unnecessary re-renders
   */
  const userData = useMemo(
    () =>
      user
        ? {
            id: user.id,
            email: user.email || "",
            phone: user.phoneNumber || undefined,
            name: user.name,
            lastName: "", // Better Auth doesn't have lastName in base schema
            document_type_id: "", // Not in Better Auth base schema
            document_id: "", // Not in Better Auth base schema
          }
        : null,
    [user]
  );

  return (
    <>
      {/* Auth Required Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inicia sesión para continuar</DialogTitle>
            <DialogDescription>
              Necesitas iniciar sesión para comprar tickets
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <Button onClick={() => router.push("/sign-in")} className="w-full">
              Iniciar Sesión
            </Button>
            <Button
              onClick={() => router.push("/sign-up")}
              variant="outline"
              className="w-full"
            >
              Crear Cuenta
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Summary Drawer */}
      {userData && (
        <TicketSummaryDrawer
          user={userData}
          eventId={eventId}
          variable_fee={variableFee || 0.05}
          tickets={ticketsWithCount}
          total={totalPrice}
          open={showSummaryDrawer}
          close={() => setShowSummaryDrawer(false)}
        />
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Tickets list */}
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border hover:border-primary/50 transition-colors"
            >
              {/* Ticket info - responsive layout */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg mb-1">
                  {ticket.name}
                </h3>
                {ticket.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                    {ticket.description}
                  </p>
                )}
              </div>

              {/* Price and quantity selector - responsive layout */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                <div className="text-left sm:text-right">
                  <p
                    className="text-lg sm:text-xl lg:text-2xl font-bold"
                    suppressHydrationWarning
                  >
                    ${parseFloat(ticket.price).toLocaleString("es-CO")}
                  </p>
                </div>

                {/* Client island: Quantity selector with local state */}
                <TicketQuantitySelector
                  ticketId={ticket.id}
                  price={parseFloat(ticket.price)}
                  maxQuantity={10}
                  onQuantityChange={handleQuantityChange}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Terms and conditions checkbox */}
        <div className="flex items-start gap-2 sm:gap-3 px-1">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            className="mt-0.5 sm:mt-1"
          />
          <label
            htmlFor="terms"
            className="text-xs sm:text-sm leading-relaxed text-muted-foreground cursor-pointer"
          >
            Acepto las{" "}
            <Link
              href="/terminos-y-condiciones"
              className="text-primary hover:underline font-medium"
              target="_blank"
            >
              condiciones de uso
            </Link>{" "}
            y la{" "}
            <Link
              href="/resources/privacy"
              className="text-primary hover:underline font-medium"
              target="_blank"
            >
              política de privacidad
            </Link>
          </label>
        </div>

        {/* Purchase button with total - another client island */}
        <BuyTicketsButton
          ticketSelections={ticketSelections}
          totalPrice={totalPrice}
          termsAccepted={termsAccepted}
          onPurchase={handlePurchase}
        />
      </div>
    </>
  );
}
