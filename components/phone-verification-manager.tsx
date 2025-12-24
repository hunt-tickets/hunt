"use client";

import React, { useState, useEffect, forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { Phone, Loader2, Edit2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import PhoneInputWithCountry from 'react-phone-number-input';
import type { E164Number } from 'libphonenumber-js/core';
import 'react-phone-number-input/style.css';

interface PhoneVerificationManagerProps {
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean;
}

const InputComponent = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
  <input {...props} ref={ref} />
));
InputComponent.displayName = 'PhoneInputComponent';

export function PhoneVerificationManager({
  phoneNumber,
  phoneNumberVerified,
}: PhoneVerificationManagerProps) {
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [phoneInput, setPhoneInput] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(0);

  const [showOTPInput, setShowOTPInput] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState("");
  const [hasAutoSent, setHasAutoSent] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

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

  // Auto-send OTP when a valid phone number is entered for the first time
  useEffect(() => {
    if (phoneInput && phoneInput.length >= 10 && !hasAutoSent && !phoneNumber) {
      const timer = setTimeout(() => {
        handleSendOTP(true);
        setHasAutoSent(true);
      }, 2000); // 2 second delay to ensure user finished typing

      return () => clearTimeout(timer);
    }
  }, [phoneInput, hasAutoSent, phoneNumber]);

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

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newOtp.every(digit => digit !== '') && index === 5) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length && i < 6; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);

      // Focus the next empty input or last input
      const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
      const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : 5;
      inputRefs.current[focusIndex]?.focus();

      // Auto-verify if all digits are filled
      if (digits.length === 6) {
        handleVerifyOTP(digits);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOTP = async (autoSend = false) => {
    if (!phoneInput || phoneInput.length < 10) {
      if (!autoSend) {
        toast.error({ title: "Por favor ingresa un número de teléfono válido" });
      }
      return;
    }

    setIsSendingOTP(true);
    try {
      await authClient.phoneNumber.sendOtp({
        phoneNumber: phoneInput,
      });

      toast.success({ title: "¡Código de verificación enviado!" });
      setPendingPhoneNumber(phoneInput);
      setResendTimer(60);
      setShowOTPInput(true);
      setIsEditing(false);
    } catch (error: unknown) {
      console.error("Failed to send OTP:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al enviar el código de verificación. Por favor intenta de nuevo.";
      toast.error({ title: errorMessage });
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

      toast.success({ title: "¡Código de verificación enviado!" });
      setPendingPhoneNumber(existingPhoneNumber);
      setResendTimer(60);
      setShowOTPInput(true);
    } catch (error: unknown) {
      console.error("Failed to send OTP:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Error al enviar el código de verificación. Por favor intenta de nuevo.";
      toast.error({ title: errorMessage });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async (code: string) => {
    if (code.length !== 6) {
      toast.error({ title: "Por favor ingresa el código de verificación de 6 dígitos" });
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const isExistingPhone = pendingPhoneNumber === phoneNumber;

      await authClient.phoneNumber.verify({
        phoneNumber: pendingPhoneNumber,
        code: code,
        disableSession: true,
        updatePhoneNumber: !isExistingPhone,
      });

      toast.success({ title: "¡Número de teléfono verificado exitosamente!" });

      setOtp(["", "", "", "", "", ""]);
      setShowOTPInput(false);
      setPendingPhoneNumber("");
      setPhoneInput("");

      router.refresh();
    } catch (error: unknown) {
      console.error("Failed to verify OTP:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Código de verificación inválido. Por favor intenta de nuevo.";
      toast.error({ title: errorMessage });
      setOtp(["", "", "", "", "", ""]);
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

      toast.success({ title: "¡Nuevo código de verificación enviado!" });
      setResendTimer(60);
    } catch (error: unknown) {
      console.error("Failed to resend OTP:", error);
      toast.error({ title: "Error al reenviar el código. Por favor intenta de nuevo." });
    } finally {
      setIsSendingOTP(false);
    }
  };

  const resetDialogs = () => {
    setShowOTPInput(false);
    setPhoneInput("");
    setOtp(["", "", "", "", "", ""]);
    setPendingPhoneNumber("");
    setResendTimer(0);
    setIsEditing(false);
    setHasAutoSent(false);
  };

  return (
    <>
      {/* Phone Number Display/Input */}
      {showOTPInput ? (
        <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-all duration-300">
          {/* Header: Phone number info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Código enviado a</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatPhoneNumber(pendingPhoneNumber)}</p>
              </div>
            </div>
            <button
              onClick={resetDialogs}
              className="text-gray-400 hover:text-gray-300 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 dark:border-[#2a2a2a] my-4"></div>

          {/* OTP Input Section */}
          <div>
            <p className="text-sm font-medium text-gray-400 mb-3">Código de verificación</p>
            {/* Hidden input for autocomplete */}
            <input
              type="text"
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              className="sr-only"
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                if (value.length > 0) {
                  const digits = value.split('');
                  const newOtp = [...otp];
                  digits.forEach((digit, index) => {
                    if (index < 6) newOtp[index] = digit;
                  });
                  setOtp(newOtp);
                  // Focus the next empty input or last input
                  const nextEmptyIndex = newOtp.findIndex(d => d === '');
                  if (nextEmptyIndex !== -1) {
                    inputRefs.current[nextEmptyIndex]?.focus();
                  } else {
                    inputRefs.current[5]?.focus();
                  }
                  // Auto-verify if all 6 digits are present
                  if (value.length === 6) {
                    handleVerifyOTP(value);
                  }
                }
              }}
            />
            <div className="flex gap-2 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  autoComplete="off"
                  className="w-12 h-12 text-center text-lg font-semibold rounded-xl border border-gray-200 bg-white dark:border-[#2a2a2a] dark:bg-[#0a0a0a] hover:border-gray-300 dark:hover:border-[#3a3a3a] focus:border-primary/50 focus:outline-none transition-colors"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onPaste={handleOtpPaste}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  disabled={isVerifyingOTP}
                />
              ))}
            </div>

            {/* Footer: Resend and status */}
            <div className="mt-4 flex items-center justify-between gap-2">
              <button
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || isSendingOTP}
                className="text-sm text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                {resendTimer > 0 ? `Reenviar en ${resendTimer}s` : "Reenviar código"}
              </button>
              {isVerifyingOTP && (
                <div className="flex items-center gap-2 text-sm text-gray-400 flex-shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="whitespace-nowrap">Verificando...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : phoneNumber && phoneNumberVerified && !isEditing ? (
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {formatPhoneNumber(phoneNumber)}
              </span>
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-green-600/10 text-green-400 border-green-600/20"
              >
                Verificado
              </Badge>
            </div>
          </div>
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-gray-600 hover:text-gray-900 hover:bg-gray-200 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-[#2a2a2a] invisible group-hover:visible transition-all rounded-lg h-8 w-8 flex items-center justify-center"
              >
                <span className="text-xl">⋯</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 rounded-2xl border dark:border-zinc-800 bg-background/95 backdrop-blur-md shadow-lg"
              sideOffset={8}
            >
              <div className="p-1">
                <DropdownMenuItem
                  onClick={() => {
                    setMenuOpen(false);
                    setIsEditing(true);
                  }}
                  className="rounded-xl cursor-pointer flex items-center px-3 py-2"
                >
                  <Edit2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setMenuOpen(false);
                    // Aquí puedes agregar la lógica para eliminar el teléfono
                    console.log("Delete phone");
                  }}
                  className="rounded-xl cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 px-3 py-2"
                >
                  <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  <span>Eliminar</span>
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : phoneNumber && !phoneNumberVerified && !isEditing ? (
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {formatPhoneNumber(phoneNumber)}
              </span>
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 bg-orange-600/10 text-orange-400 border-orange-600/20"
              >
                No verificado
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSendOTPExisting(phoneNumber)}
            disabled={isSendingOTP}
            className="text-sm font-medium text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
          >
            {isSendingOTP ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Verificar ahora"
            )}
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 flex-1">
            <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <PhoneInputWithCountry
                international
                defaultCountry="CO"
                value={phoneInput as E164Number | undefined}
                onChange={(val) => setPhoneInput(val || '')}
                disabled={isSendingOTP}
                placeholder="Agregar número de teléfono"
                inputComponent={InputComponent}
              />
            </div>
          </div>
          {phoneInput && phoneInput.length >= 10 && (
            <Button
              size="sm"
              onClick={() => handleSendOTP()}
              disabled={isSendingOTP}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
            >
              {isSendingOTP ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </Button>
          )}
        </div>
      )}

      {/* Phone Input Styles */}
      <style jsx global suppressHydrationWarning>{`
        /* Override default PhoneInput styles for profile page */
        .PhoneInput {
          display: flex;
          align-items: center;
        }

        .PhoneInputCountry {
          position: relative;
          align-self: stretch;
          display: flex;
          align-items: center;
          margin-right: 1rem;
        }

        .PhoneInputCountry:focus,
        .PhoneInputCountry:focus-visible,
        .PhoneInputCountry:focus-within {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
        }

        .PhoneInputCountryIcon {
          width: 1.25rem;
          height: 1.25rem;
          border: none;
          outline: none;
        }

        .PhoneInputCountryIcon--border {
          box-shadow: none;
          background-color: transparent;
          border: none;
        }

        .PhoneInputCountryIconImg {
          display: block;
          width: 100%;
          height: 100%;
          border: none;
          outline: none;
        }

        .PhoneInputCountrySelect {
          position: absolute;
          top: 0;
          left: 0;
          height: 100%;
          width: 100%;
          z-index: 1;
          border: 0;
          opacity: 0;
          cursor: pointer;
          outline: none;
        }

        .PhoneInputCountrySelect:focus,
        .PhoneInputCountrySelect:focus-visible,
        .PhoneInputCountrySelect:active {
          outline: none !important;
          box-shadow: none !important;
        }

        .PhoneInputCountrySelectArrow {
          display: block;
          content: '';
          width: 0.3rem;
          height: 0.3rem;
          margin-left: 0.5rem;
          border-style: solid;
          border-color: #9ca3af;
          border-top-width: 0;
          border-bottom-width: 1px;
          border-left-width: 0;
          border-right-width: 1px;
          transform: rotate(45deg);
          opacity: 0.5;
        }

        .PhoneInputInput {
          flex: 1;
          min-width: 0;
          background: transparent;
          border: none;
          outline: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: inherit;
        }

        .PhoneInputInput::placeholder {
          color: #6b7280;
          opacity: 1;
        }

        .PhoneInputInput:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </>
  );
}
