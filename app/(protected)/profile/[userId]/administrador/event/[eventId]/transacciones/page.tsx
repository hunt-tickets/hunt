import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventTransactionsContent } from "@/components/event-transactions-content";
import { EventStickyHeader } from "@/components/event-sticky-header";

interface TransaccionesPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
  }>;
}

export default async function TransaccionesPage({ params }: TransaccionesPageProps) {
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
  };

  // Mock transactions - In production, fetch from database
  const transactions = [
    {
      id: "trans-1",
      quantity: 1,
      total: 50000,
      status: "completed",
      created_at: new Date().toISOString(),
      source: "web",
      tickets: {
        name: "General",
        price: 50000,
      },
      user: {
        name: "María",
        lastName: "García",
        email: "maria@example.com",
      },
    },
  ];

  const completeTransactions = [
    {
      id: "trans-1",
      created_at: new Date().toISOString(),
      user_fullname: "María García",
      user_email: "maria@example.com",
      ticket_name: "General",
      event_name: event.name,
      quantity: 1,
      price: 50000,
      variable_fee: 8,
      tax: 0,
      total: 50000,
      status: "completed",
      type: "web",
      cash: false,
      order_id: "order-1",
      promoter_fullname: "",
      promoter_email: "",
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

  return (
    <>
      {/* Sticky Header */}
      <EventStickyHeader
        eventName={event.name}
        subtitle="Gestión de Transacciones"
      />

      {/* Content */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventTransactionsContent
          eventName={event.name}
          transactions={transactions || []}
          completeTransactions={completeTransactions || []}
          isAdmin={profile?.admin || false}
        />
      </div>
    </>
  );
}
