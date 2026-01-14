import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventAccessControlContent } from "@/components/event-access-control-content";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

interface AccesosPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export default async function AccesosPage({ params }: AccesosPageProps) {
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

  // Mock access control data - In production, fetch from database
  const accessData = {
    qrCodes: [
      {
        id: "qr-1",
        transaction_id: "txn-1",
        user_id: "user-1",
        created_at: new Date().toISOString(),
        scan: false,
        scanner_id: null,
        updated_at: null,
        apple: false,
        google: false,
        user_name: "María García",
        user_email: "maria@example.com",
        scanner_name: null,
        scanner_email: null,
        ticket_name: "General",
        source: "web",
        order_id: null,
      },
    ],
    transactionsMissingQR: [],
  };

  return (
    <>
      {/* Sticky Header */}
      <EventStickyHeader
        eventName={event.name}
        subtitle="Control de Acceso"
      >
        <EventAccessControlContent
          qrCodes={accessData?.qrCodes || []}
          transactionsWithoutQR={accessData?.transactionsMissingQR || []}
          eventId={eventId}
          showTabsOnly
        />
      </EventStickyHeader>

      {/* Content */}
      <div className="py-3 sm:py-4">
        <EventAccessControlContent
          qrCodes={accessData?.qrCodes || []}
          transactionsWithoutQR={accessData?.transactionsMissingQR || []}
          eventId={eventId}
          showContentOnly
        />
      </div>
    </>
  );
}
