import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventConfigContent } from "@/components/event-config-content";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { db } from "@/lib/drizzle";
import { member, events } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

interface ConfiguracionPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export default async function ConfiguracionPage({ params }: ConfiguracionPageProps) {
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

  // Check if user can manage events (sellers cannot)
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

  // Fetch event data from database
  const event = await db.query.events.findFirst({
    where: and(
      eq(events.id, eventId),
      eq(events.organizationId, organizationId)
    ),
  });

  if (!event) {
    notFound();
  }

  // Format event data for the config component
  const eventData = {
    id: event.id,
    name: event.name || "",
    description: event.description || "",
    category: event.category || undefined,
    date: event.date?.toISOString(),
    end_date: event.endDate?.toISOString(),
    status: event.status ?? false,
    age: event.age ? Number(event.age) : undefined,
    variable_fee: event.variableFee ? Number(event.variableFee) : undefined,
    fixed_fee: event.fixedFee ? Number(event.fixedFee) : undefined,
    city: event.city || undefined,
    country: event.country || undefined,
    address: event.address || undefined,
    flyer: event.flyer || undefined,
    flyer_apple: event.flyerApple || undefined,
    venue_id: event.venueId || undefined,
    faqs: (event.faqs as Array<{ id: string; question: string; answer: string }>) || [],
  };

  return (
    <>
      {/* Sticky Header */}
      <EventStickyHeader
        eventName={eventData.name}
        subtitle="Configuración del Evento"
      >
        <EventConfigContent showTabsOnly />
      </EventStickyHeader>

      {/* Content */}
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        <EventConfigContent showContentOnly eventData={eventData} eventId={eventId} />
      </div>
    </>
  );
}
