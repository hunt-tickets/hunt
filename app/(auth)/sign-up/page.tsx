"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function RouteComponent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phonePrefix, setPhonePrefix] = useState("+57");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const router = useRouter();

  const fullPhoneNumber = `${phonePrefix}${phoneNumber}`;

  // Send email OTP (with SMS as secondary channel)
  const handleSendOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // First check if phone number is already verified by another user
      const phoneCheckResponse = await fetch(
        "/api/auth/verify-existing-phone",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ phoneNumber: fullPhoneNumber }),
        }
      );

      const phoneCheckData = await phoneCheckResponse.json();

      if (phoneCheckData.exists) {
        // Check if it's verified
        const verifiedCheckResponse = await fetch(
          "/api/auth/verify-existing-phone",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              phoneNumber: fullPhoneNumber,
              checkVerified: true,
            }),
          }
        );

        const verifiedCheckData = await verifiedCheckResponse.json();

        if (verifiedCheckData.isVerified) {
          setError(
            "Este número de teléfono ya está verificado por otra cuenta. Por favor usa un número diferente."
          );
          return;
        }
      }

      // Make request to email OTP endpoint with phone number included
      const response = await fetch(
        "/api/auth/email-otp/send-verification-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Phone-Number": fullPhoneNumber, // Also pass via header
            "X-User-Name": name,
          },
          body: JSON.stringify({
            email: email,
            type: "sign-in",
            phoneNumber: fullPhoneNumber, // Include for SMS convenience
            name: name,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setStep("otp");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      const errorMessage = error instanceof Error ? error.message : "";
      if (!errorMessage?.includes("teléfono ya está verificado")) {
        setError("No se pudo enviar el código. Verifica tus datos.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify email OTP and create user account via Better Auth
  const handleVerifyOTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Use Better Auth's email OTP sign-in/sign-up flow
      await authClient.signIn.emailOtp(
        { email, otp },
        {
          onSuccess: async (context) => {
            console.log("Email OTP verification successful:", context);

            // Update user profile with name and phone number after account creation
            try {
              // First check if phone number already exists
              const phoneCheckResponse = await fetch(
                "/api/auth/verify-existing-phone",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ phoneNumber: fullPhoneNumber }),
                }
              );

              const phoneCheckData = await phoneCheckResponse.json();

              if (phoneCheckData.exists) {
                // Phone number already exists, just update name
                await authClient.updateUser({
                  name: name,
                });
                console.log(
                  "User profile updated with name only (phone already in use)"
                );
                // Optionally show a warning to the user
                console.warn(
                  `Note: Phone number ${fullPhoneNumber} is already registered to another account`
                );
              } else {
                // Phone number doesn't exist, update both
                await authClient.updateUser({
                  name: name,
                  phoneNumber: fullPhoneNumber,
                });
                console.log("User profile updated with name and phone");
              }
            } catch (updateError) {
              console.error("Failed to update user profile:", updateError);
              // Don't fail the entire flow if profile update fails
            }

            router.push("/profile");
          },
          onError: (error) => {
            console.error("Email OTP verification failed:", error);
            setError("Código incorrecto. Intenta de nuevo.");
          },
        }
      );
    } catch (error) {
      console.error("Email OTP verification failed:", error);
      setError("Código incorrecto. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep("details");
    setOtp("");
    setError("");
  };

  return (
    <div className="w-full h-full flex flex-col p-4 sm:p-6 rounded-lg shadow-md border border-white/20 bg-black/40 backdrop-blur-sm">
      {/* Header Section */}
      <div className="flex-shrink-0 text-center mb-3 sm:mb-4">
        <h2 className="text-lg sm:text-xl font-semibold text-white mb-1">
          Crea tu cuenta de Hunt-Tickets
        </h2>
        <p className="text-xs text-[#7a7a7a]">
          {step === "details" &&
            "Completa todos los campos para crear tu cuenta"}
          {step === "otp" && "Ingresa el código que enviamos por email o SMS"}
        </p>
      </div>

      {/* Main Content - Uses available space */}
      <div className="flex-1 flex flex-col justify-between min-h-0">
        {/* Step Content */}
        <div className="space-y-3">
          {/* User Details Form */}
          {step === "details" && (
            <form onSubmit={handleSendOTP} className="space-y-3">
              <div className="space-y-2">
                {/* Name Field */}
                <input
                  type="text"
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7a7a7a] text-sm"
                  placeholder="Nombre completo"
                />

                {/* Email Field */}
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7a7a7a] text-sm"
                  placeholder="Correo electrónico"
                />

                {/* Phone Number Fields */}
                <div className="flex gap-2">
                  <select
                    value={phonePrefix}
                    onChange={(e) => setPhonePrefix(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-[#7a7a7a] text-sm min-w-[100px]"
                    required
                  >
                    <option value="+57" className="bg-black">
                      🇨🇴 +57
                    </option>
                    <option value="+1" className="bg-black">
                      🇺🇸 +1
                    </option>
                    <option value="+52" className="bg-black">
                      🇲🇽 +52
                    </option>
                    <option value="+34" className="bg-black">
                      🇪🇸 +34
                    </option>
                    <option value="+54" className="bg-black">
                      🇦🇷 +54
                    </option>
                    <option value="+51" className="bg-black">
                      🇵🇪 +51
                    </option>
                    <option value="+56" className="bg-black">
                      🇨🇱 +56
                    </option>
                    <option value="+58" className="bg-black">
                      🇻🇪 +58
                    </option>
                  </select>

                  <input
                    type="tel"
                    autoComplete="tel"
                    required
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(e.target.value.replace(/\D/g, ""))
                    }
                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7a7a7a] text-sm"
                    placeholder="300 123 4567"
                    maxLength={10}
                  />
                </div>

                <div className="text-xs text-gray-500 text-center">
                  Número completo: {fullPhoneNumber}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !name || !email || !phoneNumber}
                className="w-full py-3 px-4 border border-transparent rounded-md font-medium text-white bg-[#7a7a7a] hover:bg-[#606060] transition-colors disabled:opacity-50 text-sm"
              >
                {loading ? "Enviando códigos..." : "Continuar"}
              </button>
            </form>
          )}

          {/* OTP Verification */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOTP} className="space-y-3">
              <div className="space-y-2">
                <input
                  type="text"
                  autoComplete="one-time-code"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#7a7a7a] text-sm"
                  placeholder="Ingresa el código de verificación"
                  maxLength={6}
                />
                <div className="text-xs text-gray-400 text-center">
                  <div>Código enviado a:</div>
                  <div>📧 {email}</div>
                  <div>📱 {fullPhoneNumber}</div>
                </div>
              </div>

              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex-1 py-2 px-3 border border-transparent rounded-md font-medium text-[#7a7a7a] bg-[#242424] hover:bg-[#424242] transition-colors"
                >
                  ← Atrás
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 px-3 border border-transparent rounded-md font-medium text-white bg-[#7a7a7a] hover:bg-[#606060] transition-colors disabled:opacity-50"
                >
                  {loading ? "Verificando..." : "Verificar"}
                </button>
              </div>
            </form>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-xs text-center p-2 bg-red-500/10 rounded border border-red-500/20">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 text-center mt-3 pt-3 border-t border-white/10">
          <p className="text-xs text-gray-400 mb-2">
            Ya tienes una cuenta?{" "}
            <Link
              href="/sign-in"
              className="text-white hover:text-white/80 transition-colors font-medium"
            >
              Iniciar sesión{" "}
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
