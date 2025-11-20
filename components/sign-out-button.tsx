"use client";

import { authClient } from "@/lib/auth-client";
import { ReactNode } from "react";

interface SignOutButtonProps {
  children: ReactNode;
}

export function SignOutButton({ children }: SignOutButtonProps) {
  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return <div onClick={handleSignOut}>{children}</div>;
}
