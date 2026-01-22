import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/drizzle";
import { paymentProcessorAccount } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import {
  refreshMercadopagoToken,
  shouldRefreshToken,
} from "@/lib/mercadopago";

/**
 * API Endpoint to manually refresh a MercadoPago access token
 *
 * Usage: POST /api/mercadopago/refresh
 * Body: { accountId: "mpa_..." }
 *
 * This endpoint:
 * 1. Verifies user authentication
 * 2. Checks user owns the account
 * 3. Refreshes the token if needed
 * 4. Updates the database with new tokens
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get account ID from request body
    const body = await request.json();
    const { accountId } = body;

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required" },
        { status: 400 }
      );
    }

    // Fetch the payment processor account
    const account = await db.query.paymentProcessorAccount.findFirst({
      where: and(
        eq(paymentProcessorAccount.id, accountId),
        eq(paymentProcessorAccount.userId, session.user.id),
        eq(paymentProcessorAccount.processorType, "mercadopago")
      ),
    });

    if (!account) {
      return NextResponse.json(
        { error: "Account not found or access denied" },
        { status: 404 }
      );
    }

    // Check if refresh token exists
    if (!account.refreshToken) {
      return NextResponse.json(
        {
          error:
            "No refresh token available. Please reconnect your MercadoPago account.",
        },
        { status: 400 }
      );
    }

    // Check if token actually needs refreshing
    const needsRefresh = shouldRefreshToken(account.tokenExpiresAt);

    if (!needsRefresh) {
      return NextResponse.json({
        message: "Token is still valid, no refresh needed",
        expiresAt: account.tokenExpiresAt,
      });
    }

    console.log(
      `[Token Refresh] Refreshing token for account ${accountId}...`
    );

    // Refresh the token
    const newCredentials = await refreshMercadopagoToken(
      account.refreshToken
    );

    // Update the database with new tokens
    // IMPORTANT: Both access_token AND refresh_token are updated!
    await db
      .update(paymentProcessorAccount)
      .set({
        accessToken: newCredentials.access_token,
        refreshToken: newCredentials.refresh_token || account.refreshToken, // Use new one if provided
        tokenExpiresAt: newCredentials.expires_in
          ? new Date(Date.now() + newCredentials.expires_in * 1000)
          : null,
        scope: newCredentials.scope || account.scope,
        updatedAt: new Date(),
      })
      .where(eq(paymentProcessorAccount.id, accountId));

    console.log(
      `[Token Refresh] ✅ Successfully refreshed token for account ${accountId}`
    );

    return NextResponse.json({
      success: true,
      message: "Token refreshed successfully",
      expiresAt: newCredentials.expires_in
        ? new Date(Date.now() + newCredentials.expires_in * 1000)
        : null,
    });
  } catch (error) {
    console.error("[Token Refresh] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to refresh token",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check if a token needs refreshing (without actually refreshing it)
 *
 * Usage: GET /api/mercadopago/refresh?accountId=mpa_...
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get account ID from query params
    const accountId = request.nextUrl.searchParams.get("accountId");

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId query parameter is required" },
        { status: 400 }
      );
    }

    // Fetch the payment processor account
    const account = await db.query.paymentProcessorAccount.findFirst({
      where: and(
        eq(paymentProcessorAccount.id, accountId),
        eq(paymentProcessorAccount.userId, session.user.id),
        eq(paymentProcessorAccount.processorType, "mercadopago")
      ),
    });

    if (!account) {
      return NextResponse.json(
        { error: "Account not found or access denied" },
        { status: 404 }
      );
    }

    const needsRefresh = shouldRefreshToken(account.tokenExpiresAt);
    const daysUntilExpiry = account.tokenExpiresAt
      ? Math.floor(
          (account.tokenExpiresAt.getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      : null;

    return NextResponse.json({
      accountId: account.id,
      processorAccountId: account.processorAccountId,
      expiresAt: account.tokenExpiresAt,
      daysUntilExpiry,
      needsRefresh,
      hasRefreshToken: !!account.refreshToken,
    });
  } catch (error) {
    console.error("[Token Check] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to check token status",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
