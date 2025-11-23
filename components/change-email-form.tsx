"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X, Mail } from "lucide-react";
import { changeEmail } from "@/actions/profile";

interface ChangeEmailFormProps {
  currentEmail: string;
  onSuccess?: () => void;
}

export function ChangeEmailForm({
  currentEmail,
  onSuccess,
}: ChangeEmailFormProps) {
  const [newEmail, setNewEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setIsPending(true);

    try {
      const result = await changeEmail(newEmail);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setNewEmail("");
        onSuccess?.();
      }
    } catch {
      setError("Error al cambiar el correo electrónico");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
          <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Cambiar Correo Electrónico</span>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="currentEmail"
            className="text-xs sm:text-sm font-medium"
          >
            Correo actual
          </Label>
          <Input
            id="currentEmail"
            value={currentEmail}
            disabled
            className="h-9 sm:h-10 w-full bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newEmail" className="text-xs sm:text-sm font-medium">
            Nuevo correo electrónico <span className="text-destructive">*</span>
          </Label>
          <Input
            id="newEmail"
            name="newEmail"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="nuevo@correo.com"
            required
            className="h-9 sm:h-10 w-full"
          />
          <p className="text-xs text-muted-foreground">
            Se enviará un correo de verificación a tu dirección actual para
            aprobar el cambio.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive" className="border-destructive/50">
          <X className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-500/50 bg-green-500/10 dark:bg-green-500/20 text-green-900 dark:text-green-100">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            Correo de verificación enviado. Por favor revisa tu bandeja de
            entrada.
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending || !newEmail}
          className="w-full h-9 sm:h-10 font-medium"
        >
          {isPending ? "Enviando..." : "Cambiar Correo"}
        </Button>
      </div>
    </form>
  );
}
