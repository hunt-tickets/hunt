import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminHeader } from "@/components/admin-header";
import { db } from "@/lib/drizzle";
import { paymentProcessorAccount } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { getMercadopagoAuthorizationUrl } from "@/lib/mercadopago";
import { IntegrationsClient } from "@/components/integrations/integrations-client";

interface IntegrationsPageProps {
  params: Promise<{
    userId: string;
    organizationId: string;
  }>;
  searchParams: Promise<{
    connected?: string;
  }>;
}

export default async function IntegrationsPage({
  params,
  searchParams,
}: IntegrationsPageProps) {
  const { userId, organizationId } = await params;
  const { connected } = await searchParams;
  const reqHeaders = await headers();

  // Check if user can view dashboard (sellers cannot access integrations)
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

  // Get payment accounts for this organization
  const paymentAccounts = await db
    .select()
    .from(paymentProcessorAccount)
    .where(eq(paymentProcessorAccount.organizationId, organizationId));

  // Get MercadoPago OAuth URL
  const mpOauthUrl = await getMercadopagoAuthorizationUrl(organizationId);

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Page Header */}
      <AdminHeader
        title="Integraciones"
        subtitle="Conecta servicios externos para ampliar las funcionalidades de tu organización"
      />

      {/* Client Component with all interactive logic */}
      <IntegrationsClient
        paymentAccounts={paymentAccounts}
        mpOauthUrl={mpOauthUrl}
        organizationId={organizationId}
        connectedIntegration={connected}
      />
    </div>
  );
}
