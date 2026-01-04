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

    // Update user using Better Auth's built-in method
    // Note: updateUser API endpoint requires the user to be authenticated
    // For phone number, we'll still use direct DB update as it's a custom field
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

export async function changeEmail(
  newEmail: string,
  callbackURL?: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "No autenticado" };
    }

    // Use Better Auth's changeEmail endpoint
    await auth.api.changeEmail({
      body: {
        newEmail,
        callbackURL: callbackURL || "/profile",
      },
      headers: await headers(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error changing email:", error);
    return { error: "Error al cambiar el correo electrónico" };
  }
}

export async function checkHasPassword(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return false;
    }

    // Check if user has a credential account with a password set
    const credentialAccount = await db
      .select()
      .from(schema.account)
      .where(eq(schema.account.userId, session.user.id))
      .then((accounts) =>
        accounts.find((acc) => acc.providerId === "credential")
      );

    // Return true only if credential account exists AND has a password
    return !!credentialAccount && !!credentialAccount.password;
  } catch (error) {
    console.error("Error checking password:", error);
    return false;
  }
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  revokeOtherSessions?: boolean
): Promise<{ success?: boolean; error?: string }> {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "No autenticado" };
    }

    // Check if user has a password first
    const hasPassword = await checkHasPassword();
    if (!hasPassword) {
      return {
        error:
          "No tienes una contraseña configurada. Has iniciado sesión con OAuth (Google, etc.).",
      };
    }

    // Use Better Auth's changePassword endpoint
    await auth.api.changePassword({
      body: {
        currentPassword,
        newPassword,
        revokeOtherSessions: revokeOtherSessions || false,
      },
      headers: await headers(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Error al cambiar la contraseña",
    };
  }
}

export async function getUsersWithPurchasesStats() {
  return [];
}

export async function unlinkAccount(
  accountId: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: "No autenticado" };
    }

    // Fetch the account to verify ownership and provider
    const account = await db
      .select()
      .from(schema.account)
      .where(eq(schema.account.id, accountId))
      .limit(1);

    if (!account || account.length === 0) {
      return { error: "Cuenta no encontrada" };
    }

    // Verify the account belongs to the current user
    if (account[0].userId !== session.user.id) {
      return { error: "No autorizado" };
    }

    // Prevent unlinking credential provider (email/password)
    if (account[0].providerId === "credential") {
      return {
        error:
          "No puedes desvincular tu método de autenticación principal (email/contraseña)",
      };
    }

    // Check if user has at least one other authentication method
    const userAccounts = await db
      .select()
      .from(schema.account)
      .where(eq(schema.account.userId, session.user.id));

    if (userAccounts.length <= 1) {
      return {
        error:
          "Debes tener al menos un método de autenticación. No puedes desvincular tu última cuenta.",
      };
    }

    // Delete the account
    await db.delete(schema.account).where(eq(schema.account.id, accountId));

    // Revalidate the profile page
    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Error unlinking account:", error);
    return { error: "Error al desvincular la cuenta" };
  }
}
