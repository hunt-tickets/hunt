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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Users } from "lucide-react";
import { addProducerToEvent } from "@/lib/supabase/actions/events";
import { useRouter } from "next/navigation";

interface Producer {
  id: string;
  name: string | null;
  logo: string | null;
}

interface AddProducerDialogProps {
  eventId: string;
  availableProducers: Producer[];
}

export function AddProducerDialog({
  eventId,
  availableProducers,
}: AddProducerDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedProducerId, setSelectedProducerId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!selectedProducerId) {
      setError("Por favor selecciona un productor");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await addProducerToEvent(eventId, selectedProducerId);

      if (result.success) {
        setOpen(false);
        setSelectedProducerId("");
        router.refresh();
      } else {
        setError(result.message || "Error al agregar el productor");
      }
    } catch {
      setError("Error inesperado al agregar el productor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="rounded-full bg-white/90 hover:bg-white border border-white/80 text-black transition-all duration-300"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] rounded-2xl bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">
            Agregar Productor al Evento
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Selecciona un productor para agregarlo al equipo del evento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {availableProducers.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-5 bg-white/5 rounded-2xl border border-white/10 mb-4">
                <Users className="h-12 w-12 text-white/40" />
              </div>
              <p className="text-sm text-muted-foreground">
                No hay productores disponibles para agregar
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label
                  htmlFor="producer"
                  className="text-sm font-medium leading-none"
                >
                  Productor
                </label>
                <Select
                  value={selectedProducerId}
                  onValueChange={setSelectedProducerId}
                >
                  <SelectTrigger
                    id="producer"
                    className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <SelectValue placeholder="Selecciona un productor" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 bg-background/95 backdrop-blur-xl max-h-[300px] overflow-y-auto">
                    {availableProducers.map((producer) => (
                      <SelectItem
                        key={producer.id}
                        value={producer.id}
                        className="rounded-lg focus:bg-white/10"
                      >
                        <div className="flex items-center gap-3 py-1">
                          {producer.logo ? (
                            <img
                              src={producer.logo}
                              alt={producer.name || "Productor"}
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-white/10">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <span className="font-medium">
                            {producer.name || "Sin nombre"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setSelectedProducerId("");
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="rounded-full px-6 border-white/10 hover:bg-white/5 transition-all duration-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedProducerId}
                  className="rounded-full px-6 bg-primary hover:bg-primary/90 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Agregando...
                    </span>
                  ) : (
                    "Agregar"
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
