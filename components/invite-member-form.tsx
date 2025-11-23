"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InviteMemberFormProps {
  organizationId: string;
  onSuccess: () => void;
}

export function InviteMemberForm({
  organizationId,
  onSuccess,
}: InviteMemberFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    email: string;
    role: "seller" | "administrator" | "owner";
  }>({
    email: "",
    role: "seller", // Default role
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await authClient.organization.inviteMember({
        email: formData.email,
        role: formData.role,
        organizationId: organizationId,
      });

      if (error) {
        console.error("Error inviting member:", error);
        toast.error(error.message || "Error al enviar la invitación");
        return;
      }

      if (data) {
        toast.success(`Invitación enviada a ${formData.email}`);
        router.refresh();
        onSuccess();
      }
    } catch (error) {
      console.error("Error inviting member:", error);
      toast.error("Error al enviar la invitación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">
          Correo electrónico <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="usuario@ejemplo.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          disabled={isLoading}
          className="w-full"
        />
        <p className="text-xs text-muted-foreground">
          El usuario recibirá un correo con la invitación
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="role">
          Rol <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.role}
          onValueChange={(value: "seller" | "administrator" | "owner") =>
            setFormData({ ...formData, role: value })
          }
          disabled={isLoading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="seller">Vendedor</SelectItem>
            <SelectItem value="administrator">Administrador</SelectItem>
            <SelectItem value="owner">Propietario</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {formData.role === "seller" && "Acceso básico a la organización"}
          {formData.role === "administrator" &&
            "Puede invitar a otros miembros"}
          {formData.role === "owner" && "Control total sobre la organización"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-4">
        <Button
          type="submit"
          disabled={isLoading || !formData.email}
          className="w-full sm:w-auto"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando invitación...
            </>
          ) : (
            "Enviar Invitación"
          )}
        </Button>
      </div>
    </form>
  );
}
