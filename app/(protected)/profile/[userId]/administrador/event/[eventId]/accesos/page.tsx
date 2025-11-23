import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventAccessControlContent } from "@/components/event-access-control-content";
import { EventStickyHeader } from "@/components/event-sticky-header";

interface AccesosPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
  }>;
}

export default async function AccesosPage({ params }: AccesosPageProps) {
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

  // Mock access control data - In production, fetch from database
  const accessData = {
    qrCodes: [
      {
        id: "qr-1",
        code: "QR12345678",
        ticketName: "General",
        userName: "María García",
        used: false,
        created_at: new Date().toISOString(),
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
      <div className="px-3 py-3 sm:px-6 sm:py-4">
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
