"use client";

import { useState, useCallback, useRef } from "react";
import { Phone, Loader2, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/profile";
import type { PhoneVerificationManagerProps } from "@/lib/profile/types";

export function PhoneVerificationManager({
  phoneNumber,
  phoneNumberVerified,
}: PhoneVerificationManagerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showUnlinkDialog, setShowUnlinkDialog] = useState(false);
  const [pendingPhoneNumber, setPendingPhoneNumber] = useState("");

  const router = useRouter();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return phone;
    if (phone.startsWith("+")) return phone;
    if (phone.length >= 10) {
      return phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");
    }
    return phone;
  };

  // Send OTP using Better Auth phoneNumber plugin
  const handleSendOTP = useCallback(async () => {
    if (!phoneInput || phoneInput.length < 10) {
      toast.error({ title: ERROR_MESSAGES.PHONE_INVALID });
      return;
    }

    setIsSendingOTP(true);
    try {
      // Better Auth phoneNumber.sendOtp()
      await authClient.phoneNumber.sendOtp({
        phoneNumber: phoneInput,
      });

      toast.success({ title: SUCCESS_MESSAGES.OTP_SENT });
      setPendingPhoneNumber(phoneInput);
      setShowOTPInput(true);
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : ERROR_MESSAGES.OTP_SEND_FAILED;
      toast.error({ title: errorMessage });
      if (process.env.NODE_ENV === "development") {
        console.error("Failed to send OTP:", error);
      }
    } finally {
      setIsSendingOTP(false);
    }
  }, [phoneInput]);

  // Verify OTP using Better Auth phoneNumber plugin
  const handleVerifyOTP = useCallback(
    async (code: string) => {
      if (code.length !== 6) {
        toast.error({ title: ERROR_MESSAGES.OTP_INVALID_LENGTH });
        return;
      }

      setIsVerifyingOTP(true);
      try {
        // Check if we're updating to a new phone number or just verifying existing
        const isNewOrChangedPhone = pendingPhoneNumber !== phoneNumber;

        // Better Auth phoneNumber.verify()
        await authClient.phoneNumber.verify({
          phoneNumber: pendingPhoneNumber,
          code: code,
          disableSession: true, // Don't create new session
          updatePhoneNumber: isNewOrChangedPhone, // true = add/update, false = just verify existing
        });

        toast.success({ title: SUCCESS_MESSAGES.PHONE_VERIFIED });
        setOtp(["", "", "", "", "", ""]);
        setShowOTPInput(false);
        setPhoneInput("");
        setPendingPhoneNumber("");
        router.refresh();
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : ERROR_MESSAGES.OTP_VERIFY_FAILED;
        toast.error({ title: errorMessage });
        setOtp(["", "", "", "", "", ""]);
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to verify OTP:", error);
        }
      } finally {
        setIsVerifyingOTP(false);
      }
    },
    [pendingPhoneNumber, phoneNumber, router]
  );

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all 6 digits are entered
    if (newOtp.every((digit) => digit !== "") && index === 5) {
      handleVerifyOTP(newOtp.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Unlink phone number using updateUser
  const handleUnlinkPhone = useCallback(async () => {
    setShowUnlinkDialog(false);
    setMenuOpen(false);

    try {
      console.log("🔓 Unlinking phone number...");

      // Remove phone number and reset verification status
      const result = await authClient.updateUser({
        phoneNumber: null,
        phoneNumberVerified: false,
      });

      console.log("✅ Phone unlinked successfully:", result);
      toast.success({ title: SUCCESS_MESSAGES.PHONE_DELETED });
      router.refresh();
    } catch (error) {
      console.error("❌ Failed to unlink phone number:", error);
      toast.error({ title: ERROR_MESSAGES.PHONE_DELETE_FAILED });
    }
  }, [router]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setShowOTPInput(false);
    setPhoneInput("");
    setOtp(["", "", "", "", "", ""]);
    setPendingPhoneNumber("");
  }, []);

  // OTP Input View
  if (showOTPInput) {
    return (
      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium">Código enviado a</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatPhoneNumber(pendingPhoneNumber)}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-300 text-sm font-medium transition-colors"
          >
            Cancelar
          </button>
        </div>

        <div className="border-t border-gray-200 dark:border-[#2a2a2a] my-4"></div>

        <div>
          <p className="text-sm font-medium text-gray-400 mb-3">
            Código de verificación
          </p>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                autoComplete="off"
                className="w-12 h-12 text-center text-lg font-semibold rounded-xl border border-gray-200 bg-white dark:border-[#2a2a2a] dark:bg-[#0a0a0a] hover:border-gray-300 dark:hover:border-[#3a3a3a] focus:border-primary/50 focus:outline-none transition-colors"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                disabled={isVerifyingOTP}
              />
            ))}
          </div>

          {isVerifyingOTP && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verificando...</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Verified Phone Number View
  if (phoneNumber && phoneNumberVerified && !isEditing) {
    return (
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
              onClick={(e) => e.stopPropagation()}
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
                  setPhoneInput(phoneNumber);
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
                  setShowUnlinkDialog(true);
                }}
                className="rounded-xl cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 px-3 py-2"
              >
                <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                <span>Desvincular</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Unlink Confirmation Dialog */}
        <AlertDialog open={showUnlinkDialog} onOpenChange={setShowUnlinkDialog}>
          <AlertDialogContent className="rounded-2xl border dark:border-[#2a2a2a]">
            <AlertDialogHeader>
              <AlertDialogTitle>¿Desvincular número de teléfono?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción eliminará tu número de teléfono verificado. Podrás
                agregar uno nuevo en cualquier momento.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleUnlinkPhone}
                className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Desvincular
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  }

  // Unverified Phone Number View
  if (phoneNumber && !phoneNumberVerified && !isEditing) {
    return (
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
          onClick={() => {
            setPhoneInput(phoneNumber);
            setPendingPhoneNumber(phoneNumber);
            handleSendOTP();
          }}
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
    );
  }

  // Edit/Add Phone Number View
  return (
    <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
      <div className="flex items-center gap-3 mb-3">
        <Phone className="h-5 w-5 text-gray-400" aria-hidden="true" />
        <span className="text-sm font-medium">
          {isEditing ? "Editar número de teléfono" : "Número de teléfono"}
        </span>
      </div>

      <input
        type="tel"
        value={phoneInput}
        onChange={(e) => setPhoneInput(e.target.value)}
        placeholder="+57 300 123 4567"
        className="w-full h-10 px-3 rounded-lg border border-gray-200 bg-white dark:border-[#2a2a2a] dark:bg-[#0a0a0a] text-sm font-medium focus:border-primary/50 focus:outline-none transition-colors"
        disabled={isSendingOTP}
      />

      <div className="flex justify-end gap-2 mt-3">
        {isEditing && (
          <Button
            type="button"
            onClick={handleCancel}
            variant="ghost"
            size="sm"
            className="h-9 rounded-xl"
            disabled={isSendingOTP}
          >
            Cancelar
          </Button>
        )}
        <Button
          onClick={handleSendOTP}
          disabled={isSendingOTP || !phoneInput || phoneInput.length < 10}
          size="sm"
          className="h-9 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSendingOTP ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            "Verificar"
          )}
        </Button>
      </div>
    </div>
  );
}
