"use client";

import { useState, useTransition } from "react";
import { toggleEventStatus } from "@/lib/supabase/actions/events";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventStatusToggleProps {
  eventId: string;
  initialStatus: boolean;
  className?: string;
}

export function EventStatusToggle({ eventId, initialStatus, className }: EventStatusToggleProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (isPending) return;

    const newStatus = !status;
    setIsAnimating(true);

    startTransition(async () => {
      const result = await toggleEventStatus(eventId, newStatus);
      if (result.success) {
        setStatus(newStatus);
      }
      setTimeout(() => setIsAnimating(false), 300);
    });
  };

  if (isPending && !status && !isAnimating) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400 dark:text-white/40" />
        <span className="text-sm text-gray-400 dark:text-white/40">Cargando...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Status Label */}
      <span className={cn(
        "text-sm font-medium transition-colors duration-300",
        status
          ? "text-zinc-900 dark:text-white"
          : "text-zinc-500 dark:text-white/40"
      )}>
        {status ? "Activo" : "Inactivo"}
      </span>

      <div
        className={cn(
          "relative flex w-20 h-10 p-1 rounded-full cursor-pointer transition-all duration-300",
          "bg-zinc-100 border border-zinc-300 hover:bg-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800",
          isPending && "opacity-60 cursor-not-allowed",
          className
        )}
        onClick={handleToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleToggle();
          }
        }}
        aria-label={`Cambiar evento a ${status ? "inactivo" : "activo"}`}
        aria-pressed={status}
      >
        {/* Background icons - always visible */}
        <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none">
          <div className="flex justify-center items-center w-8 h-8">
            <CheckCircle
              className={cn(
                "w-4 h-4 transition-all duration-300",
                status
                  ? "text-zinc-900 dark:text-white"
                  : "text-zinc-400 dark:text-zinc-600",
                isAnimating && status && "rotate-12 scale-110"
              )}
              strokeWidth={1.5}
            />
          </div>
          <div className="flex justify-center items-center w-8 h-8">
            <XCircle
              className={cn(
                "w-4 h-4 transition-all duration-300",
                status
                  ? "text-zinc-400 dark:text-zinc-600"
                  : "text-zinc-900 dark:text-white",
                isAnimating && !status && "rotate-90 scale-110"
              )}
              strokeWidth={1.5}
            />
          </div>
        </div>

        {/* Sliding circle with active icon */}
        <div
          className={cn(
            "absolute flex justify-center items-center w-8 h-8 rounded-full transition-all duration-300 ease-in-out shadow-sm",
            status
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
          ) : status ? (
            <CheckCircle
              className={cn(
                "w-4 h-4 text-white dark:text-zinc-900 transition-all duration-300",
                isAnimating && "rotate-12"
              )}
              strokeWidth={2}
            />
          ) : (
            <XCircle
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
