// The client-side library helps you interact with the auth server.
"use client";

import { createAuthClient } from "better-auth/react";
import {
  emailOTPClient,
  magicLinkClient,
  passkeyClient,
  phoneNumberClient,
} from "better-auth/client/plugins";
// import { anonymousClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [
    magicLinkClient(),
    emailOTPClient(),
    passkeyClient(),
    phoneNumberClient(),
    // anonymousClient(),
  ],
});
