import { redirect, notFound } from "next/navigation";
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server";
import { ConfiguracionTabs } from "@/components/configuracion-tabs";
import { AdminHeader } from "@/components/admin-header";
=======
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminConfigTabs } from "@/components/admin-config-tabs";
import { db } from "@/lib/drizzle";
import { paymentProcessorAccount } from "@/lib/schema";
import { eq } from "drizzle-orm";
>>>>>>> a903bf6 (temp: admin config tabs implementation)

interface ConfiguracionPageProps {
  params: Promise<{
    userId: string;
  }>;
}

const ConfiguracionPage = async ({ params }: ConfiguracionPageProps) => {
  const { userId } = await params;
<<<<<<< HEAD
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    redirect("/login");
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("admin")
    .eq("id", user.id)
    .single();

  if (!profile?.admin) {
    notFound();
  }

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-4">
      {/* Page Header */}
      <AdminHeader
        title="CONFIGURACIÓN"
        subtitle="Administra la configuración del sistema"
      />

      {/* Configuration Tabs */}
      <ConfiguracionTabs />
=======

  // Auth check using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
  }

  // Get user's organizations
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Get the first organization (or selected from context/state)
  // TODO: Implement organization selection from sidebar context
  const selectedOrganization = organizations?.[0];

  if (!selectedOrganization) {
    // No organization available
    return (
      <div className="px-3 py-3 sm:px-6 sm:py-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            No tienes organizaciones
          </h3>
          <p className="text-sm text-white/60 max-w-md">
            Crea una organización desde la página de organizaciones para acceder a la configuración
          </p>
        </div>
      </div>
    );
  }

  // Get full organization details with members and invitations
  const fullOrganization = await auth.api.getFullOrganization({
    query: {
      organizationId: selectedOrganization.id,
    },
    headers: await headers(),
  });

  if (!fullOrganization) {
    notFound();
  }

  // Get payment accounts for this organization
  const paymentAccounts = await db
    .select()
    .from(paymentProcessorAccount)
    .where(eq(paymentProcessorAccount.organizationId, selectedOrganization.id));

  // Get current user's role in the organization
  const currentUserMember = fullOrganization.members?.find(
    (m) => m.userId === userId
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
>>>>>>> a903bf6 (temp: admin config tabs implementation)
    </div>
  );
};

<<<<<<< HEAD
export default ConfiguracionPage;
=======
export default ConfiguracionPage;
>>>>>>> a903bf6 (temp: admin config tabs implementation)
