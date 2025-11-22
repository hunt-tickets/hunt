"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function addTeamMemberToProducer(
  producerId: string,
  email: string,
  rol: string
) {
  const supabase = await createClient();

  try {
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        message: "Autenticación requerida",
      };
    }

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      return {
        success: false,
        message: "Usuario no encontrado con ese correo electrónico",
      };
    }

    // Check if user is already in the team
    const { data: existingMember } = await supabase
      .from("producers_admin")
      .select("id")
      .eq("producer_id", producerId)
      .eq("profile_id", profile.id)
      .single();

    if (existingMember) {
      return {
        success: false,
        message: "Este usuario ya es miembro del equipo",
      };
    }

    // Add member to producer team
    const { error: insertError } = await supabase
      .from("producers_admin")
      .insert({
        producer_id: producerId,
        profile_id: profile.id,
        rol: rol,
      });

    if (insertError) {
      console.error("Error adding team member:", insertError);
      return {
        success: false,
        message: "Error al agregar el miembro al equipo",
      };
    }

    // Revalidate the producer profile page
    revalidatePath(`/profile/[userId]/administrador/marcas/[producerId]`);

    return {
      success: true,
      message: "Miembro agregado exitosamente",
    };
  } catch (error) {
    console.error("Unexpected error:", error);
    return {
      success: false,
      message: "Error inesperado al agregar el miembro",
    };
  }
}
