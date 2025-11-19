import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllProducers, getAllArtists, getAllVenues } from "@/lib/supabase/actions/tickets";
import { MarcasTabs } from "@/components/marcas-tabs";
import { AdminHeader } from "@/components/admin-header";

interface MarcasPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function MarcasPage({ params }: MarcasPageProps) {
  const { userId } = await params;
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

  // Fetch all producers, artists, and venues
  const [producers, artists, venues] = await Promise.all([
    getAllProducers(),
    getAllArtists(),
    getAllVenues(),
  ]);

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Header */}
      <AdminHeader
        title="Marcas"
        subtitle="Gestión de productores, artistas, venues y patrocinadores"
      />

      {/* Marcas Tabs */}
      <MarcasTabs
        producers={producers || []}
        artists={artists || []}
        venues={venues || []}
        userId={userId}
      />
    </div>
  );
}
