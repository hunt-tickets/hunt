"use server";
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { createClient } from "@/lib/supabase/server";

interface SendCourtesyParams {
  eventId: string;
  targetEmail: string;
  targetName: string;
}

interface SendCourtesyResponse {
  success: boolean;
  error?: string;
}

export async function sendCourtesy({
  eventId,
  targetEmail,
  targetName,
}: SendCourtesyParams): Promise<SendCourtesyResponse> {
  try {
    const supabase = await createClient();

    // Call the edge function from server-side
    const { data, error } = await supabase.functions.invoke("guest-list-service", {
      body: {
        event_id: eventId,
        target_email: targetEmail,
        target_name: targetName,
      },
    });

    if (error) {
      console.error("Error invoking guest-list-service:", error);
      return {
        success: false,
        error: error.message || "Error al enviar la cortesía",
      };
    }

    return {
      success: true,
    };
  } catch (error: any) {
    console.error("Error in sendCourtesy action:", error);
    return {
      success: false,
      error: error.message || "Error inesperado al enviar la cortesía",
    };
  }
}
