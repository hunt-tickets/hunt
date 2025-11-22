"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { authClient } from "@/lib/auth-client";
import { Phone, Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PhoneVerificationManagerProps {
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean;
}

const countryCodes = [
  { code: "+57", country: "CO", flag: "🇨🇴" },
  // Add more as needed
];

export function PhoneVerificationManager({
  phoneNumber,
  phoneNumberVerified,
}: PhoneVerificationManagerProps) {
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);

  const [countryCode, setCountryCode] = useState("+57");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState("");

  const router = useRouter();

  // Timer for resend functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return phone;
    if (phone.startsWith("+")) {
      return phone;
    }
    if (phone.length >= 10) {
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  };

  const validatePhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 7 && cleaned.length <= 15;
  };

  const handleSendOTP = async () => {
    const fullPhoneNumber = countryCode + phoneInput.replace(/\D/g, "");

    if (!validatePhoneNumber(phoneInput)) {
      toast.error("Por favor ingresa un número de teléfono válido");
      return;
    }

    setIsSendingOTP(true);
    try {
      await authClient.phoneNumber.sendOtp({
        phoneNumber: fullPhoneNumber,
      });

      toast.success("¡Código de verificación enviado!");
      setPendingPhoneNumber(fullPhoneNumber);
      setResendTimer(60);
      setShowVerifyDialog(true);
      setShowAddDialog(false);
    } catch (error: unknown) {
      console.error("Failed to send OTP:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al enviar el código de verificación. Por favor intenta de nuevo.";
      toast.error(errorMessage);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleSendOTPExisting = async (existingPhoneNumber: string) => {
    setIsSendingOTP(true);
    try {
      await authClient.phoneNumber.sendOtp({
        phoneNumber: existingPhoneNumber,
      });

      toast.success("¡Código de verificación enviado!");
      setPendingPhoneNumber(existingPhoneNumber);
      setResendTimer(60);
      setShowVerifyDialog(true);
    } catch (error: unknown) {
      console.error("Failed to send OTP:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al enviar el código de verificación. Por favor intenta de nuevo.";
      toast.error(errorMessage);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.error("Por favor ingresa el código de verificación de 6 dígitos");
      return;
    }

    setIsVerifyingOTP(true);
    try {
      // Check if this is verifying an existing phone or adding/updating a new one
      const isExistingPhone = pendingPhoneNumber === phoneNumber;

      await authClient.phoneNumber.verify({
        phoneNumber: pendingPhoneNumber,
        code: otpCode,
        disableSession: true,
        // Only set updatePhoneNumber to true if adding/changing phone
        // For existing unverified phones, just verify without update flag
        updatePhoneNumber: !isExistingPhone,
      });

      toast.success("¡Número de teléfono verificado exitosamente!");

      setOtpCode("");
      setShowVerifyDialog(false);
      setPendingPhoneNumber("");
      setPhoneInput("");

      router.refresh();
    } catch (error: unknown) {
      console.error("Failed to verify OTP:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Código de verificación inválido. Por favor intenta de nuevo.";
      toast.error(errorMessage);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setIsSendingOTP(true);
    try {
      await authClient.phoneNumber.sendOtp({
        phoneNumber: pendingPhoneNumber,
      });

      toast.success("¡Nuevo código de verificación enviado!");
      setResendTimer(60);
    } catch (error: unknown) {
      console.error("Failed to resend OTP:", error);
      toast.error("Error al reenviar el código. Por favor intenta de nuevo.");
    } finally {
      setIsSendingOTP(false);
    }
  };

  const resetDialogs = () => {
    setShowAddDialog(false);
    setShowVerifyDialog(false);
    setPhoneInput("");
    setOtpCode("");
    setPendingPhoneNumber("");
    setResendTimer(0);
  };

  return (
    <>
      {/* Phone Number Display - Matches profile page style */}
      <div
        className="flex items-center justify-between p-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] min-h-[72px] hover:border-[#3a3a3a] hover:bg-[#202020] transition-colors cursor-pointer group"
        onClick={() => {
          if (!phoneNumber) {
            setShowAddDialog(true);
          }
        }}
      >
        <div className="flex items-center gap-3">
          <Phone className="h-5 w-5 text-gray-400" />
          <div>
            {phoneNumber ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {formatPhoneNumber(phoneNumber)}
                </span>
                {phoneNumberVerified ? (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-green-600/10 text-green-400 border-green-600/20"
                  >
                    Verificado
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-yellow-600/10 text-yellow-400 border-yellow-600/20"
                  >
                    Pendiente
                  </Badge>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">
                  Agregar número de teléfono
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {phoneNumber && !phoneNumberVerified && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSendOTPExisting(phoneNumber);
              }}
              disabled={isSendingOTP}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium text-gray-400 hover:text-gray-300"
            >
              {isSendingOTP ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Verificar"
              )}
            </Button>
          )}
          {!phoneNumber && (
            <button className="text-gray-400 hover:text-gray-300 invisible group-hover:visible transition-all">
              <span className="text-xl">⋯</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Phone Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-[#171717] border border-[#292929]">
          <DialogHeader>
            <DialogTitle className="text-white">
              Agregar Número de Teléfono
            </DialogTitle>
            <DialogDescription className="text-[#7A7A7A]">
              Ingresa tu número de teléfono para recibir códigos de
              verificación.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="country-code" className="text-[#A0A0A0]">
                Código de País
              </Label>
              <Select value={countryCode} onValueChange={setCountryCode}>
                <SelectTrigger className="bg-[#242424] border border-[#424242] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1d1d1d] border border-[#424242]">
                  {countryCodes.map((country) => (
                    <SelectItem
                      key={country.code}
                      value={country.code}
                      className="text-white hover:bg-[#242424]"
                    >
                      {country.flag} {country.code} {country.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="phone-number" className="text-[#A0A0A0]">
                Número de Teléfono
              </Label>
              <Input
                id="phone-number"
                placeholder="3214567890"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                className="bg-[#242424] border border-[#424242] text-white placeholder:text-[#7A7A7A]"
                disabled={isSendingOTP}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetDialogs}
              disabled={isSendingOTP}
              className="bg-[#242424] border border-[#424242] text-[#7A7A7A] hover:bg-[#1d1d1d]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSendOTP}
              disabled={isSendingOTP || !phoneInput.trim()}
              className="bg-white text-black hover:bg-gray-200"
            >
              {isSendingOTP ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Código"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* OTP Verification Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent className="bg-[#171717] border border-[#292929]">
          <DialogHeader>
            <DialogTitle className="text-white">
              Verificar Número de Teléfono
            </DialogTitle>
            <DialogDescription className="text-[#7A7A7A]">
              Ingresa el código de 6 dígitos enviado a{" "}
              {formatPhoneNumber(pendingPhoneNumber)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="otp-code" className="text-[#A0A0A0]">
                Código de Verificación
              </Label>
              <Input
                id="otp-code"
                placeholder="123456"
                value={otpCode}
                onChange={(e) =>
                  setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="bg-[#242424] border border-[#424242] text-white placeholder:text-[#7A7A7A] text-center text-lg tracking-widest"
                disabled={isVerifyingOTP}
                maxLength={6}
              />
            </div>
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || isSendingOTP}
                className="text-[#7A7A7A] hover:text-white"
              >
                {resendTimer > 0
                  ? `Reenviar en ${resendTimer}s`
                  : "Reenviar Código"}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetDialogs}
              disabled={isVerifyingOTP}
              className="bg-[#242424] border border-[#424242] text-[#7A7A7A] hover:bg-[#1d1d1d]"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleVerifyOTP}
              disabled={isVerifyingOTP || otpCode.length !== 6}
              className="bg-white text-black hover:bg-gray-200"
            >
              {isVerifyingOTP ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Verificar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
