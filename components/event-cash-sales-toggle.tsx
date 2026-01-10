"use client";

import { useState, useTransition } from "react";
import { DollarSign, Ban, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventCashSalesToggleProps {
  eventId: string;
  initialCashEnabled: boolean;
  className?: string;
  disabled?: boolean;
  disabledReason?: string;
}

export function EventCashSalesToggle({
  eventId,
  initialCashEnabled,
  className,
  disabled = false,
  disabledReason,
}: EventCashSalesToggleProps) {
  const [cashEnabled, setCashEnabled] = useState(initialCashEnabled);
  const [isPending, startTransition] = useTransition();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (isPending || disabled) return;

    const newCashEnabled = !cashEnabled;
    setIsAnimating(true);

    startTransition(async () => {
      const response = await fetch("/api/events/toggle-cash-sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ eventId, cashEnabled: newCashEnabled }),
      });

      const result = await response.json();

      if (result.success) {
        setCashEnabled(newCashEnabled);
      }
      setTimeout(() => setIsAnimating(false), 300);
    });
  };

  if (isPending && !cashEnabled && !isAnimating) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400 dark:text-white/40" />
        <span className="text-sm text-gray-400 dark:text-white/40">
          Cargando...
        </span>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-3"
      title={disabled ? disabledReason : undefined}
    >
      {/* Status Label */}
      <span
        className={cn(
          "text-sm font-medium transition-colors duration-300",
          disabled
            ? "text-zinc-400 dark:text-white/30"
            : cashEnabled
              ? "text-zinc-900 dark:text-white"
              : "text-zinc-500 dark:text-white/40"
        )}
      >
        {cashEnabled ? "Efectivo Permitido" : "Efectivo Bloqueado"}
      </span>

      <div
        className={cn(
          "relative flex w-20 h-10 p-1 rounded-full transition-all duration-300",
          "bg-zinc-100 border border-zinc-300 dark:bg-zinc-900 dark:border-zinc-700",
          disabled
            ? "opacity-50 cursor-not-allowed"
            : "cursor-pointer hover:bg-zinc-200 dark:hover:bg-zinc-800",
          isPending && "opacity-60 cursor-not-allowed",
          className
        )}
        onClick={handleToggle}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
        aria-label={
          disabled
            ? disabledReason
            : `Cambiar ventas en efectivo a ${cashEnabled ? "bloqueado" : "permitido"}`
        }
        aria-pressed={cashEnabled}
        aria-disabled={disabled}
      >
        {/* Background icons - always visible */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
          <div className="flex justify-center items-center w-8 h-8">
            <DollarSign
              className={cn(
                "w-4 h-4 transition-all duration-300",
                cashEnabled
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-400 dark:text-zinc-600",
                isAnimating && cashEnabled && "rotate-12 scale-110"
              )}
              strokeWidth={1.5}
            />
          </div>
          <div className="flex justify-center items-center w-8 h-8">
            <Ban
              className={cn(
                "w-4 h-4 transition-all duration-300",
                cashEnabled
                  ? "text-zinc-400 dark:text-zinc-600"
                  : "text-zinc-900 dark:text-white",
                isAnimating && !cashEnabled && "rotate-90 scale-110"
              )}
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Sliding circle with active icon */}
        <div
          className={cn(
            "absolute flex justify-center items-center w-8 h-8 rounded-full transition-all duration-300 ease-in-out shadow-sm",
            cashEnabled
              ? "left-1 bg-zinc-700 dark:bg-zinc-300"
              : "left-[calc(100%-2.25rem)] bg-zinc-400 dark:bg-zinc-600",
            isAnimating && "scale-110"
          )}
        >
          {isPending ? (
            <Loader2
              className="w-4 h-4 text-white dark:text-zinc-900 animate-spin"
              strokeWidth={2}
            />
          ) : cashEnabled ? (
            <DollarSign
              className={cn(
                "w-4 h-4 text-white dark:text-zinc-900 transition-all duration-300",
                isAnimating && "rotate-12"
              )}
              strokeWidth={2}
            />
          ) : (
            <Ban
              className={cn(
                "w-4 h-4 text-white transition-all duration-300",
                isAnimating && "rotate-90"
              )}
              strokeWidth={2}
            />
          )}
        </div>
      </div>
    </div>
  );
}
