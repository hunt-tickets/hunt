import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { CashSaleForm } from "@/components/cash-sale-form";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

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
      lifecycle_status,
      modification_locked,
      ticket_types (
        id,
        name,
        price,
        capacity,
        sold_count,
        reserved_count,
        min_per_order,
        max_per_order,
        event_day_id,
        active
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
    .single();

  if (!event) {
    notFound();
  }

  // Show 404 if event is cancelled
  if (event.lifecycle_status === 'cancelled') {
    notFound();
  }

  // Show message if event is being cancelled
  if (event.lifecycle_status === 'cancellation_pending') {
    return (
      <>
        <EventStickyHeader
          eventName={event.name || "Evento"}
          subtitle="Venta en efectivo"
        />

        <div className="px-3 py-3 sm:px-6 sm:py-4">
          <Card className="border-yellow-500/50 bg-yellow-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-yellow-600">
                <AlertCircle className="h-5 w-5" />
                Evento en proceso de cancelación
              </CardTitle>
              <CardDescription>
                Este evento está siendo cancelado actualmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                No puedes realizar ventas en efectivo mientras el evento está en proceso de cancelación.
              </p>
              <p>
                Una vez que se completen todos los reembolsos, el evento será cancelado permanentemente.
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
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

  // Transform ticket types for the form (only active tickets)
  const ticketTypes = (event.ticket_types || [])
    .filter((tt) => tt.active)
    .map((tt) => ({
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
