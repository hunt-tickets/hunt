// The client-side library helps you interact with the auth server.
"use client";

import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  magicLinkClient,
  phoneNumberClient,
  adminClient,
  organizationClient,
} from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";
import { ac, owner, administrator, seller } from "@/lib/auth-permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    passkeyClient(),
    phoneNumberClient(),
    organizationClient({
      ac,
      roles: {
        owner,
        administrator,
        seller,
      },
    }),
    adminClient(),
  ],
});
