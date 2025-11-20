"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

interface SignOutButtonProps {
  children: ReactNode;
}

export function SignOutButton({ children }: SignOutButtonProps) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
        },
      },
    });
  };

  return <div onClick={handleSignOut}>{children}</div>;
}
