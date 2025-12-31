import crypto from "crypto";

/**
 * MercadoPago Webhook Signature Validation
 *
 * HOW IT WORKS:
 * -------------
 * MercadoPago sends webhooks with a cryptographic signature to prove they're authentic.
 * This prevents attackers from sending fake payment notifications to your server.
 *
 * THE VALIDATION PROCESS:
 *
 * 1. MercadoPago sends these headers with each webhook:
 *    - x-signature: "ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839"
 *    - x-request-id: "unique-request-identifier"
 *
 * 2. MercadoPago also sends query params:
 *    - data.id: "12345" (the payment ID or resource ID)
 *
 * 3. To validate authenticity, we:
 *    a) Extract the timestamp (ts) and signature hash (v1) from x-signature
 *    b) Build a "manifest" string using the exact format MP expects:
 *       "id:[data.id];request-id:[x-request-id];ts:[timestamp];"
 *    c) Generate our own HMAC-SHA256 hash of this manifest using our secret key
 *    d) Compare our computed hash with the v1 hash MP sent
 *    e) If they match → the webhook is authentic from MercadoPago
 *    f) If they don't match → someone is trying to fake a webhook (reject it!)
 *
 * 4. The secret key is unique to your application and is found in:
 *    MercadoPago Dashboard > Your Integrations > Webhooks section
 *
 * WHY THIS IS SECURE:
 * ------------------
 * - Only MercadoPago knows your secret key (and you)
 * - An attacker can't generate a valid signature without the secret
 * - HMAC is a one-way function: you can't reverse it to get the secret
 * - Even if someone intercepts a webhook, they can't reuse it with different data
 *   because the signature would be invalid
 *
 * EXAMPLE:
 * --------
 * Imagine MP sends:
 *   x-signature: "ts=1704908010,v1=abc123..."
 *   x-request-id: "req-456"
 *   data.id: "payment-789"
 *
 * We build: "id:payment-789;request-id:req-456;ts:1704908010;"
 * We hash it with our secret: HMAC-SHA256("id:payment-789;...", "our-secret") → "abc123..."
 * We compare: "abc123..." === "abc123..." → VALID! ✅
 */

/**
 * Validates MercadoPago webhook signature to ensure authenticity
 *
 * @param xSignature - The x-signature header from MercadoPago (format: "ts=123,v1=hash")
 * @param xRequestId - The x-request-id header from MercadoPago
 * @param dataId - The data.id from query params (MUST be lowercase if alphanumeric per MP docs)
 * @param secret - Your webhook secret key from MercadoPago dashboard
 * @returns boolean - true if signature is valid (webhook is authentic), false otherwise
 *
 * @example
 * // In your webhook handler:
 * const isValid = validateMercadoPagoSignature(
 *   request.headers.get('x-signature'),
 *   request.headers.get('x-request-id'),
 *   searchParams.get('data.id'),
 *   process.env.MP_WEBHOOK_SECRET
 * );
 *
 * if (!isValid) {
 *   return new Response('Unauthorized', { status: 401 });
 * }
 */
export function validateMercadoPagoSignature(
  xSignature: string | null,
  xRequestId: string | null,
  dataId: string | null,
  secret: string | undefined
): boolean {
  // STEP 1: Validate all required parameters exist
  // Without any of these, we can't validate the signature
  if (!xSignature || !xRequestId || !dataId || !secret) {
    console.error("[MP Signature] Missing required parameters:", {
      hasSignature: !!xSignature,
      hasRequestId: !!xRequestId,
      hasDataId: !!dataId,
      hasSecret: !!secret,
    });
    return false;
  }

  try {
    // STEP 2: Parse the x-signature header to extract timestamp and hash
    // Format: "ts=1704908010,v1=618c85345248dd820d5fd456117c2ab2ef8eda45a0282ff693eac24131a5e839"
    // We need to extract:
    //   - ts: timestamp in seconds (when MP sent the webhook)
    //   - v1: the HMAC-SHA256 signature that MP generated
    const parts = xSignature.split(","); // Split by comma → ["ts=1704908010", "v1=618c..."]
    let ts: string | null = null;
    let hash: string | null = null;

    // Loop through each part to extract ts and v1
    for (const part of parts) {
      const [key, value] = part.split("=").map((s) => s.trim());
      if (key === "ts") {
        ts = value; // Extract timestamp
      } else if (key === "v1") {
        hash = value; // Extract MercadoPago's signature
      }
    }

    // If we couldn't extract both values, the x-signature format is invalid
    if (!ts || !hash) {
      console.error("[MP Signature] Failed to extract ts or hash from x-signature");
      return false;
    }

    // STEP 3: Normalize the data.id to lowercase
    // Per MercadoPago documentation: "if the data.id_url is alphanumeric,
    // it must be sent in lowercase"
    const normalizedDataId = dataId.toLowerCase();

    // STEP 4: Build the "manifest" string
    // This MUST match the exact format MercadoPago uses:
    // "id:[data.id];request-id:[x-request-id];ts:[timestamp];"
    //
    // IMPORTANT: The semicolons and colons MUST be in the exact positions!
    // Even one character difference will make the signature invalid
    const manifest = `id:${normalizedDataId};request-id:${xRequestId};ts:${ts};`;

    console.log("[MP Signature] Validating with manifest:", manifest);

    // STEP 5: Generate OUR OWN signature using the same method MP used
    // We use HMAC-SHA256 algorithm:
    //   - Message: the manifest string we just built
    //   - Secret: our webhook secret key from MP dashboard
    //
    // HMAC (Hash-based Message Authentication Code) works like this:
    //   HMAC(secret, message) → unique hash
    //
    // The same secret + message will ALWAYS produce the same hash
    // Different secret or message → completely different hash
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(manifest);
    const computedHash = hmac.digest("hex"); // Convert to hexadecimal string

    // STEP 6: Compare our computed hash with MercadoPago's hash
    // If they match → MercadoPago used the same secret (only MP and us know it)
    // If they don't match → either:
    //   a) The webhook is fake (attacker doesn't have our secret)
    //   b) The data was tampered with (manifest would be different)
    //   c) Wrong secret configured (check your .env file)
    const isValid = computedHash === hash;

    if (!isValid) {
      console.error("[MP Signature] Validation failed:", {
        computed: computedHash,
        received: hash,
        manifest: manifest,
      });
    } else {
      console.log("[MP Signature] Validation successful ✅");
    }

    return isValid;
  } catch (error) {
    console.error("[MP Signature] Error during validation:", error);
    return false;
  }
}

/**
 * BONUS: Timestamp validation to prevent replay attacks
 *
 * WHAT IS A REPLAY ATTACK?
 * -----------------------
 * An attacker intercepts a valid webhook (with valid signature) and
 * re-sends it later to trigger duplicate actions (like double-crediting a payment).
 *
 * HOW TIMESTAMP VALIDATION HELPS:
 * ------------------------------
 * We check if the webhook was sent recently (within tolerance window).
 * If the timestamp is too old (e.g., > 5 minutes), we reject it even if
 * the signature is valid.
 *
 * This prevents attackers from replaying old valid webhooks.
 *
 * IMPORTANT: This is OPTIONAL extra security. The signature validation
 * is the primary security mechanism.
 */
export function validateMercadoPagoTimestamp(
  xSignature: string | null,
  toleranceSeconds: number = 300 // Default: 5 minutes
): boolean {
  if (!xSignature) {
    return false;
  }

  try {
    // Extract the timestamp from x-signature
    const parts = xSignature.split(",");
    let ts: string | null = null;

    for (const part of parts) {
      const [key, value] = part.split("=").map((s) => s.trim());
      if (key === "ts") {
        ts = value;
        break;
      }
    }

    if (!ts) {
      console.error("[MP Timestamp] No timestamp found in x-signature");
      return false;
    }

    // Convert timestamp to milliseconds (MP sends in seconds)
    const notificationTime = parseInt(ts, 10) * 1000;
    const currentTime = Date.now();

    // Calculate how old the notification is (in seconds)
    const age = (currentTime - notificationTime) / 1000;

    // Check if the notification is within the acceptable time window
    const isValid = age <= toleranceSeconds;

    if (!isValid) {
      console.warn("[MP Timestamp] Notification too old:", {
        age: `${age}s`,
        tolerance: `${toleranceSeconds}s`,
      });
    }

    return isValid;
  } catch (error) {
    console.error("[MP Timestamp] Error validating timestamp:", error);
    return false;
  }
}
