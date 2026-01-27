import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, ArrowLeft } from "lucide-react";
import { QRCode } from "@/components/ui/qr-code";
import Link from "next/link";

interface EventTicketsPageProps {
  params: Promise<{
    userId: string;
    eventId: string;
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

const EventTicketsPage = async ({ params }: EventTicketsPageProps) => {
  const { userId, eventId } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.id !== userId) {
    redirect("/sign-in");
  }

  const supabase = await createClient();

  // Fetch tickets for this specific event
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

  const allTickets = (data ?? []) as unknown as TicketData[];

  // Filter tickets for this event
  const tickets = allTickets.filter(
    (ticket) => ticket.orders?.events?.id === eventId
  );

  if (tickets.length === 0) {
    redirect(`/profile/${userId}/entradas`);
  }

  const event = tickets[0]?.orders?.events;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Back button */}
      <Link
        href={`/profile/${userId}/entradas`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a mis entradas
      </Link>

      {/* Event Info */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          {event?.name || "Evento"}
        </h1>
        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
          {event?.date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(event.date).toLocaleDateString("es-MX", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          {event?.venues && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>
                {event.venues.name} - {event.venues.city}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tickets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tickets.map((ticket, index) => (
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
                    {ticket.orders?.id?.slice(0, 8).toUpperCase() || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio</span>
                  <span>
                    $
                    {parseFloat(
                      ticket.ticket_types?.price || "0"
                    ).toLocaleString()}{" "}
                    {ticket.orders?.currency || "COP"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comprado</span>
                  <span>
                    {new Date(ticket.created_at).toLocaleDateString("es-MX", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventTicketsPage;
