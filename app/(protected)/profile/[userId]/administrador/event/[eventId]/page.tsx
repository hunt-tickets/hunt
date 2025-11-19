import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getEventFinancialReport } from "@/lib/supabase/actions/events";
import {
  getCompleteEventTransactions,
  getEventTickets,
  getTicketsSalesAnalytics,
} from "@/lib/supabase/actions/tickets";
import { EventDashboardTabs } from "@/components/event-dashboard-tabs";
import { EventStickyHeader } from "@/components/event-sticky-header";

interface EventPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
  }>;
}

export default async function EventFinancialPage({ params }: EventPageProps) {
  const { userId, eventId } = await params;
  const supabase = await createClient();

  // Auth check
  if (!userId) {
    redirect("/login");
  }

  // Get user profile to verify admin/producer access
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, admin, producers_admin(producer_id)")
    .eq("id", userId)
    .single();

  const producersAdmin = Array.isArray(profile?.producers_admin)
    ? profile.producers_admin
    : profile?.producers_admin
    ? [profile.producers_admin]
    : [];
  const isProducer = producersAdmin.length > 0;

  if (!profile?.admin && !isProducer) {
    notFound();
  }

  // Fetch event details, financial report, transactions, tickets, and analytics
  const [eventData, financialReport, transactions, tickets, ticketsAnalytics] =
    await Promise.all([
      supabase
        .from("events")
        .select("id, name, status, flyer")
        .eq("id", eventId)
        .single(),
      getEventFinancialReport(eventId),
      getCompleteEventTransactions(eventId),
      getEventTickets(eventId),
      getTicketsSalesAnalytics(eventId),
    ]);

  // Combine tickets with their analytics
  const ticketsWithAnalytics =
    tickets?.map((ticket) => ({
      ...ticket,
      analytics: ticketsAnalytics?.[ticket.id] || {
        total: { quantity: 0, total: 0 },
        app: { quantity: 0, total: 0 },
        web: { quantity: 0, total: 0 },
        cash: { quantity: 0, total: 0 },
      },
    })) || [];

  if (eventData.error || !eventData.data) {
    notFound();
  }

  const event = eventData.data;

  // Empty state
  if (!financialReport) {
    return (
      <div className="min-h-screen">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold sm:text-2xl">{event.name}</h1>
              <p className="text-xs text-muted-foreground">
                Panel de Administración
              </p>
            </div>
            <Badge variant={event.status ? "default" : "secondary"}>
              {event.status ? "Activo" : "Finalizado"}
            </Badge>
          </div>

          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1">
                Sin datos financieros
              </h3>
              <p className="text-sm text-muted-foreground">
                Los datos aparecerán una vez se realicen las primeras ventas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Sticky Header with Tabs */}
      <EventStickyHeader
        eventName={event.name}
        subtitle={new Date(financialReport.timestamp).toLocaleString("es-CO", {
          dateStyle: "short",
          timeStyle: "short",
        })}
      >
        <EventDashboardTabs
          financialReport={financialReport}
          transactions={transactions || []}
          tickets={ticketsWithAnalytics}
          eventId={eventId}
          eventName={event.name}
          eventFlyer={event.flyer || "/placeholder.svg"}
          showTabsOnly
        />
      </EventStickyHeader>

      {/* Content */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventDashboardTabs
          financialReport={financialReport}
          transactions={transactions || []}
          tickets={ticketsWithAnalytics}
          eventId={eventId}
          eventName={event.name}
          eventFlyer={event.flyer || "/placeholder.svg"}
          showContentOnly
        />
      </div>
    </>
  );
}
