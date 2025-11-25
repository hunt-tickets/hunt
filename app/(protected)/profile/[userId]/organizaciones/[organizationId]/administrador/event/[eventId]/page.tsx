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
    channels_total: 7000000,
    tickets_sold: {
      total: 100,
      app: 60,
      web: 30,
      cash: 10,
    },
    settlement_amount: 6300000,
    app_total: 4200000,
    web_total: 2100000,
    cash_total: 700000,
    total_tax: 560000,
    hunt_sales: {
      price: 6000000,
      tax: 480000,
      variable_fee: 520000,
      total: 6300000,
    },
    producer_sales: {
      price: 700000,
      tax: 0,
      variable_fee: 0,
      total: 700000,
    },
    global_calculations: {
      ganancia_bruta_hunt: 520000,
      deducciones_bold_total: 50000,
      impuesto_4x1000: 2800,
      ganancia_neta_hunt: 467200,
    },
  };

  // Mock transactions - In production, fetch from database
  const transactions = [
    {
      id: "trans-1",
      quantity: 1,
      total: 50000,
      price: 50000,
      status: "completed",
      created_at: new Date().toISOString(),
      type: "web",
      ticket_name: "General",
      event_name: event.name,
      user_fullname: "María García",
      user_email: "maria@example.com",
      promoter_fullname: "",
      promoter_email: "",
      cash: false,
      variable_fee: 8,
      tax: 0,
      order_id: "order-1",
      bold_id: null,
      bold_fecha: null,
      bold_estado: null,
      bold_metodo_pago: null,
      bold_valor_compra: null,
      bold_propina: null,
      bold_iva: null,
      bold_impoconsumo: null,
      bold_valor_total: null,
      bold_rete_fuente: null,
      bold_rete_iva: null,
      bold_rete_ica: null,
      bold_comision_porcentaje: null,
      bold_comision_fija: null,
      bold_total_deduccion: null,
      bold_deposito_cuenta: null,
      bold_banco: null,
      bold_franquicia: null,
      bold_pais_tarjeta: null,
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
      quantity: 100,
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
      quantity: 50,
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
