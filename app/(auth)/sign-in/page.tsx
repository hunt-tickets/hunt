"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { SignInPage } from "@/components/ui/sign-in";

function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL from query params
  const getRedirectUrl = () => {
    const redirect = searchParams.get("redirect");
    if (redirect) {
      // Validate URL and allow hunt-tickets.com domains + localhost for development
      try {
        const url = new URL(redirect);
        const isValidDomain =
          url.hostname.endsWith(".hunt-tickets.com") ||
          url.hostname === "hunt-tickets.com" ||
          // Allow localhost and local IP addresses for development
          url.hostname === "localhost" ||
          url.hostname.startsWith("192.168.") ||
          url.hostname.startsWith("10.") ||
          url.hostname.startsWith("172.");

        if (isValidDomain) {
          return redirect;
        }
      } catch (e) {
        // Invalid URL, fall back to profile
        console.log("Invalid redirect URL:", e);
      }
    }
    return "/profile";
  };

  // Helper to handle redirects (internal vs external)
  const handleRedirect = (url: string) => {
    try {
      const redirectUrl = new URL(url);
      const currentUrl = new URL(window.location.href);

      // If it's an external URL (different origin), use window.location.href
      if (redirectUrl.origin !== currentUrl.origin) {
        window.location.href = url;
      } else {
        // Internal redirect, use router
        router.push(url);
      }
    } catch (e) {
      // Fallback to router for relative URLs
      console.log(e);
      router.push(url);
    }
  };

  const handleSendOtp = async (email: string) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      setIsOtpSent(true);
      setMessage("Código enviado a tu correo");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      setError("Error al enviar el código. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (email: string, otp: string) => {
    setLoading(true);
    setError(null);

    try {
      await authClient.signIn.emailOtp(
        { email, otp },
        {
          onSuccess: () => {
            handleRedirect(getRedirectUrl());
          },
          onError: (error: unknown) => {
            console.error("OTP login failed:", error);
            setError("Código incorrecto. Intenta de nuevo.");
            setLoading(false);
          },
        }
      );
    } catch (error) {
      console.error("OTP login error:", error);
      setError("Error al verificar el código. Intenta de nuevo.");
      setLoading(false);
    }
  };

  const handleResendOtp = async (email: string) => {
    await handleSendOtp(email);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: getRedirectUrl(),
        },
        {
          onRequest: () => setLoading(true),
          onError: (ctx) => {
            setError(ctx.error.message || "Error al iniciar sesión");
            setLoading(false);
          },
        }
      );

      if (error) {
        setError(error.message || "Error al iniciar sesión");
        setLoading(false);
      }
    } catch {
      setError("Error inesperado. Intenta de nuevo.");
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    router.push("/sign-up");
  };

  return (
    <SignInPage
      title={
        <span className="font-light text-foreground tracking-tighter">
          Bienvenido de vuelta
        </span>
      }
      description="Accede a tu cuenta Hunt Tickets"
      heroImageSrc="/hero-image.jpg"
      testimonials={[
        {
          avatarSrc: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
          name: "María García",
          handle: "@maria_tickets",
          text: "La mejor plataforma para comprar boletos. ¡Super fácil de usar!",
        },
        {
          avatarSrc: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
          name: "Carlos Ruiz",
          handle: "@carlos_music",
          text: "Nunca pierdo un concierto gracias a Hunt Tickets.",
        },
      ]}
      onSendOtp={handleSendOtp}
      onVerifyOtp={handleVerifyOtp}
      onResendOtp={handleResendOtp}
      onGoogleSignIn={handleGoogleSignIn}
      onCreateAccount={handleCreateAccount}
      isOtpSent={isOtpSent}
      isLoading={loading}
      error={error}
      message={message}
    />
  );
}

export default function RouteComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
