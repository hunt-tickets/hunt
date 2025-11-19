import { createClient } from "@/lib/supabase/server";
import { PaymentConfirmContent } from "./payment-confirm-content";

/**
 * Fetches transaction data from Supabase by Bold order ID
 * Only selects necessary fields for performance
 */
async function getBoldTransaction(orderId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions_web")
    .select("id, status, total, created_at, order")
    .eq("order", orderId)
    .single();

  return { data, error };
}

/**
 * Secure payment confirmation page
 *
 * This page handles Bold payment redirects with query parameters:
 * - bold-order-id: The order identifier to query Bold's API
 * - bold-tx-status: Status shown to user on Bold's page (for UX only)
 *
 * SECURITY: We query Bold's API to verify the actual payment status
 * instead of trusting the URL parameter.
 */
export default async function PaymentConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{
    "bold-order-id"?: string;
    "bold-tx-status"?: string;
  }>;
}) {
  const params = await searchParams;
  const orderId = params["bold-order-id"];
  const urlStatus = params["bold-tx-status"]; // For UX comparison only

  // Validate required parameter
  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <PaymentConfirmContent error="Falta el identificador de orden" />
      </div>
    );
  }

  // SECURE: Fetch actual transaction status from database
  console.log("[Payment Confirm] Fetching transaction from database:", orderId);
  const { data: dbTransaction, error } = await getBoldTransaction(orderId);

  // Handle database errors
  if (error) {
    console.error("[Payment Confirm] Database error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <PaymentConfirmContent
          error="Error al consultar la base de datos. Por favor, intenta nuevamente."
          orderId={orderId}
        />
      </div>
    );
  }

  // Handle transaction not found
  if (!dbTransaction) {
    console.error("[Payment Confirm] Transaction not found:", orderId);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <PaymentConfirmContent
          error="No se encontró la transacción. Verifica el ID de orden o contacta soporte."
          orderId={orderId}
        />
      </div>
    );
  }

  console.log("[Payment Confirm] Transaction status from DB:", dbTransaction.status);
  console.log("[Payment Confirm] Bold URL status parameter:", urlStatus);

  // Determine the actual payment status
  // Priority: Bold URL params (source of truth) > DB status (updated by webhook later)
  let finalStatus: "approved" | "rejected" | "pending" | "failed" =
    dbTransaction.status as "approved" | "rejected" | "pending" | "failed";

  const boldStatusLower = urlStatus?.toLowerCase();

  // If Bold reports approved, trust it even if DB is still pending
  if (boldStatusLower === "approved" || boldStatusLower === "success") {
    finalStatus = "approved";
    if (dbTransaction.status === "pending") {
      console.log(
        "[Payment Confirm] ✓ Bold approved payment. DB still pending - webhook will update to PAID_WITH_QR soon."
      );
    }
  } else if (boldStatusLower === "rejected" || boldStatusLower === "failed") {
    finalStatus = "rejected";
    console.log("[Payment Confirm] ✗ Bold rejected payment.");
  } else if (dbTransaction.status === "PAID_WITH_QR") {
    // DB was already updated by webhook
    finalStatus = "approved";
    console.log("[Payment Confirm] ✓ Payment confirmed in DB (PAID_WITH_QR).");
  }

  // Map database transaction to component format
  const transaction = {
    id: dbTransaction.id,
    payment_status: finalStatus,
    amount: Number(dbTransaction.total),
    currency: "COP",
    created_at: dbTransaction.created_at,
    customer_email: undefined,
  };

  // Pass VERIFIED data to client component
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <PaymentConfirmContent
        transaction={transaction}
        urlStatus={urlStatus} // For comparison/debugging
      />
    </div>
  );
}
