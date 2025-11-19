"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import Link from "next/link";

function SignInForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMagicLink, setShowMagicLink] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
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
        // Invalid URL, fall back to dashboard
        console.log("Invalid redirect URL:", e);
      }
    }
    return "/dashboard";
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

  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      setStep("otp");
    } catch (error) {
      console.error("Failed to send OTP:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authClient.signIn.emailOtp(
        { email, otp },
        {
          onSuccess: () => {
            handleRedirect(getRedirectUrl());
          },
          onError: (error) => {
            console.error("OTP login failed:", error);
          },
        }
      );
    } catch (error) {
      console.error("OTP login error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLinkSignIn = async (email: string) => {
    const { error } = await authClient.signIn.magicLink(
      {
        email,
        callbackURL: getRedirectUrl(),
      },
      {
        onRequest: () => setLoading(true),
        onSuccess: () => {
          setError("Check your email for the magic link!");
        },
        onError: (ctx) =>
          setError(ctx.error.message || "Magic link sign in failed"),
      }
    );

    if (error) {
      setError(error.message || "Magic link sign in failed");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await authClient.signIn.social(
        {
          provider: "google",
          callbackURL: getRedirectUrl(),
        },
        {
          onRequest: () => setLoading(true),
          onError: (ctx) => setError(ctx.error.message || "Sign in failed"),
        }
      );

      if (error) {
        setError(error.message || "Sign in failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setLoading(true);
    try {
      const response = await authClient.signIn.passkey();

      if (response?.data) {
        handleRedirect(getRedirectUrl());
      } else if (response?.error) {
        console.error("Passkey login failed:", response.error);

        if (
          response.error.message &&
          response.error.message.includes("cancelled")
        ) {
          alert(
            "Passkey authentication was cancelled. Please try again or use a different sign-in method."
          );
        } else if (
          response.error.message &&
          response.error.message.includes("not found")
        ) {
          alert(
            "No passkey found for this email address. Please register a passkey first or use a different sign-in method."
          );
        } else {
          alert(
            `Passkey login failed: ${
              response.error.message || "Unknown error"
            }. Please try again or use a different sign-in method.`
          );
        }
      }
    } catch (error) {
      console.error("Passkey login error:", error);
      alert(
        "An error occurred during passkey authentication. Please try again or use a different sign-in method."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (showMagicLink) {
      await handleMagicLinkSignIn(email);
    } else if (step === "email") {
      await handleSendOTP(e);
    } else {
      await handleOTPLogin(e);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 rounded-lg shadow-md border border-white/20 bg-black/40 backdrop-blur-sm">
      {/* Header Section */}
      <div className="flex-shrink-0 text-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-1">
          Bienvenido de vuelta
        </h2>
        <p className="text-xs text-[#7a7a7a]">
          Escoge tu método preferido para iniciar sesión
        </p>
      </div>

      {/* Main Content - Uses available space */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        {/* Primary Auth Methods */}
        <div className="space-y-3">
          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7a7a7a] text-sm"
                placeholder="Correo electrónico"
              />

              {step === "otp" && (
                <input
                  type="text"
                  autoComplete="one-time-code"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7a7a7a] text-sm"
                  placeholder="Ingresa el código de verificación"
                />
              )}
            </div>

            <div className="flex gap-2 text-xs">
              {step === "otp" ? (
                <>
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="flex-1 py-2 px-3 border border-transparent rounded-md font-medium text-[#7a7a7a] bg-[#242424] hover:bg-[#424242] transition-colors"
                  >
                    ← Atrás
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 px-3 border border-transparent rounded-md font-medium text-white bg-[#7a7a7a] hover:bg-[#606060] transition-colors disabled:opacity-50"
                  >
                    {loading ? "..." : "Verificar"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowMagicLink(!showMagicLink)}
                    className="flex-1 py-2 px-3 border border-transparent rounded-md font-medium text-[#7a7a7a] bg-[#242424] hover:bg-[#424242] transition-colors"
                  >
                    {showMagicLink ? "Usar OTP" : "Enlace mágico"}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2 px-3 border border-transparent rounded-md font-medium text-white bg-[#7a7a7a] hover:bg-[#606060] transition-colors disabled:opacity-50"
                  >
                    {loading
                      ? "..."
                      : showMagicLink
                      ? "Enviar enlace"
                      : "Enviar OTP"}
                  </button>
                </>
              )}
            </div>
          </form>
          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 py-0.5 bg-[#424242] border border-[#424242] rounded text-xs text-[#7a7a7a]">
                o
              </span>
            </div>
          </div>
          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-white/10 rounded-md bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 text-sm text-[#A0A0A0]"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuar con Google
          </button>

          {/* Error Message */}
          {error && (
            <div className="text-green-500 text-xs text-center p-2 bg-green-500/10 rounded">
              {error}
            </div>
          )}

          {/* Passkey Option */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 py-0.5 bg-[#424242] border border-[#424242] rounded text-xs text-[#7a7a7a]">
                o
              </span>
            </div>
          </div>

          <button
            onClick={handlePasskeyLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-white/10 rounded-md bg-white/5 hover:bg-white/10 transition-colors disabled:opacity-50 text-xs text-[#A0A0A0]"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
            Usar Passkey
          </button>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 text-center mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-2">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/sign-up"
              className="text-white hover:text-white/80 transition-colors font-medium"
            >
              Registrarse
            </Link>
          </p>
          <div className="text-xs text-gray-500 leading-relaxed">
            Al continuar, aceptas nuestros{" "}
            <Link
              href="/terms"
              className="text-white hover:text-white/80 underline"
            >
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link
              href="/privacy"
              className="text-white hover:text-white/80 underline"
            >
              Política de Privacidad
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RouteComponent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
