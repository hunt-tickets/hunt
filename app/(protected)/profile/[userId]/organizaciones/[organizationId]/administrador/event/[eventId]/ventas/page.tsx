import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventSalesContent } from "@/components/event-sales-content";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

interface VentasPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export default async function VentasPage({ params }: VentasPageProps) {
  const { userId, eventId, organizationId } = await params;
  const reqHeaders = await headers();

  // Auth check
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
  }

  // Verify user is a member of the organization
  const memberRecord = await db.query.member.findFirst({
    where: and(
      eq(member.userId, userId),
      eq(member.organizationId, organizationId)
    ),
  });

  if (!memberRecord) {
    notFound();
  }

  // Check if user can view analytics (sellers cannot)
  const canViewAnalytics = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { analytics: ["view"] },
      organizationId,
    },
  });

  if (!canViewAnalytics?.success) {
    redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/vender`);
  }

  const supabase = await createClient();

  // Fetch event data
  const { data: eventData } = await supabase
    .from("events")
    .select("id, name, status")
    .eq("id", eventId)
    .eq("organization_id", organizationId)
    .single();

  if (!eventData) {
    notFound();
  }

  const event = {
    id: eventData.id,
    name: eventData.name,
    status: eventData.status,
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

  // User has analytics:view permission, so they're admin/owner
  const isAdmin = true;

  return (
    <>
      {/* Sticky Header with Tabs */}
      <EventStickyHeader
        eventName={event.name}
        subtitle="Gestión de ventas"
      >
        <EventSalesContent
          eventId={eventId}
          transactions={transactions || []}
          eventName={event.name}
          isAdmin={isAdmin}
          showTabsOnly
        />
      </EventStickyHeader>

      {/* Content */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventSalesContent
          eventId={eventId}
          transactions={transactions || []}
          eventName={event.name}
          isAdmin={isAdmin}
          showContentOnly
        />
      </div>
    </>
  );
}
