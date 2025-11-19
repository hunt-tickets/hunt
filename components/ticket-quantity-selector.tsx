"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Minus, Plus } from "lucide-react";

interface TicketQuantitySelectorProps {
  ticketId: string;
  price?: number;
  maxQuantity?: number; // Optional: limit how many tickets can be purchased
  onQuantityChange?: (ticketId: string, quantity: number) => void; // Callback to parent
}

/**
 * Client component for selecting ticket quantity
 *
 * This component is isolated as a "client island" to minimize the RSC payload.
 * Only the minimal props (id, price, maxQuantity) are sent over the network,
 * instead of the entire Ticket object.
 *
 * State is managed locally until purchase, keeping the component lightweight.
 */
export function TicketQuantitySelector({
  ticketId,
  // price,
  maxQuantity = 10, // Default max 10 tickets per type
  onQuantityChange,
}: TicketQuantitySelectorProps) {
  // Local state: tracks quantity for this specific ticket
  // Starts at 0 (no tickets selected)
  const [quantity, setQuantity] = useState(0);

  /**
   * Decrease quantity handler
   * Prevents going below 0
   */
  const handleDecrease = () => {
    if (quantity > 0) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      // Notify parent component of the change (for cart calculation)
      onQuantityChange?.(ticketId, newQuantity);
    }
  };

  /**
   * Increase quantity handler
   * Respects maxQuantity limit
   */
  const handleIncrease = () => {
    if (quantity < maxQuantity) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      // Notify parent component of the change (for cart calculation)
      onQuantityChange?.(ticketId, newQuantity);
    }
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      {/* Decrease button - disabled when quantity is 0 */}
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
        onClick={handleDecrease}
        disabled={quantity === 0}
        aria-label="Disminuir cantidad"
      >
        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>

      {/* Quantity display */}
      <div className="flex items-center justify-center min-w-[40px] sm:min-w-[50px]">
        <span className="text-sm sm:text-base font-semibold">{quantity}</span>
      </div>

      {/* Increase button - disabled when at max quantity */}
      <Button
        size="icon"
        variant="outline"
        className="h-7 w-7 sm:h-8 sm:w-8 shrink-0"
        onClick={handleIncrease}
        disabled={quantity >= maxQuantity}
        aria-label="Aumentar cantidad"
      >
        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
}
