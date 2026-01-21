"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { ShoppingCart } from "lucide-react";

interface BuyTicketsButtonProps {
  ticketSelections: Record<string, number>;
  totalPrice?: number;
  termsAccepted: boolean;
  onPurchase: (selections: Record<string, number>) => void;
}

export function BuyTicketsButton({
  ticketSelections,
  totalPrice = 0,
  termsAccepted,
  onPurchase,
}: BuyTicketsButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const totalTickets = Object.values(ticketSelections).reduce(
    (sum, qty) => sum + qty,
    0,
  );

  /**
   * Handle purchase click
   * - Validates that at least one ticket is selected
   * - Sets loading state during async operation
   * - Calls parent's purchase handler
   */
  const handlePurchase = async () => {
    if (totalTickets === 0) return;

    setIsLoading(true);
    try {
      // Filter out tickets with 0 quantity before sending to purchase handler
      const validSelections = Object.fromEntries(
        Object.entries(ticketSelections).filter(([, qty]) => qty > 0),
      );

      await onPurchase(validSelections);
    } catch (error) {
      console.error("Error purchasing tickets:", error);
      // TODO: Show error toast/notification to user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Total price display - only shown when tickets are selected */}
      {totalPrice > 0 && (
        <div className="flex items-center justify-between px-2 sm:px-4 py-2">
          <span className="text-sm sm:text-base font-medium text-muted-foreground">
            Total
          </span>
          <span
            className="text-xl sm:text-2xl lg:text-3xl font-bold"
            suppressHydrationWarning
          >
            ${totalPrice.toLocaleString("es-CO")}
          </span>
        </div>
      )}

      {/* Purchase button - disabled if terms not accepted or no tickets */}
      <Button
        size="lg"
        className="w-full text-sm sm:text-base h-11 sm:h-12 lg:h-14"
        onClick={handlePurchase}
        disabled={totalTickets === 0 || !termsAccepted || isLoading}
      >
        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
        <span className="truncate">
          {isLoading
            ? "Procesando..."
            : totalTickets === 0
              ? "Selecciona tickets"
              : !termsAccepted
                ? "Acepta los términos"
                : `Comprar (${totalTickets} ${totalTickets === 1 ? "ticket" : "tickets"})`}
        </span>
      </Button>
    </div>
  );
}
