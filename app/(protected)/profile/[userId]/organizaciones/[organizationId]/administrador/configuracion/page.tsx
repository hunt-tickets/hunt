import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminConfigTabs } from "@/components/admin-config-tabs";
import { AdminHeader } from "@/components/admin-header";
import { db } from "@/lib/drizzle";
import { organization } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getMercadopagoAuthorizationUrl, shouldRefreshToken } from "@/lib/mercadopago";
import { refreshOrganizationTokensInBackground } from "@/lib/helpers/refresh-tokens-background";

interface ConfiguracionPageProps {
  params: Promise<{
    userId: string;
    organizationId: string;
  }>;
}

const ConfiguracionPage = async ({ params }: ConfiguracionPageProps) => {
  const { userId, organizationId } = await params;
  const reqHeaders = await headers();

  // Check if user can view dashboard (sellers cannot access configuration)
  const canViewDashboard = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { dashboard: ["view"] },
      organizationId,
    },
  });

  if (!canViewDashboard?.success) {
    redirect(
      `/profile/${userId}/organizaciones/${organizationId}/administrador/mis-ventas`
    );
  }

  // Get full organization details with members, invitations, and payment accounts
  const fullOrganization = await db.query.organization.findFirst({
    where: eq(organization.id, organizationId),
    with: {
      members: {
        with: {
          user: true,
        },
      },
      invitations: true,
      paymentProcessorAccount: true,
    },
  });

  if (!fullOrganization) {
    notFound();
  }

  // Get current user's role in the organization
  const currentUserMember = fullOrganization.members?.find(
    (m: { userId: string }) => m.userId === userId
  );
  const currentUserRole = currentUserMember?.role || "member";

  // Get MercadoPago OAuth URL
  const mpOauthUrl = await getMercadopagoAuthorizationUrl(organizationId);

  // Smart background token refresh: only trigger if we actually have tokens that need refreshing
  // Check if any MercadoPago accounts have tokens expiring in < 30 days
  const hasTokensNeedingRefresh = fullOrganization.paymentProcessorAccount?.some(
    (account) =>
      account.processorType === "mercadopago" &&
      account.refreshToken && // Must have a refresh token
      shouldRefreshToken(account.tokenExpiresAt)
  );

  if (hasTokensNeedingRefresh) {
    // Only trigger background refresh if there's actually something to refresh
    refreshOrganizationTokensInBackground(organizationId);
  }

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Page Header */}
      <AdminHeader
        title="Configuración"
        subtitle="Gestiona tu organización, equipo y procesadores de pago"
      />

      <AdminConfigTabs
        organization={fullOrganization}
        currentUserRole={currentUserRole}
        currentUserId={userId}
        mpOauthUrl={mpOauthUrl}
      />
    </div>
  );
};

export default ConfiguracionPage;
