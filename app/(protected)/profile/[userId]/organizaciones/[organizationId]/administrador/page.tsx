import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, Users } from "lucide-react";
import { InviteMemberDialog } from "@/components/invite-member-dialog";
import PaymentSettings from "@/components/organization-payment-accounts-settings";
import { db } from "@/lib/drizzle";
import { paymentProcessorAccount, member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { AdminHeader } from "@/components/admin-header";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ userId: string; organizationId: string }>;
}) {
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

  // Check dashboard permission - sellers cannot view dashboard
  const canViewDashboard = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { dashboard: ["view"] },
      organizationId,
    },
  });

  if (!canViewDashboard?.success) {
    // Redirect sellers to their sales page
    redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/mis-ventas`);
  }

  // Fetch full organization details
  const organization = await auth.api.getFullOrganization({
    query: { organizationId },
    headers: reqHeaders,
  });

  if (!organization) {
    redirect("/profile");
  }

  // Fetch payment accounts for this organization
  const paymentAccounts = await db
    .select()
    .from(paymentProcessorAccount)
    .where(eq(paymentProcessorAccount.organizationId, organizationId));

  // Format dates
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format role for display
  const formatRole = (role: string) => {
    const roleMap: { [key: string]: string } = {
      owner: "Propietario",
      administrator: "Administrador",
      seller: "Vendedor",
      member: "Miembro",
    };
    return roleMap[role] || role;
  };

  // Check permissions using Better Auth AC
  const [canInviteResult, canManagePaymentResult] = await Promise.all([
    auth.api.hasPermission({
      headers: reqHeaders,
      body: { permission: { invitation: ["create"] }, organizationId },
    }),
    auth.api.hasPermission({
      headers: reqHeaders,
      body: { permission: { payment: ["manage"] }, organizationId },
    }),
  ]);

  const canInvite = canInviteResult?.success ?? false;
  const canManagePaymentProcessorAccount = canManagePaymentResult?.success ?? false;

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Page Header */}
      <AdminHeader
        title="Dashboard"
        subtitle={`@${organization.slug}`}
      />

      {/* Organization Info Cards */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Organization Details */}
        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Detalles de la Organización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Fecha de creación</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(organization.createdAt)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Miembros totales</p>
                <p className="text-sm text-muted-foreground">
                  {organization.members?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card className="lg:col-span-2 bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Miembros
              </CardTitle>
              {canInvite && (
                <InviteMemberDialog organizationId={organizationId} />
              )}
            </div>
            <CardDescription>
              Usuarios que forman parte de esta organización
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organization.members && organization.members.length > 0 ? (
                organization.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-[#303030] bg-background/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {member.user?.name?.[0]?.toUpperCase() || "?"}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {member.user?.name || "Usuario sin nombre"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {member.user?.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {formatRole(member.role)}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay miembros en esta organización
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Settings - Only for owners */}
      {canManagePaymentProcessorAccount && (
        <PaymentSettings
          org={{ ...organization, paymentAccounts: paymentAccounts }}
        />
      )}

      {/* Metadata (if exists) */}
      {organization.metadata && (
        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader>
            <CardTitle>Metadata</CardTitle>
            <CardDescription>
              Información adicional de la organización
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="text-xs font-mono p-3 rounded-md bg-muted overflow-x-auto">
              {JSON.stringify(organization.metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
