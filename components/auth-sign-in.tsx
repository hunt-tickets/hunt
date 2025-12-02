"use client";

import { SignInPage, Testimonial } from "@/components/ui/sign-in";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const sampleTestimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    name: "Felipe Troncoso",
    handle: "@felipetroncoso",
    text: "Hunt ha sido un canal de ventas increible para todas las personas que quieren disfrutar de los eventos."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    name: "María González",
    handle: "@mariag",
    text: "La mejor plataforma para comprar tickets. Rápida, segura y confiable."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
    name: "Ana Martínez",
    handle: "@anamtz",
    text: "Excelente experiencia. El proceso de compra es súper intuitivo y seguro."
  },
];

const translateError = (errorMessage: string): string => {
  // Rate limiting error
  if (errorMessage.includes("For security purposes") || errorMessage.includes("Email rate limit exceeded")) {
    const match = errorMessage.match(/after (\d+) seconds/);
    const seconds = match ? match[1] : "unos";
    return `Por seguridad, puedes solicitar esto después de ${seconds} segundos.`;
  }

  // Other common errors
  if (errorMessage.includes("Invalid login credentials") || errorMessage.includes("Invalid OTP")) {
    return "Código de verificación inválido";
  }
  if (errorMessage.includes("Email not confirmed")) {
    return "Correo electrónico no confirmado";
  }
  if (errorMessage.includes("User already registered")) {
    return "Usuario ya registrado";
  }

  return errorMessage;
};

export const AuthSignIn = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [errorCountdown, setErrorCountdown] = useState<number | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL from query params
  const getRedirectUrl = () => {
    const redirect = searchParams?.get("redirect");
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

  // Dynamic error countdown
  useEffect(() => {
    if (errorCountdown !== null && errorCountdown > 0) {
      const timer = setInterval(() => {
        setErrorCountdown((prev) => {
          if (prev === null || prev <= 1) {
            setError(null);
            return null;
          }
          setError(`Por seguridad, puedes solicitar esto después de ${prev - 1} segundos.`);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [errorCountdown]);

  const handleSendOtp = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setErrorCountdown(null);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      setIsOtpSent(true);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Ocurrió un error";

      // Check if it's a rate limiting error
      if (errorMsg.includes("For security purposes") || errorMsg.includes("Email rate limit exceeded")) {
        const match = errorMsg.match(/after (\d+) seconds/);
        if (match) {
          const seconds = parseInt(match[1], 10);
          setErrorCountdown(seconds);
          setError(`Por seguridad, puedes solicitar esto después de ${seconds} segundos.`);
        } else {
          setError(translateError(errorMsg));
        }
      } else {
        setError(translateError(errorMsg));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    setError(null);
    setErrorCountdown(null);

    try {
      await authClient.signIn.emailOtp(
        { email, otp },
        {
          onSuccess: () => {
            handleRedirect(getRedirectUrl());
          },
          onError: (error: unknown) => {
            const errorMsg = error instanceof Error ? error.message : "Código inválido";

            // Check if it's a rate limiting error
            if (errorMsg.includes("For security purposes") || errorMsg.includes("Email rate limit exceeded")) {
              const match = errorMsg.match(/after (\d+) seconds/);
              if (match) {
                const seconds = parseInt(match[1], 10);
                setErrorCountdown(seconds);
                setError(`Por seguridad, puedes solicitar esto después de ${seconds} segundos.`);
              } else {
                setError(translateError(errorMsg));
              }
            } else {
              setError(translateError(errorMsg));
            }
          },
        }
      );
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Código inválido";
      setError(translateError(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async (email: string) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setErrorCountdown(null);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      setMessage("Código reenviado exitosamente");
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Ocurrió un error";

      // Check if it's a rate limiting error
      if (errorMsg.includes("For security purposes") || errorMsg.includes("Email rate limit exceeded")) {
        const match = errorMsg.match(/after (\d+) seconds/);
        if (match) {
          const seconds = parseInt(match[1], 10);
          setErrorCountdown(seconds);
          setError(`Por seguridad, puedes solicitar esto después de ${seconds} segundos.`);
        } else {
          setError(translateError(errorMsg));
        }
      } else {
        setError(translateError(errorMsg));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: getRedirectUrl(),
        },
        {
          onRequest: () => setIsLoading(true),
          onError: (ctx) => setError(ctx.error.message || "Error al iniciar sesión con Google"),
        }
      );
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Error al iniciar sesión con Google";
      setError(translateError(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.signIn.social(
        {
          provider: "apple",
          callbackURL: getRedirectUrl(),
        },
        {
          onRequest: () => setIsLoading(true),
          onError: (ctx) => setError(ctx.error.message || "Error al iniciar sesión con Apple"),
        }
      );
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Error al iniciar sesión con Apple";
      setError(translateError(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = () => {
    const redirect = searchParams?.get("redirect");
    if (redirect) {
      router.push(`/sign-up?redirect=${encodeURIComponent(redirect)}`);
    } else {
      router.push("/sign-up");
    }
  };

  return (
    <SignInPage
      title={
        <span className="font-semibold text-foreground tracking-tight" style={{ fontFamily: 'LOT, sans-serif' }}>
          Time to Hunt
        </span>
      }
      description={
        isOtpSent
          ? "Hemos enviado un código de 6 dígitos a tu correo electrónico"
          : "Accede a tu cuenta y descubre los mejores eventos"
      }
      heroImageSrc="animated" // Flag to show right section with animated background
      testimonials={sampleTestimonials}
      onSendOtp={handleSendOtp}
      onVerifyOtp={handleVerifyOtp}
      onResendOtp={handleResendOtp}
      onGoogleSignIn={handleGoogleSignIn}
      onAppleSignIn={handleAppleSignIn}
      onCreateAccount={handleCreateAccount}
      isOtpSent={isOtpSent}
      isLoading={isLoading}
      error={error}
      message={message}
    />
  );
};
