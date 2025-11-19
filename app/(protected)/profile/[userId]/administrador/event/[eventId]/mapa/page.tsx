import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VenueCircularEditor } from "@/components/venue-circular-editor";

interface MapaPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
  }>;
}

export default async function MapaPage({ params }: MapaPageProps) {
  const { userId, eventId } = await params;
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

  const producersAdmin = Array.isArray(profile?.producers_admin)
    ? profile.producers_admin
    : profile?.producers_admin
    ? [profile.producers_admin]
    : [];
  const isProducer = producersAdmin.length > 0;

  if (!profile?.admin && !isProducer) {
    notFound();
  }

  // Verify event exists
  const { data: event } = await supabase
    .from("events")
    .select("id, name")
    .eq("id", eventId)
    .single();

  if (!event) {
    notFound();
  }

  return <VenueCircularEditor eventId={eventId} />;
}
