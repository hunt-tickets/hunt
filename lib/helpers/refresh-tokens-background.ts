import { db } from "@/lib/drizzle";
import {
  paymentProcessorAccount,
  type PaymentProcessorAccount,
} from "@/lib/schema";
import { eq } from "drizzle-orm";
import { refreshMercadopagoToken, shouldRefreshToken } from "@/lib/mercadopago";

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
 * @param organizationId - The organization ID (for logging)
 * @param accounts - The payment processor accounts to check/refresh
 */
export function refreshOrganizationTokensInBackground(
  organizationId: string,
  accounts: PaymentProcessorAccount[]
): void {
  // Fire-and-forget: Don't await, let it run in background
  performBackgroundRefresh(organizationId, accounts).catch((error) => {
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
  organizationId: string,
  accounts: PaymentProcessorAccount[]
): Promise<void> {
  try {
    // Filter to only active MercadoPago accounts that need refreshing
    const accountsToRefresh = accounts.filter(
      (account) =>
        account.processorType === "mercadopago" &&
        account.status === "active" &&
        account.refreshToken &&
        shouldRefreshToken(account.tokenExpiresAt)
    );

    if (accountsToRefresh.length === 0) {
      return; // No accounts need refreshing
    }

    // Refresh each account (already filtered to only those needing refresh)
    for (const account of accountsToRefresh) {
      console.log(
        `[Background Refresh] Refreshing token for account ${account.id}...`
      );

      try {
        // TypeScript type guard - ensure refreshToken is not null
        if (!account.refreshToken) {
          console.warn(
            `[Background Refresh] Account ${account.id} has no refresh token - skipping`
          );
          continue;
        }

        // Refresh the token (refreshToken is now guaranteed to be string)
        const newCredentials = await refreshMercadopagoToken(
          account.refreshToken
        );

        // Update database
        await db
          .update(paymentProcessorAccount)
          .set({
            accessToken: newCredentials.access_token,
            refreshToken: newCredentials.refresh_token || account.refreshToken,
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
