import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ReferralAdminContent } from "@/components/referral-admin-content";
import { AdminHeader } from "@/components/admin-header";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

interface ReferidosPageProps {
  params: Promise<{
    userId: string;
    organizationId: string;
  }>;
}

export default async function ReferidosPage({ params }: ReferidosPageProps) {
  const { userId, organizationId } = await params;
  const reqHeaders = await headers();

  // Auth check
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
  }

  // Verify user is a member of the organization
  const memberRecord = await db.query.member.findFirst({
    where: and(
      eq(member.userId, userId),
      eq(member.organizationId, organizationId)
    ),
  });

  if (!memberRecord) {
    notFound();
  }

  // Check if user has admin permissions (sellers cannot view referrals)
  const canViewReferrals = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { dashboard: ["view"] },
      organizationId,
    },
  });

  if (!canViewReferrals?.success) {
    redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/mis-ventas`);
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
