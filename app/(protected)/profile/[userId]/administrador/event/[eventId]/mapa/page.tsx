import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { VenueCircularEditor } from "@/components/venue-circular-editor";

interface MapaPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
  }>;
}

export default async function MapaPage({ params }: MapaPageProps) {
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

  // Mock: Verify event exists - In production, fetch from database
  const event = {
    id: eventId,
    name: "Concierto de Rock",
  };

  if (!event) {
    notFound();
  }

  return <VenueCircularEditor eventId={eventId} />;
}
