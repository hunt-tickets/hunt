"use client";

import { useState, useMemo, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
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
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventDayDetail, TicketTypeWithDay } from "@/lib/helpers/events";

interface TicketsContainerProps {
  tickets: TicketTypeWithDay[];
  eventId: string;
  eventType?: "single" | "multi_day" | "recurring" | "slots";
  eventDays?: EventDayDetail[];
  documentTypes: Array<{ id: string; name: string }>;
}

export function TicketsContainer({
  tickets,
  eventId,
  eventType = "single",
  eventDays = [],
  documentTypes,
}: TicketsContainerProps) {
  const [ticketSelections, setTicketSelections] = useState<
    Record<string, number>
  >({});
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showSummaryDrawer, setShowSummaryDrawer] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string>("all"); // "all", day id, or "pass"
  const router = useRouter();

  // Get session from Better Auth
  const { data: session } = authClient.useSession();
  const user = session?.user;

  // Check if this is a multi-day event
  const isMultiDay = eventType === "multi_day" && eventDays.length > 0;

  // Check if there are general passes (tickets without a specific day)
  const hasGeneralPasses = tickets.some((t) => !t.eventDayId);

  // Filter tickets based on selected day
  const filteredTickets = useMemo(() => {
    if (!isMultiDay || selectedDay === "all") {
      return tickets;
    }
    if (selectedDay === "pass") {
      return tickets.filter((t) => !t.eventDayId);
    }
    // Show tickets for specific day + general passes
    return tickets.filter((t) => t.eventDayId === selectedDay || !t.eventDayId);
  }, [tickets, selectedDay, isMultiDay]);

  // Get day info for a ticket
  const getDayInfo = useCallback(
    (eventDayId: string | null) => {
      if (!eventDayId) return null;
      return eventDays.find((d) => d.id === eventDayId);
    },
    [eventDays]
  );

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
      tickets.map((ticket) => {
        const dayInfo = getDayInfo(ticket.eventDayId);
        return {
          ...ticket, // All original ticket fields (id, name, price, description)
          count: ticketSelections[ticket.id] || 0, // ADD count field
          // Add day name for display in summary
          dayName:
            dayInfo?.name ||
            (dayInfo
              ? dayInfo.date.toLocaleDateString("es-ES", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })
              : null),
        };
      }),
    [tickets, ticketSelections, getDayInfo]
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
            // Billing fields
            tipoPersona: user.tipoPersona || null,
            documentTypeId: user.documentTypeId || null,
            documentId: user.documentId || null,
            nombres: user.nombres || null,
            apellidos: user.apellidos || null,
            razonSocial: user.razonSocial || null,
            nit: user.nit || null,
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
          tickets={ticketsWithCount}
          total={totalPrice}
          open={showSummaryDrawer}
          close={() => setShowSummaryDrawer(false)}
          documentTypes={documentTypes}
        />
      )}

      <div className="space-y-4 sm:space-y-6">
        {/* Day selector for multi-day events */}
        {isMultiDay && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              <span>Selecciona el día</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2">
              {eventDays.map((day, index) => {
                const dayTickets = tickets.filter(
                  (t) => t.eventDayId === day.id
                );
                const minPrice =
                  dayTickets.length > 0
                    ? Math.min(...dayTickets.map((t) => parseFloat(t.price)))
                    : 0;

                return (
                  <button
                    key={day.id}
                    onClick={() => setSelectedDay(day.id)}
                    className={cn(
                      "flex-shrink-0 p-3 rounded-xl border text-left transition-all min-w-[120px]",
                      selectedDay === day.id
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-muted text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-medium text-sm">
                        {day.name || `Día ${index + 1}`}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {day.date.toLocaleDateString("es-ES", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </div>
                    {minPrice > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        desde ${minPrice.toLocaleString("es-CO")}
                      </div>
                    )}
                  </button>
                );
              })}
              {/* General pass option */}
              {hasGeneralPasses && (
                <button
                  onClick={() => setSelectedDay("pass")}
                  className={cn(
                    "flex-shrink-0 p-3 rounded-xl border text-left transition-all min-w-[120px]",
                    selectedDay === "pass"
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Pase Completo</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Todos los días
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tickets list */}
        <div className="space-y-3">
          {filteredTickets.map((ticket) => {
            const available =
              ticket.capacity - ticket.soldCount - ticket.reservedCount;
            const maxPerOrder = ticket.maxPerOrder ?? 10;
            const minPerOrder = ticket.minPerOrder ?? 1;
            const effectiveMax = Math.min(maxPerOrder, available);

            // Check if ticket is within sale window
            const now = new Date();
            const isBeforeSaleStart =
              ticket.saleStart && now < new Date(ticket.saleStart);
            const isAfterSaleEnd =
              ticket.saleEnd && now > new Date(ticket.saleEnd);
            const isOutsideSaleWindow = isBeforeSaleStart || isAfterSaleEnd;

            // Ticket is not available if sold out OR outside sale window
            const isSoldOut = available <= 0;
            const isNotAvailable = isSoldOut || isOutsideSaleWindow;

            return (
              <div
                key={ticket.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-colors ${
                  isNotAvailable
                    ? "border-border/50 opacity-60"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {/* Ticket info - responsive layout */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-semibold text-base sm:text-lg">
                      {ticket.name}
                    </h3>
                    {/* Day badge for multi-day events */}
                    {isMultiDay &&
                      selectedDay === "all" &&
                      (() => {
                        const dayInfo = getDayInfo(ticket.eventDayId);
                        if (dayInfo) {
                          return (
                            <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                              {dayInfo.name ||
                                dayInfo.date.toLocaleDateString("es-ES", {
                                  weekday: "short",
                                  day: "numeric",
                                })}
                            </span>
                          );
                        } else if (!ticket.eventDayId) {
                          return (
                            <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              Todos los días
                            </span>
                          );
                        }
                        return null;
                      })()}
                    {isSoldOut && (
                      <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                        Agotado
                      </span>
                    )}
                    {!isSoldOut && isBeforeSaleStart && (
                      <span className="text-xs px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 rounded-full">
                        Próximamente
                      </span>
                    )}
                    {!isSoldOut && isAfterSaleEnd && (
                      <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded-full">
                        Ventas cerradas
                      </span>
                    )}
                  </div>
                  {ticket.description && (
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                      {ticket.description}
                    </p>
                  )}
                  {/* Show constraints */}
                  {!isNotAvailable && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {maxPerOrder < 10 && (
                        <span className="text-xs text-muted-foreground">
                          Máx. {maxPerOrder} por orden
                        </span>
                      )}
                      {minPerOrder > 1 && (
                        <span className="text-xs text-muted-foreground">
                          {maxPerOrder < 10 ? "• " : ""}Mín. {minPerOrder}
                        </span>
                      )}
                      {available <= 10 && available > 0 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400">
                          {maxPerOrder < 10 || minPerOrder > 1 ? "• " : ""}
                          ¡Solo {available} disponible
                          {available !== 1 ? "s" : ""}!
                        </span>
                      )}
                    </div>
                  )}
                  {/* Show sale window info */}
                  {!isSoldOut && isBeforeSaleStart && ticket.saleStart && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs text-blue-600 dark:text-blue-400">
                        Disponible desde{" "}
                        {new Date(ticket.saleStart).toLocaleDateString(
                          "es-ES",
                          {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  )}
                  {!isSoldOut && isAfterSaleEnd && ticket.saleEnd && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        Ventas cerradas el{" "}
                        {new Date(ticket.saleEnd).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
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
                  {!isNotAvailable ? (
                    <TicketQuantitySelector
                      ticketId={ticket.id}
                      price={parseFloat(ticket.price)}
                      maxQuantity={effectiveMax}
                      onQuantityChange={handleQuantityChange}
                    />
                  ) : (
                    <div className="min-w-[100px] text-center">
                      <span className="text-sm text-muted-foreground">
                        No disponible
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
