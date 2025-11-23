import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ReferralAdminContent } from "@/components/referral-admin-content";
import { AdminHeader } from "@/components/admin-header";

interface ReferidosPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function ReferidosPage({ params }: ReferidosPageProps) {
  const { userId } = await params;

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
