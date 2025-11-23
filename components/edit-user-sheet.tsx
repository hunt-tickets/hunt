"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { updateUserAsAdmin } from "@/lib/supabase/actions/profile";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  birthdate: string | null;
  gender: string | null;
  prefix: string | null;
  document_id: string | null;
  admin: boolean;
}

interface EditUserSheetProps {
  user: User;
}

export function EditUserSheet({ user }: EditUserSheetProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: user.name || "",
    lastName: user.lastName || "",
    email: user.email || "",
    phone: user.phone || "",
    birthdate: user.birthdate || "",
    gender: user.gender || "",
    prefix: user.prefix || "none",
    document_id: user.document_id || "",
    admin: user.admin,
  });

  // Reset form when user changes or sheet opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: user.name || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        birthdate: user.birthdate || "",
        gender: user.gender || "",
        prefix: user.prefix || "none",
        document_id: user.document_id || "",
        admin: user.admin,
      });
      setError(null);
    }
  }, [open, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      setError("El email es requerido");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateUserAsAdmin(user.id, {
        name: formData.name || undefined,
        lastName: formData.lastName || undefined,
        email: formData.email,
        phone: formData.phone || undefined,
        birthdate: formData.birthdate || undefined,
        gender: formData.gender === "no_decir" ? undefined : formData.gender || undefined,
        prefix: formData.prefix === "none" ? undefined : formData.prefix || undefined,
        document_id: formData.document_id || undefined,
        admin: formData.admin,
      });

      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error || "Error al actualizar el usuario");
      }
    } catch {
      setError("Error inesperado al actualizar el usuario");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-white/10"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background/95 backdrop-blur-xl border-white/10 p-6">
        <SheetHeader className="space-y-3 pb-6">
          <SheetTitle className="text-2xl font-bold">Editar Usuario</SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
            Modifica la información del usuario.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pr-2">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Información Personal</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Juan"
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Apellido
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Pérez"
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@ejemplo.com"
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="prefix" className="text-sm font-medium">
                  Código País
                </Label>
                <Select
                  value={formData.prefix}
                  onValueChange={(value) => setFormData({ ...formData, prefix: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                    <SelectValue placeholder="Código" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Ninguno</SelectItem>
                    <SelectItem value="+57">+57 (Colombia)</SelectItem>
                    <SelectItem value="+1">+1 (USA/Canadá)</SelectItem>
                    <SelectItem value="+52">+52 (México)</SelectItem>
                    <SelectItem value="+593">+593 (Ecuador)</SelectItem>
                    <SelectItem value="+51">+51 (Perú)</SelectItem>
                    <SelectItem value="+54">+54 (Argentina)</SelectItem>
                    <SelectItem value="+56">+56 (Chile)</SelectItem>
                    <SelectItem value="+58">+58 (Venezuela)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="3001234567"
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthdate" className="text-sm font-medium">
                  Fecha de Nacimiento
                </Label>
                <Input
                  id="birthdate"
                  type="date"
                  value={formData.birthdate}
                  onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender" className="text-sm font-medium">
                  Género
                </Label>
                <Select
                  value={formData.gender || "no_decir"}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                    <SelectItem value="no_decir">Prefiero no decir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Documento */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Documento de Identidad</h3>

            <div className="space-y-2">
              <Label htmlFor="document_id" className="text-sm font-medium">
                Número de Documento
              </Label>
              <Input
                id="document_id"
                value={formData.document_id}
                onChange={(e) => setFormData({ ...formData, document_id: e.target.value })}
                placeholder="1234567890"
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              />
            </div>
          </div>

          {/* Permisos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Permisos</h3>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="space-y-0.5">
                <Label htmlFor="admin" className="text-sm font-medium">
                  Administrador
                </Label>
                <p className="text-sm text-white/60">
                  Otorgar permisos de administrador
                </p>
              </div>
              <Switch
                id="admin"
                checked={formData.admin}
                onCheckedChange={(checked) => setFormData({ ...formData, admin: checked })}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500 font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setError(null);
              }}
              disabled={isLoading}
              className="rounded-full px-6 border-white/10 hover:bg-white/5 transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full px-6 bg-primary hover:bg-primary/90 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Actualizando...
                </span>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
