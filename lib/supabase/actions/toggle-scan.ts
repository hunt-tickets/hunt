"use server";

import { createClient } from "@/lib/supabase/server";

export async function toggleQRScanStatus(qrId: string, currentStatus: boolean) {
  const supabase = await createClient();

  // Get current user for scanner info
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  const newStatus = !currentStatus;

  // Update QR code scan status
  const { error } = await supabase
    .from("qr_codes")
    .update({
      scan: newStatus,
      scanner_id: newStatus ? user.id : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", qrId);

  if (error) {
    console.error("Error updating QR scan status:", error);
    return { success: false, error: error.message };
  }

  return { success: true, newStatus };
}
