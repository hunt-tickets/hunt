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
import { addArtistToEvent } from "@/lib/supabase/actions/events";
import { useRouter } from "next/navigation";

interface Artist {
  id: string;
  name: string | null;
  description: string | null;
  category: string | null;
  logo: string | null;
}

interface AddArtistDialogProps {
  eventId: string;
  availableArtists: Artist[];
  className?: string;
}

export function AddArtistDialog({
  eventId,
  availableArtists,
  className,
}: AddArtistDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedArtistId, setSelectedArtistId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!selectedArtistId) {
      setError("Por favor selecciona un artista");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await addArtistToEvent(eventId, selectedArtistId);

      if (result.success) {
        setOpen(false);
        setSelectedArtistId("");
        router.refresh();
      } else {
        setError(result.message || "Error al agregar el artista");
      }
    } catch {
      setError("Error inesperado al agregar el artista");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={`rounded-lg bg-white/90 hover:bg-white border border-white/80 text-black transition-all duration-300 ${
            className || ""
          }`}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Agregar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] rounded-2xl bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-bold">
            Agregar Artista al Evento
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Selecciona un artista para agregarlo al lineup del evento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-6">
          {availableArtists.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex p-5 bg-white/5 rounded-2xl border border-white/10 mb-4">
                <Users className="h-12 w-12 text-white/40" />
              </div>
              <p className="text-sm text-muted-foreground">
                No hay artistas disponibles para agregar
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <label
                  htmlFor="artist"
                  className="text-sm font-medium leading-none"
                >
                  Artista
                </label>
                <Select
                  value={selectedArtistId}
                  onValueChange={setSelectedArtistId}
                >
                  <SelectTrigger
                    id="artist"
                    className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <SelectValue placeholder="Selecciona un artista" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-white/10 bg-background/95 backdrop-blur-xl max-h-[300px] overflow-y-auto">
                    {availableArtists.map((artist) => (
                      <SelectItem
                        key={artist.id}
                        value={artist.id}
                        className="rounded-lg focus:bg-white/10"
                      >
                        <div className="flex items-center gap-3 py-1">
                          {artist.logo ? (
                            <img
                              src={artist.logo}
                              alt={artist.name || "Artista"}
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-white/10">
                              <Users className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {artist.name || "Sin nombre"}
                            </span>
                            {artist.category && (
                              <span className="text-xs text-white/40">
                                {artist.category}
                              </span>
                            )}
                          </div>
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
                    setSelectedArtistId("");
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="rounded-full px-6 border-white/10 hover:bg-white/5 transition-all duration-300"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedArtistId}
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
