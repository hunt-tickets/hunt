import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { EventDaysContent } from "@/components/event-days-content";
import { db } from "@/lib/drizzle";
import { member, events, eventDays } from "@/lib/schema";
import { eq, and, asc } from "drizzle-orm";

interface DiasPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export default async function DiasPage({ params }: DiasPageProps) {
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

  // Check if user can manage events
  const canManageEvents = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { event: ["update"] },
      organizationId,
    },
  });

  if (!canManageEvents?.success) {
    redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/vender`);
  }

  // Fetch event data
  const event = await db.query.events.findFirst({
    where: and(
      eq(events.id, eventId),
      eq(events.organizationId, organizationId)
    ),
  });

  if (!event) {
    notFound();
  }

  // Only multi_day events should access this page
  if (event.type !== "multi_day") {
    redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/configuracion`);
  }

  // Fetch event days
  const days = await db.query.eventDays.findMany({
    where: eq(eventDays.eventId, eventId),
    orderBy: [asc(eventDays.sortOrder)],
  });

  const daysData = days.map((d) => ({
    id: d.id,
    name: d.name || "",
    date: d.date?.toISOString() || "",
    endDate: d.endDate?.toISOString() || "",
    sortOrder: d.sortOrder || 0,
    description: d.description || "",
    flyer: d.flyer || "",
    doorsOpen: d.doorsOpen?.toISOString() || "",
    showStart: d.showStart?.toISOString() || "",
  }));

  return (
    <>
      <EventStickyHeader
        eventName={event.name || ""}
        subtitle="Días del Evento"
      />

      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventDaysContent
          eventId={eventId}
          initialDays={daysData}
        />
      </div>
    </>
  );
}
