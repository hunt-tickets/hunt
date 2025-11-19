import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getProducerTeam } from "@/lib/supabase/actions/tickets";
import { ProducerProfileContent } from "@/components/producer-profile-content";

interface ProducerProfilePageProps {
  params: Promise<{
    userId: string;
    producerId: string;
  }>;
}

export default async function ProducerProfilePage({ params }: ProducerProfilePageProps) {
  const { userId, producerId } = await params;
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

  // Fetch producer details and team
  const [producerData, team] = await Promise.all([
    supabase.from("producers").select("*").eq("id", producerId).single(),
    getProducerTeam(producerId),
  ]);

  if (producerData.error || !producerData.data) {
    notFound();
  }

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6">
      <ProducerProfileContent
        producer={producerData.data}
        team={team || []}
        userId={userId}
      />
    </div>
  );
}
