import { redirect, notFound } from "next/navigation";
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server";
import { getAllProducers, getAllArtists, getAllVenues } from "@/lib/supabase/actions/tickets";
=======
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
>>>>>>> a903bf6 (temp: admin config tabs implementation)
import { MarcasTabs } from "@/components/marcas-tabs";
import { AdminHeader } from "@/components/admin-header";

interface MarcasPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function MarcasPage({ params }: MarcasPageProps) {
  const { userId } = await params;
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
    producers_admin: [
      {
        producer_id: "mock-producer-1",
      },
    ],
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
  // Fetch all producers, artists, and venues
  const [producers, artists, venues] = await Promise.all([
    getAllProducers(),
    getAllArtists(),
    getAllVenues(),
  ]);
=======
  // Mock data - In production, fetch from database
  const producers = [
    {
      id: "producer-1",
      name: "Mi Productora",
      logo: null,
      description: "Productora de eventos musicales",
      created_at: "2025-01-01T00:00:00Z",
    },
  ];

  const artists = [
    {
      id: "artist-1",
      name: "Banda de Rock",
      logo: null,
      description: "Banda local de rock",
      created_at: "2025-01-01T00:00:00Z",
    },
  ];

  const venues = [
    {
      id: "venue-1",
      name: "Teatro Principal",
      logo: null,
      address: "Calle 100 #10-20",
      city: "Bogotá",
      latitude: 4.678,
      longitude: -74.048,
      created_at: "2025-01-01T00:00:00Z",
    },
  ];
>>>>>>> a903bf6 (temp: admin config tabs implementation)

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
