import { db } from "@/lib/drizzle";
import { paymentProcessorAccount } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import {
  refreshMercadopagoToken,
  shouldRefreshToken,
} from "@/lib/mercadopago";

/**
 * Background token refresh for an organization
 *
 * This runs in the background (fire-and-forget) when admins visit
 * organization pages, ensuring tokens are always fresh.
 *
 * IMPORTANT: This is non-blocking and runs asynchronously.
 * The page will render immediately with current data, and the
 * refresh happens in the background.
 *
 * @param organizationId - The organization to refresh tokens for
 */
export function refreshOrganizationTokensInBackground(
  organizationId: string
): void {
  // Fire-and-forget: Don't await, let it run in background
  performBackgroundRefresh(organizationId).catch((error) => {
    // Log errors but don't throw - this is background work
    console.error(
      `[Background Refresh] Failed for org ${organizationId}:`,
      error
    );
  });
}

/**
 * Internal function that does the actual refresh work
 */
async function performBackgroundRefresh(
  organizationId: string
): Promise<void> {
  try {
    // Find all active MercadoPago accounts for this organization
    const accounts = await db
      .select()
      .from(paymentProcessorAccount)
      .where(
        and(
          eq(paymentProcessorAccount.organizationId, organizationId),
          eq(paymentProcessorAccount.processorType, "mercadopago"),
          eq(paymentProcessorAccount.status, "active")
        )
      );

    if (accounts.length === 0) {
      return; // No accounts to refresh
    }

    // Check and refresh each account if needed
    for (const account of accounts) {
      // Skip if token doesn't need refresh yet
      if (!shouldRefreshToken(account.tokenExpiresAt)) {
        continue;
      }

      // Skip if no refresh token
      if (!account.refreshToken) {
        console.warn(
          `[Background Refresh] Account ${account.id} has no refresh token`
        );
        continue;
      }

      console.log(
        `[Background Refresh] Refreshing token for account ${account.id}...`
      );

      try {
        // Refresh the token
        const newCredentials = await refreshMercadopagoToken(
          account.refreshToken
        );

        // Update database
        await db
          .update(paymentProcessorAccount)
          .set({
            accessToken: newCredentials.access_token,
            refreshToken:
              newCredentials.refresh_token || account.refreshToken,
            tokenExpiresAt: newCredentials.expires_in
              ? new Date(Date.now() + newCredentials.expires_in * 1000)
              : null,
            scope: newCredentials.scope || account.scope,
            updatedAt: new Date(),
          })
          .where(eq(paymentProcessorAccount.id, account.id));

        console.log(
          `[Background Refresh] ✅ Token refreshed for account ${account.id}`
        );
      } catch (error) {
        // Log but continue with other accounts
        console.error(
          `[Background Refresh] ❌ Failed for account ${account.id}:`,
          error
        );
      }
    }
  } catch (error) {
    console.error(
      `[Background Refresh] Error for org ${organizationId}:`,
      error
    );
  }
}
