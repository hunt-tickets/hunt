import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import api from "@/lib/helpers/mp-api";
import { db } from "@/lib/drizzle";
import { paymentProcessorAccount } from "@/lib/schema";

export async function GET(request: NextRequest) {
  // Obtenemos el code de los request search-params
  const code = request.nextUrl.searchParams.get("code");

  // Check Session
  const session = await auth.api.getSession({
    headers: await headers(), // pass the headers object for Better Auth to handle cookies
  });

  if (!session?.user?.id) {
    return NextResponse.redirect(`${process.env.APP_URL}/sign-in`);
  }

  try {
    // Get OAuth credentials from MercadoPago
    const credentials = await api.user.connect(code!);
    console.log(credentials);

    // Validate credentials
    if (!credentials?.access_token) {
      throw new Error("No access token received from MercadoPago");
    }

    // Use the user_id directly from credentials response
    // The user_id field contains the actual MercadoPago user ID
    const processorAccountId =
      credentials.user_id?.toString() ||
      credentials.access_token.split("-").pop() ||
      "";

    if (!processorAccountId) {
      throw new Error("Could not extract MercadoPago user ID");
    }

    // Insert into payment_processor_account table
    await db.insert(paymentProcessorAccount).values({
      id: `mpa_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId: session.user.id,
      processorType: "mercadopago",
      processorAccountId,
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token || null,
      tokenExpiresAt: credentials.expires_in
        ? new Date(Date.now() + credentials.expires_in * 1000)
        : null,
      scope: credentials.scope || null,
      status: "active",
      metadata: JSON.stringify({
        public_key: credentials.public_key,
        live_mode: credentials.live_mode || false,
        user_id: processorAccountId,
      }),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.redirect(
      `${process.env.APP_URL}/dashboard?connected=mercadopago`
    );
  } catch (error) {
    console.error("MercadoPago connection error:", error);
    return NextResponse.redirect(
      `${process.env.APP_URL}/dashboard?error=connection_failed`
    );
  }
}
