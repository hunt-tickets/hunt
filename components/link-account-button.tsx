"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface LinkAccountButtonProps {
  providerId: string;
  providerName?: string;
}

export function LinkAccountButton({
  providerId,
  // providerName,
}: LinkAccountButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLinkAccount = async () => {
    setIsLoading(true);
    try {
      // Use Better Auth's linkSocial method
      await authClient.linkSocial({
        provider: providerId,
        callbackURL: "/profile", // Redirect back to profile after linking
        errorCallbackURL: "/auth-error", // Custom error page
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
  // const getProviderIcon = () => {
  //   if (providerId === "google") {
  //     return (
  //       <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
  //         <path
  //           d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
  //           fill="#4285F4"
  //         />
  //         <path
  //           d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
  //           fill="#34A853"
  //         />
  //         <path
  //           d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
  //           fill="#FBBC05"
  //         />
  //         <path
  //           d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
  //           fill="#EA4335"
  //         />
  //       </svg>
  //     );
  //   }
  //   if (providerId === "apple") {
  //     return <SiApple className="h-4 w-4" />;
  //   }
  //   return <Link2 className="h-4 w-4" />;
  // };

  return (
    <Button
      onClick={handleLinkAccount}
      disabled={isLoading}
      className="bg-white/90 text-black hover:bg-gray-200/90 active:bg-gray-300/90 rounded-full px-3 sm:px-6 py-1.5 sm:py-2 h-auto text-xs sm:text-sm font-medium transition-all shadow-sm hover:shadow-md"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Conectando...</span>
          <span className="sm:hidden">...</span>
        </>
      ) : (
        "Conectar"
      )}
    </Button>
  );
}
