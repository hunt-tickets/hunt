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

  // All roles (owner, administrator, seller) can sell tickets
  // No additional permission check needed - being a member is enough

  const supabase = await createClient();

  // Fetch event with ticket types and event days
  const { data: event } = await supabase
    .from("events")
    .select(
      `
      id,
      name,
      status,
      type,
      ticket_types (
        id,
        name,
        price,
        capacity,
        sold_count,
        reserved_count,
        min_per_order,
        max_per_order,
        event_day_id
      ),
      event_days (
        id,
        name,
        date,
        sort_order
      )
    `
    )
    .eq("id", eventId)
    .eq("organization_id", organizationId)
    .eq("ticket_types.active", true)
    .single();

  if (!event) {
    notFound();
  }

  const isMultiDay = event.type === "multi_day" && (event.event_days || []).length > 0;

  // Sort event days
  const eventDays = (event.event_days || [])
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((day) => ({
      id: day.id,
      name: day.name || "",
      date: day.date || "",
    }));

  // Transform ticket types for the form
  const ticketTypes = (event.ticket_types || []).map((tt) => ({
    id: tt.id,
    name: tt.name,
    price: parseFloat(tt.price),
    available: tt.capacity - tt.sold_count - tt.reserved_count,
    minPerOrder: tt.min_per_order,
    maxPerOrder: tt.max_per_order,
    eventDayId: tt.event_day_id || null,
  }));

  return (
    <>
      <EventStickyHeader
        eventName={event.name || "Evento"}
        subtitle="Venta en efectivo"
      />

      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <CashSaleForm
          eventId={eventId}
          ticketTypes={ticketTypes}
          eventDays={eventDays}
          isMultiDay={isMultiDay}
        />
      </div>
    </>
  );
}
