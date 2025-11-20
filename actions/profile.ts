"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { schema } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateProfile(
  _prevState: any,
  formData: FormData
): Promise<{ success?: boolean; error?: string }> {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "No autenticado" };
    }

    // Extract form data
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    // Validate required fields
    if (!name) {
      return { error: "Nombre es requerido" };
    }

    // Update user in Better Auth database using Drizzle
    await db
      .update(schema.user)
      .set({
        name,
        phoneNumber: phone || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.user.id, session.user.id));

    // Revalidate the profile page
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "Error al actualizar el perfil" };
  }
}

export async function getAllUsers() {
  const { DUMMY_PROFILES } = await import("@/lib/dummy-data");
  return DUMMY_PROFILES;
}

export async function getUsersWithPurchasesStats() {
  return [];
}
