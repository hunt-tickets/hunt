import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminConfigTabs } from "@/components/admin-config-tabs";
import { db } from "@/lib/drizzle";
import { paymentProcessorAccount, member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

interface ConfiguracionPageProps {
  params: Promise<{
    userId: string;
    organizationId: string;
  }>;
}

const ConfiguracionPage = async ({ params }: ConfiguracionPageProps) => {
  const { userId, organizationId } = await params;
  const reqHeaders = await headers();

  // Auth check using Better Auth
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

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

  // Check if user can view dashboard (sellers cannot access configuration)
  const canViewDashboard = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { dashboard: ["view"] },
      organizationId,
    },
  });

  if (!canViewDashboard?.success) {
    redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/mis-ventas`);
  }

  // Get full organization details with members and invitations
  const fullOrganization = await auth.api.getFullOrganization({
    query: {
      organizationId,
    },
    headers: reqHeaders,
  });

  if (!fullOrganization) {
    notFound();
  }

  // Get payment accounts for this organization
  const paymentAccounts = await db
    .select()
    .from(paymentProcessorAccount)
    .where(eq(paymentProcessorAccount.organizationId, organizationId));

  // Get current user's role in the organization
  const currentUserMember = fullOrganization.members?.find(
    (m: { userId: string }) => m.userId === userId
  );
  const currentUserRole = currentUserMember?.role || "member";

  // Prepare data for AdminConfigTabs
  const organizationData = {
    ...fullOrganization,
    paymentAccounts: paymentAccounts,
  };

  const teamMembers = fullOrganization.members || [];
  const invitations = fullOrganization.invitations || [];

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6">
      <AdminConfigTabs
        organization={organizationData}
        team={teamMembers}
        invitations={invitations}
        currentUserRole={currentUserRole}
      />
    </div>
  );
};

export default ConfiguracionPage;
