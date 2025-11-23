"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2, Shield, Users, X } from "lucide-react";
import { addTeamMemberToProducer } from "@/lib/supabase/actions/producers";
import { useRouter } from "next/navigation";

interface AddTeamMemberDialogProps {
  producerId: string;
}

export function AddTeamMemberDialog({ producerId }: AddTeamMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const roles = [
    {
      value: "Administrador",
      label: "Administrador",
      description: "Acceso completo para gestionar el equipo, eventos y configuraciones del productor",
      icon: Shield,
      color: "from-amber-500/10 to-orange-500/10 border-amber-500/20"
    },
    {
      value: "Analista",
      label: "Analista",
      description: "Puede ver reportes, estadísticas y análisis de eventos sin poder editar",
      icon: Users,
      color: "from-blue-500/10 to-cyan-500/10 border-blue-500/20"
    },
    {
      value: "Vendedor",
      label: "Vendedor",
      description: "Puede vender tickets y gestionar transacciones de los eventos asignados",
      icon: Users,
      color: "from-green-500/10 to-emerald-500/10 border-green-500/20"
    },
  ];

  const handleSubmit = async () => {
    if (!email) {
      setError("Por favor ingresa un correo electrónico");
      return;
    }

    if (!rol) {
      setError("Por favor selecciona un rol");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await addTeamMemberToProducer(producerId, email, rol);

      if (result.success) {
        setOpen(false);
        setEmail("");
        setRol("");
        router.refresh();
      } else {
        setError(result.message || "Error al agregar el miembro");
      }
    } catch {
      setError("Error inesperado al agregar el miembro");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all bg-white/90 hover:bg-white text-black border border-white/80"
        >
          <UserPlus className="h-4 w-4" />
          Agregar Miembro
        </button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="sm:max-w-[540px] rounded-2xl bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl">
        <button
          onClick={() => {
            setOpen(false);
            setEmail("");
            setRol("");
            setError(null);
          }}
          className="absolute right-4 top-4 rounded-lg p-2 hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5 text-white/60 hover:text-white" />
        </button>

        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">Agregar Miembro al Equipo</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Ingresa el correo electrónico del usuario y selecciona su rol en el equipo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {/* Email Input */}
          <div className="space-y-3">
            <Label htmlFor="email" className="text-sm font-medium">
              Correo Electrónico
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl bg-white/5 border-white/10 focus:border-primary/50 transition-all"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Selecciona un Rol
            </Label>
            <div className="space-y-3">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = rol === role.value;

                return (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setRol(role.value)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? `bg-gradient-to-r ${role.color} border-2`
                        : "bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${isSelected ? 'bg-white/10' : 'bg-white/5'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-white mb-1">{role.label}</h4>
                        <p className="text-sm text-white/60 leading-relaxed">{role.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setOpen(false);
              setEmail("");
              setRol("");
              setError(null);
            }}
            className="flex-1 rounded-xl h-11 border-white/10 hover:bg-white/5"
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex-1 rounded-xl h-11 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agregando...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Agregar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
