import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Ticket } from "lucide-react";
import { TicketsList } from "@/components/tickets-list";

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

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Mis Entradas</h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1 sm:mt-2">
          Tus tickets para próximos eventos
        </p>
      </div>

      {!hasTickets ? (
        <Card className="border-gray-200 dark:border-[#2a2a2a] rounded-2xl">
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Ticket className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              </div>
              <div>
                <h3 className="font-semibold">No tienes entradas</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Cuando compres tickets para eventos, aparecerán aquí
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <TicketsList ticketsByEvent={ticketsByEvent} />
      )}
    </div>
  );
};

export default EntradasPage;
