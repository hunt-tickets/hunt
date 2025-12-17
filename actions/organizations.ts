"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface UpdateOrganizationData {
  // Basic fields
  name: string;
  slug: string;
  logo?: string;
  // Additional fields (defined in Better Auth organization plugin schema)
  tipoOrganizacion?: "natural" | "juridica";
  nombres?: string;
  apellidos?: string;
  tipoDocumento?: string;
  numeroDocumento?: string;
  nit?: string;
  direccion?: string;
  numeroTelefono?: string;
  correoElectronico?: string;
  rutUrl?: string;
  cerlUrl?: string;
}

export async function updateOrganization(
  organizationId: string,
  data: UpdateOrganizationData
): Promise<{ success?: boolean; error?: string }> {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "No autenticado" };
    }

    // Check if user is owner of the organization
    const memberRecord = await db.query.member.findFirst({
      where: and(
        eq(member.userId, session.user.id),
        eq(member.organizationId, organizationId)
      ),
    });

    if (!memberRecord || memberRecord.role !== "owner") {
      return { error: "Solo los propietarios pueden editar la organización" };
    }

    // Update via Better Auth - all fields including additional fields
    // are automatically handled by the organization plugin
    const result = await auth.api.updateOrganization({
      body: {
        data: {
          name: data.name,
          slug: data.slug,
          logo: data.logo || undefined,
          // Additional fields are now supported via additionalFields in the plugin
          tipoOrganizacion: data.tipoOrganizacion || undefined,
          nombres: data.nombres || undefined,
          apellidos: data.apellidos || undefined,
          tipoDocumento: data.tipoDocumento || undefined,
          numeroDocumento: data.numeroDocumento || undefined,
          nit: data.nit || undefined,
          direccion: data.direccion || undefined,
          numeroTelefono: data.numeroTelefono || undefined,
          correoElectronico: data.correoElectronico || undefined,
          rutUrl: data.rutUrl || undefined,
          cerlUrl: data.cerlUrl || undefined,
        },
        organizationId,
      },
      headers: await headers(),
    });

    if (!result) {
      return { error: "Error al actualizar la organización" };
    }

    // Revalidate paths
    revalidatePath(
      `/profile/${session.user.id}/organizaciones/${organizationId}/administrador/configuracion`
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating organization:", error);
    return { error: "Error al actualizar la organización" };
  }
}
