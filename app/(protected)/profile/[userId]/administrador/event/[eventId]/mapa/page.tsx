import { redirect, notFound } from "next/navigation";
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server";
=======
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
>>>>>>> a903bf6 (temp: admin config tabs implementation)
import { VenueCircularEditor } from "@/components/venue-circular-editor";

interface MapaPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
  }>;
}

export default async function MapaPage({ params }: MapaPageProps) {
  const { userId, eventId } = await params;
<<<<<<< HEAD
  const supabase = await createClient();

  // Auth check
  if (!userId) {
    redirect("/login");
  }

  // Get user profile to verify admin/producer access
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, admin, producers_admin(producer_id)")
    .eq("id", userId)
    .single();
=======

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
>>>>>>> a903bf6 (temp: admin config tabs implementation)

  const producersAdmin = Array.isArray(profile?.producers_admin)
    ? profile.producers_admin
    : profile?.producers_admin
    ? [profile.producers_admin]
    : [];
  const isProducer = producersAdmin.length > 0;

  if (!profile?.admin && !isProducer) {
    notFound();
  }

<<<<<<< HEAD
  // Verify event exists
  const { data: event } = await supabase
    .from("events")
    .select("id, name")
    .eq("id", eventId)
    .single();
=======
  // Mock: Verify event exists - In production, fetch from database
  const event = {
    id: eventId,
    name: "Concierto de Rock",
  };
>>>>>>> a903bf6 (temp: admin config tabs implementation)

  if (!event) {
    notFound();
  }

  return <VenueCircularEditor eventId={eventId} />;
}
