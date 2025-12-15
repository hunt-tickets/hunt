import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ReferralTabs } from "@/components/referral-tabs";
import { AdminHeader } from "@/components/admin-header";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import type { Metadata } from "next";

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Recompensas - Referidos y Rebates | Hunt Tickets",
  description:
    "Gana comisiones por referir productores de eventos y obtén rebates por tus ventas. Sistema de recompensas de Hunt Tickets.",
  robots: {
    index: false, // Don't index user-specific pages
    follow: false,
  },
};

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
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Header */}
      <AdminHeader
        title="Recompensas"
        subtitle="Gana comisiones por referir productores y obtén rebates por tus ventas"
      />

      {/* Tabs */}
      <ReferralTabs userId={userId} />
    </div>
  );
}
