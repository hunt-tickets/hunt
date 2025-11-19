"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateProfile } from "@/lib/supabase/actions/profile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Check, X, User, Phone, Calendar, FileText } from "lucide-react";

interface EditProfileFormProps {
  profile: {
    name?: string | null;
    lastName?: string | null;
    phone?: string | null;
    birthdate?: string | null;
    gender?: string | null;
    prefix?: string | null;
    document_id?: string | null;
  };
  onSuccess?: () => void;
}

export function EditProfileForm({ profile, onSuccess }: EditProfileFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfile, {});

  useEffect(() => {
    if (state.success) {
      onSuccess?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <form action={formAction} className="space-y-4 sm:space-y-6 w-full overflow-x-hidden">
      {/* Personal Information Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
          <User className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Información Personal</span>
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="prefix" className="text-xs sm:text-sm font-medium">
              Prefijo
            </Label>
            <Select name="prefix" defaultValue={profile?.prefix || "none"}>
              <SelectTrigger id="prefix" className="h-9 sm:h-10 w-full">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ninguno</SelectItem>
                <SelectItem value="Sr.">Sr.</SelectItem>
                <SelectItem value="Sra.">Sra.</SelectItem>
                <SelectItem value="Dr.">Dr.</SelectItem>
                <SelectItem value="Dra.">Dra.</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-xs sm:text-sm font-medium">
              Nombre <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={profile?.name || ""}
              placeholder="Tu nombre"
              required
              minLength={3}
              className="h-9 sm:h-10 w-full"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="lastName" className="text-xs sm:text-sm font-medium">
              Apellido <span className="text-destructive">*</span>
            </Label>
            <Input
              id="lastName"
              name="lastName"
              defaultValue={profile?.lastName || ""}
              placeholder="Tu apellido"
              required
              className="h-9 sm:h-10 w-full"
            />
          </div>
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
            defaultValue={profile?.phone || ""}
            placeholder="+57 300 123 4567"
            className="h-9 sm:h-10 w-full"
          />
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Información Adicional</span>
        </div>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="birthdate" className="text-xs sm:text-sm font-medium">
              Fecha de Nacimiento
            </Label>
            <Input
              id="birthdate"
              name="birthdate"
              type="date"
              defaultValue={
                profile?.birthdate
                  ? new Date(profile.birthdate).toISOString().split("T")[0]
                  : ""
              }
              className="h-9 sm:h-10 w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender" className="text-xs sm:text-sm font-medium">
              Género
            </Label>
            <Select name="gender" defaultValue={profile?.gender || "no_decir"}>
              <SelectTrigger id="gender" className="h-9 sm:h-10 w-full">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no_decir">Prefiero no decir</SelectItem>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="femenino">Femenino</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Document Information Section */}
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-muted-foreground">
          <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>Identificación</span>
        </div>
        <div className="space-y-2">
          <Label htmlFor="document_id" className="text-xs sm:text-sm font-medium">
            Número de Documento
          </Label>
          <Input
            id="document_id"
            name="document_id"
            defaultValue={profile?.document_id || ""}
            placeholder="Cédula o documento de identidad"
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
