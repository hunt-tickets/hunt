import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { CashSaleForm } from "@/components/cash-sale-form";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

interface VenderPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export default async function VenderPage({ params }: VenderPageProps) {
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

  // Check if user has permission to sell tickets
  const canSell = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { event: ["sell"] },
      organizationId,
    },
  });

  if (!canSell?.success) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch event with ticket types
  const { data: event } = await supabase
    .from("events")
    .select(
      `
      id,
      name,
      status,
      ticket_types (
        id,
        name,
        price,
        capacity,
        sold_count,
        reserved_count,
        min_per_order,
        max_per_order
      )
    `
    )
    .eq("id", eventId)
    .eq("organization_id", organizationId)
    .single();

  if (!event) {
    notFound();
  }

  // Transform ticket types for the form
  const ticketTypes = (event.ticket_types || []).map((tt) => ({
    id: tt.id,
    name: tt.name,
    price: parseFloat(tt.price),
    available: tt.capacity - tt.sold_count - tt.reserved_count,
    minPerOrder: tt.min_per_order,
    maxPerOrder: tt.max_per_order,
  }));

  return (
    <>
      <EventStickyHeader
        eventName={event.name || "Evento"}
        subtitle="Venta en efectivo"
      />

      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <CashSaleForm eventId={eventId} ticketTypes={ticketTypes} />
      </div>
    </>
  );
}
