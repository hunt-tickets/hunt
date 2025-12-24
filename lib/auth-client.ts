// The client-side library helps you interact with the auth server.
"use client";

import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  magicLinkClient,
  phoneNumberClient,
  adminClient,
  organizationClient,
  inferOrgAdditionalFields,
} from "better-auth/client/plugins";
import { ac, owner, administrator, seller } from "@/lib/auth-permissions";
import type { auth } from "@/lib/auth";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    phoneNumberClient(),
    organizationClient({
      ac,
      roles: {
        owner,
        administrator,
        seller,
      },
      // Infer additional fields from the auth object type
      schema: inferOrgAdditionalFields<typeof auth>(),
    }),
    adminClient(),
  ],
});
