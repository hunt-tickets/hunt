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
      created_at: new Date().toISOString(),
      amount: 50000,
      status: "completed",
      payment_method: "card",
    },
  ];

  const completeTransactions = [
    {
      id: "trans-1",
      created_at: new Date().toISOString(),
      amount: 50000,
      status: "completed",
      payment_method: "card",
      user: {
        name: "María García",
        email: "maria@example.com",
      },
      ticket: {
        name: "General",
      },
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
