"use client";

import { useState } from "react";
import { MoreVertical, Trash2, Archive, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/lib/toast";
import { useRouter } from "next/navigation";

interface EventOptionsMenuProps {
  eventId: string;
}

export function EventOptionsMenu({ eventId }: EventOptionsMenuProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleArchive = () => {
    // TODO: Archive event
    console.log("Archive event", eventId);
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelEvent = async () => {
    if (!cancellationReason.trim()) {
      toast.error({
        title: "Debes proporcionar una razón para la cancelación",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/events/${eventId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cancellationReason: cancellationReason.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        toast.error({
          title: result.error || "Error al cancelar evento",
        });
        setIsSubmitting(false);
        return;
      }

      // Success
      toast.success({
        title: result.message,
      });

      // Show additional info if there are paid orders
      if (result.paidOrdersCount && result.paidOrdersCount > 0) {
        toast.warning({
          title: `${result.paidOrdersCount} órdenes pagadas requieren procesamiento de reembolso`,
        });
      }

      setShowCancelDialog(false);
      setCancellationReason("");

      // Refresh page
      router.refresh();

    } catch (error) {
      console.error("Error cancelling event:", error);
      toast.error({
        title: "Error de conexión al cancelar el evento",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 bg-zinc-100 border border-zinc-300 hover:bg-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Opciones del evento"
          >
            <MoreVertical className="h-5 w-5 text-zinc-900 dark:text-white" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="mr-2 h-4 w-4" />
            <span>Pausar/archivar</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleCancelClick}
            className="text-red-600 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Cancelar evento</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Cancelar Evento
            </DialogTitle>
            <DialogDescription>
              ⚠️ <strong>Esta acción iniciará el proceso de cancelación.</strong>
              <br />
              <br />
              Al cancelar este evento:
              <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                <li>El evento será ocultado del público inmediatamente</li>
                <li>Todos los tickets serán cancelados</li>
                <li>Deberás procesar los reembolsos manualmente</li>
                <li>No se puede cancelar dentro de las 24 horas previas si hay tickets vendidos</li>
              </ul>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">
                Razón de cancelación <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                placeholder="Ej: Problemas con el venue, caso de fuerza mayor, etc."
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Esta razón será registrada en el historial del evento.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCancelDialog(false);
                setCancellationReason("");
              }}
              disabled={isSubmitting}
            >
              Volver
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelEvent}
              disabled={isSubmitting || !cancellationReason.trim()}
            >
              {isSubmitting ? "Cancelando..." : "Confirmar Cancelación"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
