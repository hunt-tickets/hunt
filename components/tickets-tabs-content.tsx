"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ticket, Calendar, Clock, QrCode } from "lucide-react";

interface Event {
  event_id: string;
  event_name: string;
  flyer: string | null;
  total_qr_codes: number;
  event_time: string;
  event_date: string;
}

interface EventsResponse {
  has_events: boolean;
  events: Event[];
}

interface TicketsTabsContentProps {
  upcomingEvents: EventsResponse;
  pastEvents: EventsResponse;
}

export function TicketsTabsContent({
  upcomingEvents,
  pastEvents,
}: TicketsTabsContentProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  return (
    <div className="w-full">
      {/* Custom styled tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "upcoming"
              ? "bg-primary text-primary-foreground"
              : "bg-white/5 hover:bg-white/10 text-white/60"
          }`}
        >
          Próximas {upcomingEvents.has_events && `(${upcomingEvents.events.length})`}
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "past"
              ? "bg-primary text-primary-foreground"
              : "bg-white/5 hover:bg-white/10 text-white/60"
          }`}
        >
          Pasadas {pastEvents.has_events && `(${pastEvents.events.length})`}
        </button>
      </div>

      {/* Upcoming Events Tab */}
      {activeTab === "upcoming" && (
        <div className="space-y-4 mt-6">
          {upcomingEvents.has_events ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.events.map((event) => (
                <Card
                  key={event.event_id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Event Image */}
                  <div className="relative h-48 w-full bg-muted">
                    {event.flyer ? (
                      <Image
                        src={event.flyer}
                        alt={event.event_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Ticket className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {event.event_name}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{event.event_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{event.event_time}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {event.total_qr_codes}{" "}
                          {event.total_qr_codes === 1 ? "entrada" : "entradas"}
                        </span>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-400">
                        Activo
                      </span>
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/eventos/${event.event_id}`}>
                        Ver mis códigos QR
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ticket className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No tienes entradas próximas
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  Explora nuestros eventos y consigue tus entradas
                </p>
                <Button asChild>
                  <Link href="/">Ver eventos disponibles</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Past Events Tab */}
      {activeTab === "past" && (
        <div className="space-y-4 mt-6">
          {pastEvents.has_events ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.events.map((event) => (
                <Card
                  key={event.event_id}
                  className="overflow-hidden opacity-75"
                >
                  {/* Event Image */}
                  <div className="relative h-48 w-full bg-muted">
                    {event.flyer ? (
                      <Image
                        src={event.flyer}
                        alt={event.event_name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Ticket className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <CardHeader>
                    <CardTitle className="line-clamp-2">
                      {event.event_name}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{event.event_date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{event.event_time}</span>
                      </div>
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <QrCode className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {event.total_qr_codes}{" "}
                          {event.total_qr_codes === 1 ? "entrada" : "entradas"}
                        </span>
                      </div>
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-white/10 text-white/60">
                        Finalizado
                      </span>
                    </div>

                    <Button asChild variant="outline" className="w-full">
                      <Link href={`/eventos/${event.event_id}`}>
                        Ver detalles
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Ticket className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No tienes entradas pasadas
                </h3>
                <p className="text-muted-foreground text-center">
                  Tus eventos finalizados aparecerán aquí
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
