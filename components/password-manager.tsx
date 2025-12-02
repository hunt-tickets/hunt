"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { changePassword, checkHasPassword } from "@/actions/profile";
import { toast } from "@/lib/toast";

export function PasswordManager() {
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [isChanging, setIsChanging] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(false);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    checkHasPassword().then(setHasPassword);
  }, []);

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      toast.error({ title: "Las contraseñas no coinciden" });
      return;
    }

    if (newPassword.length < 8) {
      toast.error({ title: "La nueva contraseña debe tener al menos 8 caracteres" });
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
        toast.error({ title: result.error });
      } else {
        toast.success({
          title: revokeOtherSessions
            ? "Contraseña cambiada. Se han cerrado todas las demás sesiones"
            : "Contraseña cambiada exitosamente"
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setRevokeOtherSessions(false);
        setIsChanging(false);
      }
    } catch {
      toast.error({ title: "Error al cambiar la contraseña" });
    } finally {
      setIsPending(false);
    }
  };

  const resetForm = () => {
    setIsChanging(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setRevokeOtherSessions(false);
  };

  if (hasPassword === null) {
    return (
      <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px]">
        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-500">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!hasPassword) {
    return (
      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
        <div className="flex items-center gap-3 mb-3">
          <Lock className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium">Contraseña</span>
        </div>
        <div className="pl-8 space-y-2">
          <p className="text-xs text-gray-400">
            Has iniciado sesión únicamente con OAuth (Google, etc.). No tienes una contraseña configurada.
          </p>
          <p className="text-xs text-gray-400">
            <strong>Para agregar autenticación por contraseña:</strong> Usa la opción &quot;Olvidé mi contraseña&quot; en la página de inicio de sesión.
          </p>
        </div>
      </div>
    );
  }

  if (isChanging) {
    return (
      <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium">Contraseña</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Current Password */}
          <div className="relative p-3 rounded-lg border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
            <Input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Contraseña actual"
              className="h-6 w-full pr-8 bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-0 placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showCurrentPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* New Password */}
          <div className="relative p-3 rounded-lg border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
            <Input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="h-6 w-full pr-8 bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-0 placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showNewPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative p-3 rounded-lg border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar contraseña"
              className="h-6 w-full pr-8 bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-0 placeholder:text-gray-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-3 mt-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="revokeOtherSessions"
              checked={revokeOtherSessions}
              onCheckedChange={(checked) => setRevokeOtherSessions(checked as boolean)}
            />
            <label
              htmlFor="revokeOtherSessions"
              className="text-xs font-medium leading-none cursor-pointer"
            >
              Cerrar sesión en otros dispositivos
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={resetForm}
              variant="ghost"
              size="sm"
              className="h-9"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isPending || !currentPassword || !newPassword || !confirmPassword}
              size="sm"
              className="h-9 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
      <div className="flex items-center gap-3">
        <Lock className="h-5 w-5 text-gray-400" />
        <div>
          <p className="text-sm font-medium">Contraseña</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            ••••••••••
          </p>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button
          onClick={() => setIsChanging(true)}
          className="text-sm font-medium hover:underline"
        >
          Actualizar contraseña
        </button>
      </div>
    </div>
  );
}
