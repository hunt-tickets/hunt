"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { sendCourtesy } from "@/lib/supabase/actions/courtesy";

interface SendCourtesyDialogProps {
  eventId: string;
}

export function SendCourtesyDialog({ eventId }: SendCourtesyDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await sendCourtesy({
        eventId,
        targetEmail: formData.email,
        targetName: formData.name,
      });

      if (!result.success) {
        throw new Error(result.error || "Error al enviar la cortesía");
      }

      toast.success("Cortesía enviada exitosamente", {
        description: `Se ha enviado una entrada de cortesía a ${formData.email}`,
      });

      // Reset form and close dialog
      setFormData({ name: "", email: "" });
      setOpen(false);
    } catch (error: unknown) {
      console.error("Error sending courtesy:", error);
      const message = error instanceof Error ? error.message : "Ocurrió un error inesperado";
      toast.error("Error al enviar cortesía", {
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-white/5 hover:bg-white/10 border-white/10"
        >
          <Gift className="h-4 w-4" />
          Enviar Cortesía
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gift className="h-5 w-5" />
              Enviar Cortesía
            </DialogTitle>
            <DialogDescription>
              Envía una entrada de cortesía gratuita a un invitado. Recibirá un correo con su código QR.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nombre del invitado
              </Label>
              <Input
                id="name"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="invitado@ejemplo.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Gift className="mr-2 h-4 w-4" />
                  Enviar Cortesía
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
