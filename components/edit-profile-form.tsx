"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "@/actions/profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X, User, Phone } from "lucide-react";

interface EditProfileFormProps {
  user: {
    name: string;
    email: string;
    phoneNumber?: string | null;
  };
  onSuccess?: () => void;
}

export function EditProfileForm({ user, onSuccess }: EditProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, {});

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form
      action={formAction}
      className="space-y-4 sm:space-y-6 w-full overflow-x-hidden"
    >
      {/* Personal Information Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Información Personal</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs sm:text-sm font-medium">
            Nombre <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={user.name || ""}
            placeholder="Tu nombre"
            required
            minLength={3}
            className="h-9 sm:h-10 w-full"
          />
        </div>
      </div>

      {/* Contact Information Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
          <Phone className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Contacto</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-xs sm:text-sm font-medium">
            Teléfono
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={user.phoneNumber || ""}
            placeholder="+57 300 123 4567"
            className="h-9 sm:h-10 w-full"
          />
        </div>
      </div>

      {/* Alerts */}
      {state.error && (
        <Alert variant="destructive" className="border-destructive/50">
          <X className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {state.success && (
        <Alert className="border-green-500/50 bg-green-500/10 dark:bg-green-500/20 text-green-900 dark:text-green-100">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            Perfil actualizado exitosamente
          </AlertDescription>
        </Alert>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-9 sm:h-10 font-medium"
        >
          {isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  );
}
