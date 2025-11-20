"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X, Lock, Eye, EyeOff } from "lucide-react";
import { changePassword, checkHasPassword } from "@/actions/profile";
import { Checkbox } from "@/components/ui/checkbox";

export function ChangePasswordForm() {
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkHasPassword().then(setHasPassword);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    // Validate password length
    if (newPassword.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsPending(true);

    try {
      const result = await changePassword(
        currentPassword,
        newPassword,
        revokeOtherSessions
      );

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setRevokeOtherSessions(false);
      }
    } catch {
      setError("Error al cambiar la contraseña");
    } finally {
      setIsPending(false);
    }
  };

  if (hasPassword === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Cargando...</div>
      </div>
    );
  }

  if (!hasPassword) {
    return (
      <div className="space-y-4">
        <Alert className="border-blue-500/50 bg-blue-500/10 dark:bg-blue-500/20">
          <AlertDescription className="text-xs sm:text-sm">
            Has iniciado sesión únicamente con OAuth (Google, etc.). No tienes una contraseña configurada.
          </AlertDescription>
        </Alert>
        <Alert className="border-amber-500/50 bg-amber-500/10 dark:bg-amber-500/20">
          <AlertDescription className="text-xs sm:text-sm">
            <strong>Para agregar autenticación por contraseña:</strong><br />
            Usa la opción &quot;Olvidé mi contraseña&quot; en la página de inicio de sesión para configurar una contraseña de forma segura.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
          <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Cambiar Contraseña</span>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="currentPassword"
            className="text-xs sm:text-sm font-medium"
          >
            Contraseña actual <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="currentPassword"
              name="currentPassword"
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Ingresa tu contraseña actual"
              required
              className="h-9 sm:h-10 w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="newPassword"
            className="text-xs sm:text-sm font-medium"
          >
            Nueva contraseña <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="newPassword"
              name="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Ingresa tu nueva contraseña"
              required
              minLength={8}
              className="h-9 sm:h-10 w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            Mínimo 8 caracteres
          </p>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="confirmPassword"
            className="text-xs sm:text-sm font-medium"
          >
            Confirmar nueva contraseña <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirma tu nueva contraseña"
              required
              minLength={8}
              className="h-9 sm:h-10 w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="revokeOtherSessions"
            checked={revokeOtherSessions}
            onCheckedChange={(checked) =>
              setRevokeOtherSessions(checked as boolean)
            }
          />
          <label
            htmlFor="revokeOtherSessions"
            className="text-xs sm:text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Cerrar sesión en otros dispositivos
          </label>
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
            Contraseña cambiada exitosamente
            {revokeOtherSessions &&
              ". Se han cerrado todas las demás sesiones."}
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={
            isPending ||
            !currentPassword ||
            !newPassword ||
            !confirmPassword
          }
          className="w-full h-9 sm:h-10 font-medium"
        >
          {isPending ? "Cambiando..." : "Cambiar Contraseña"}
        </Button>
      </div>
    </form>
  );
}
