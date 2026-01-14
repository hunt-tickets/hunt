import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function OrganizationPage({
  params,
}: {
  params: Promise<{ userId: string; organizationId: string }>;
}) {
  const { userId, organizationId } = await params;
  const reqHeaders = await headers();

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
    redirect(
      `/profile/${userId}/organizaciones/${organizationId}/administrador/mis-ventas`
    );
  }

  // Redirect to eventos page
  redirect(
    `/profile/${userId}/organizaciones/${organizationId}/administrador/eventos`
  );
}
