import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Ticket } from "lucide-react";

interface EntradasPageProps {
  params: Promise<{
    userId: string;
  }>;
}

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

const EntradasPage = async ({ params }: EntradasPageProps) => {
  const { userId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.id !== userId) {
    redirect("/sign-in");
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tickets")
    .select(
      `
      id,
      qr_code,
      status,
      created_at,
      order_id,
      ticket_types (id, name, price),
      orders (id, total_amount, currency, paid_at, events (id, name, date, venues (name, city)))
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tickets:", error);
  }

  const tickets = (data ?? []) as unknown as TicketData[];

  // Group tickets by event
  const ticketsByEvent: Record<string, { event: EventData | null; tickets: TicketData[] }> = {};

  for (const ticket of tickets) {
    const event = ticket.orders?.events ?? null;
    const eventId = event?.id || "unknown";

    if (!ticketsByEvent[eventId]) {
      ticketsByEvent[eventId] = { event, tickets: [] };
    }
    ticketsByEvent[eventId].tickets.push(ticket);
  }

  const hasTickets = tickets && tickets.length > 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "valid":
        return <Badge className="bg-green-600">Válido</Badge>;
      case "used":
        return <Badge variant="secondary">Usado</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis Entradas</h1>
        <p className="text-muted-foreground mt-2">
          Tus tickets para próximos eventos
        </p>
      </div>

      {!hasTickets ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Ticket className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-semibold">No tienes entradas</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Cuando compres tickets para eventos, aparecerán aquí
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(ticketsByEvent).map(
            ([eventId, { event, tickets: eventTickets }]) => (
              <div key={eventId} className="space-y-4">
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold">
                    {event?.name || "Evento"}
                  </h2>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                    {event?.date && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {new Date(event.date).toLocaleDateString("es-MX", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    )}
                    {event?.venues && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {event.venues.name}, {event.venues.city}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {eventTickets.map((ticket, index) => (
                    <Card key={ticket.id} className="overflow-hidden">
                      <CardHeader className="pb-3">
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
                      <CardContent className="space-y-4">
                        <div className="flex justify-center">
                          <div className="bg-white p-3 rounded-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(ticket.qr_code)}`}
                              alt={`QR Code entrada ${index + 1}`}
                              width={180}
                              height={180}
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
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default EntradasPage;
