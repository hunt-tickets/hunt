"use client";

import { SignUpPage } from "@/components/ui/sign-up";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

export const AuthSignUp = () => {
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [userData, setUserData] = useState<{
    nombre: string;
    apellido: string;
    phoneNumber: string;
    birthday: string;
    tipoDocumento: string;
    numeroDocumento: string;
  } | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get redirect URL from query params
  const getRedirectUrl = () => {
    const redirect = searchParams?.get("redirect");
    if (redirect) {
      try {
        const url = new URL(redirect);
        const isValidDomain =
          url.hostname.endsWith(".hunt-tickets.com") ||
          url.hostname === "hunt-tickets.com" ||
          url.hostname === "localhost" ||
          url.hostname.startsWith("192.168.") ||
          url.hostname.startsWith("10.") ||
          url.hostname.startsWith("172.");

        if (isValidDomain) {
          return redirect;
        }
      } catch (e) {
        console.log("Invalid redirect URL:", e);
      }
    }
    return "/profile";
  };

  const handleRedirect = (url: string) => {
    try {
      const redirectUrl = new URL(url);
      const currentUrl = new URL(window.location.href);

      if (redirectUrl.origin !== currentUrl.origin) {
        window.location.href = url;
      } else {
        router.push(url);
      }
    } catch (e) {
      console.log(e);
      router.push(url);
    }
  };

  const handleSendOtp = async (data: {
    email: string;
    nombre: string;
    apellido: string;
    phoneNumber: string;
    birthday: string;
    tipoDocumento: string;
    numeroDocumento: string;
  }) => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    setEmail(data.email);
    setUserData(data);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email: data.email,
        type: "sign-in",
      });
      setIsOtpSent(true);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Ocurrió un error";

      setError(translateError(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authClient.signIn.emailOtp(
        { email, otp },
        {
          onSuccess: async () => {
            // Update user profile with additional data
            if (userData) {
              try {
                await authClient.updateUser({
                  name: `${userData.nombre} ${userData.apellido}`,
                  phoneNumber: userData.phoneNumber,
                  // Store additional fields in metadata if needed
                });
              } catch (updateError) {
                console.error("Failed to update user profile:", updateError);
              }
            }
            handleRedirect(getRedirectUrl());
          },
          onError: (error: unknown) => {
            const errorMsg = error instanceof Error ? error.message : "Código inválido";

            setError(translateError(errorMsg));
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

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      setMessage("Código reenviado exitosamente");
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Ocurrió un error";

      setError(translateError(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    const redirect = searchParams?.get("redirect");
    if (redirect) {
      router.push(`/sign-in?redirect=${encodeURIComponent(redirect)}`);
    } else {
      router.push("/sign-in");
    }
  };

  return (
    <SignUpPage
      title={
        <span className="font-semibold text-foreground tracking-tight" style={{ fontFamily: 'LOT, sans-serif' }}>
          Join the Hunt
        </span>
      }
      description={
        isOtpSent
          ? "Hemos enviado un código de 6 dígitos a tu correo electrónico"
          : "Crea tu cuenta y comienza a descubrir eventos increíbles"
      }
      onSendOtp={handleSendOtp}
      onVerifyOtp={handleVerifyOtp}
      onResendOtp={handleResendOtp}
      onLogin={handleLogin}
      isOtpSent={isOtpSent}
      isLoading={isLoading}
      error={error}
      message={message}
    />
  );
};
