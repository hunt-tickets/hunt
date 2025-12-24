"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Ticket, ChevronRight, ChevronDown } from "lucide-react";
import { QRCode } from "@/components/ui/qr-code";

interface TicketData {
  id: string;
  qr_code: string;
  status: string;
  created_at: string;
  order_id: string;
  ticket_types: { id: string; name: string; price: string } | null;
  orders: {
    id: string;
    total_amount: string;
    currency: string;
    paid_at: string;
    events: {
      id: string;
      name: string;
      date: string;
      venues: { name: string; city: string } | null;
    } | null;
  } | null;
}

interface EventData {
  id: string;
  name: string;
  date: string;
  venues: { name: string; city: string } | null;
}

interface TicketsByEvent {
  [eventId: string]: {
    event: EventData | null;
    tickets: TicketData[];
  };
}

interface TicketsListProps {
  ticketsByEvent: TicketsByEvent;
}

export function TicketsList({ ticketsByEvent }: TicketsListProps) {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-primary text-primary-foreground">Válido</Badge>;
      case "used":
        return <Badge variant="secondary">Usado</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const toggleEvent = (eventId: string) => {
    setExpandedEvent(expandedEvent === eventId ? null : eventId);
  };

  return (
    <div className="space-y-3">
      {Object.entries(ticketsByEvent).map(
        ([eventId, { event, tickets: eventTickets }]) => {
          const isExpanded = expandedEvent === eventId;

          return (
            <div key={eventId} className="space-y-3">
              {/* Event Card - Clickable */}
              <div
                onClick={() => toggleEvent(eventId)}
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-all cursor-pointer group"
              >
                {/* Event Icon */}
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 ring-2 ring-gray-200 dark:ring-[#2a2a2a]">
                  <Ticket className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                </div>

                {/* Event Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold truncate">
                    {event?.name || "Evento"}
                  </h3>
                  <div className="flex flex-wrap gap-2 sm:gap-4 mt-1 text-xs sm:text-sm text-gray-500">
                    {event?.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">
                          {new Date(event.date).toLocaleDateString("es-MX", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                    )}
                    {event?.venues && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">{event.venues.city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tickets Count & Chevron */}
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-bold">{eventTickets.length}</span>
                    <p className="text-xs text-gray-500">
                      {eventTickets.length === 1 ? "entrada" : "entradas"}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Tickets */}
              {isExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-0 sm:pl-4 animate-in slide-in-from-top-2 duration-200">
                  {eventTickets.map((ticket, index) => (
                    <Card key={ticket.id} className="overflow-hidden border-gray-200 dark:border-[#2a2a2a]">
                      <CardHeader className="pb-3 bg-gray-50 dark:bg-[#1a1a1a]">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">
                              {ticket.ticket_types?.name || "Entrada"}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Entrada #{index + 1}
                            </CardDescription>
                          </div>
                          {getStatusBadge(ticket.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-4">
                        <div className="flex justify-center">
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <QRCode
                              value={ticket.qr_code}
                              size={160}
                              className="rounded"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Orden</span>
                            <span className="font-mono text-xs">
                              {ticket.orders?.id?.slice(0, 8).toUpperCase() ||
                                "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Precio
                            </span>
                            <span>
                              $
                              {parseFloat(
                                ticket.ticket_types?.price || "0"
                              ).toLocaleString()}{" "}
                              {ticket.orders?.currency || "COP"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              Comprado
                            </span>
                            <span>
                              {new Date(ticket.created_at).toLocaleDateString(
                                "es-MX",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        }
      )}
    </div>
  );
}
