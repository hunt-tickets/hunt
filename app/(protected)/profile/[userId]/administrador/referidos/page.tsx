import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReferralAdminContent } from "@/components/referral-admin-content";
import { AdminHeader } from "@/components/admin-header";

interface ReferidosPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function ReferidosPage({ params }: ReferidosPageProps) {
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

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 space-y-8">
      {/* Header */}
      <AdminHeader
        title="Programa de Referidos"
        subtitle="Invita productores y gana comisiones por sus ventas"
      />

      {/* Content */}
      <ReferralAdminContent userId={userId} />
    </div>
  );
}
