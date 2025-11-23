import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

  // Auth check using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
  }

  // Mock: Get user profile to verify admin/producer access
  const profile = {
    id: userId,
    admin: true,
    producers_admin: [{ producer_id: "mock-producer-1" }],
  };

  const producersAdmin = Array.isArray(profile?.producers_admin)
    ? profile.producers_admin
    : profile?.producers_admin
    ? [profile.producers_admin]
    : [];
  const isProducer = producersAdmin.length > 0;

  if (!profile?.admin && !isProducer) {
    notFound();
  }

  // Mock event data - In production, fetch from database
  const event = {
    id: eventId,
    name: "Concierto de Rock",
    status: true,
    flyer: "/placeholder.svg",
  };

  // Mock financial report - In production, fetch from database
  const financialReport = {
    timestamp: new Date().toISOString(),
    totalRevenue: 5000000,
    totalTicketsSold: 100,
    platformFee: 400000,
    netRevenue: 4600000,
    ticketBreakdown: [
      { ticketName: "General", ticketsSold: 60, revenue: 3000000 },
      { ticketName: "VIP", ticketsSold: 40, revenue: 2000000 },
    ],
  };

  // Mock transactions - In production, fetch from database
  const transactions = [
    {
      id: "trans-1",
      created_at: new Date().toISOString(),
      amount: 50000,
      status: "completed",
      user: { name: "María García", email: "maria@example.com" },
      ticket: { name: "General" },
    },
  ];

  // Mock tickets with analytics - In production, fetch from database
  const ticketsWithAnalytics = [
    {
      id: "ticket-1",
      name: "General",
      price: 50000,
      description: "Entrada general",
      status: true,
      analytics: {
        total: { quantity: 60, total: 3000000 },
        app: { quantity: 40, total: 2000000 },
        web: { quantity: 20, total: 1000000 },
        cash: { quantity: 0, total: 0 },
      },
    },
    {
      id: "ticket-2",
      name: "VIP",
      price: 100000,
      description: "Entrada VIP",
      status: true,
      analytics: {
        total: { quantity: 40, total: 4000000 },
        app: { quantity: 25, total: 2500000 },
        web: { quantity: 15, total: 1500000 },
        cash: { quantity: 0, total: 0 },
      },
    },
  ];

  // Empty state check
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
