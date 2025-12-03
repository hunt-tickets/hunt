import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

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

  // Redirect to configuración page
  redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/configuracion`);
}
