"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { SiGoogle } from "react-icons/si";

interface LinkAccountButtonProps {
  providerId: string;
  providerName: string;
}

export function LinkAccountButton({
  providerId,
  providerName,
}: LinkAccountButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLinkAccount = async () => {
    setIsLoading(true);
    try {
      // Use Better Auth's linkSocial method
      await authClient.linkSocial({
        provider: providerId,
        callbackURL: "/profile", // Redirect back to profile after linking
      });

      // The above will redirect to the OAuth provider
      // After successful linking, user will be redirected back to /profile

    } catch (error) {
      setIsLoading(false);
      toast.error("Error al vincular la cuenta");
      console.error("Error linking account:", error);
    }
  };

  // Get provider icon
  const getProviderIcon = () => {
    if (providerId === "google") {
      return <SiGoogle className="h-4 w-4" />;
    }
    return <Link2 className="h-4 w-4" />;
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLinkAccount}
      disabled={isLoading}
      className="gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        getProviderIcon()
      )}
      {isLoading ? "Conectando..." : `Vincular ${providerName}`}
    </Button>
  );
}
