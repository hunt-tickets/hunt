"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SimpleDateTimePicker } from "@/components/ui/simple-datetime-picker";
import { Calendar, Clock, FileImage } from "lucide-react";
import type { EventDayOutput } from "@/actions/event-days";

type EventDay = EventDayOutput;

interface DayDetailSheetProps {
  day: EventDay | null;
  dayNumber: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (day: EventDay) => void;
}

export function DayDetailSheet({
  day,
  dayNumber,
  open,
  onOpenChange,
  onSave,
}: DayDetailSheetProps) {
  const [formData, setFormData] = useState<EventDay | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reset form when day changes or sheet opens
  useEffect(() => {
    if (open && day) {
      setFormData({ ...day });
      setError(null);
    }
  }, [open, day]);

  if (!formData || !day) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name) {
      setError("El nombre del día es requerido");
      return;
    }

    if (!formData.date) {
      setError("La fecha de inicio es requerida");
      return;
    }

    setError(null);
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background/95 backdrop-blur-xl border-white/10 p-6">
        <SheetHeader className="space-y-3 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-sm">
              {dayNumber}
            </div>
            <div>
              <SheetTitle className="text-2xl font-bold">
                Configurar Día
              </SheetTitle>
              <SheetDescription className="text-base text-muted-foreground">
                Configura todos los detalles para este día del evento.
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pr-2">
          {/* Nombre del Día */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
              Información Básica
            </h3>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre del Día <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Viernes, Día 1, Pre-Party..."
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                required
              />
            </div>
          </div>

          {/* Fechas y Horarios */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Fechas del Día
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SimpleDateTimePicker
                name="day-date"
                label="Fecha de Inicio"
                value={formData.date}
                onChange={(value) => setFormData({ ...formData, date: value })}
                placeholder="Fecha y hora de inicio"
                required
              />
              <SimpleDateTimePicker
                name="day-end"
                label="Fecha de Fin"
                value={formData.endDate || ""}
                onChange={(value) =>
                  setFormData({ ...formData, endDate: value })
                }
                placeholder="Fecha y hora de fin"
                minDate={formData.date ? new Date(formData.date) : undefined}
              />
            </div>
          </div>

          {/* Horarios Específicos */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Horarios Específicos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SimpleDateTimePicker
                name="doors-open"
                label="Apertura de Puertas"
                value={formData.doorsOpen || ""}
                onChange={(value) =>
                  setFormData({ ...formData, doorsOpen: value })
                }
                placeholder="Hora de apertura"
                minDate={formData.date ? new Date(formData.date) : undefined}
              />
              <SimpleDateTimePicker
                name="show-start"
                label="Inicio del Show"
                value={formData.showStart || ""}
                onChange={(value) =>
                  setFormData({ ...formData, showStart: value })
                }
                placeholder="Hora de inicio"
                minDate={
                  formData.doorsOpen
                    ? new Date(formData.doorsOpen)
                    : formData.date
                      ? new Date(formData.date)
                      : undefined
                }
              />
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Estos horarios son opcionales y ayudan a informar a los asistentes
              sobre cuándo llegar.
            </p>
          </div>

          {/* Descripción */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
              Contenido del Día
            </h3>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe qué sucederá este día (lineup, actividades, etc.)"
                className="min-h-[100px] rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors resize-none"
              />
            </div>
          </div>

          {/* Flyer */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider flex items-center gap-2">
              <FileImage className="w-4 h-4" />
              Imagen del Día
            </h3>

            <div className="space-y-2">
              <Label htmlFor="flyer" className="text-sm font-medium">
                URL de la Imagen
              </Label>
              <Input
                id="flyer"
                type="url"
                value={formData.flyer || ""}
                onChange={(e) =>
                  setFormData({ ...formData, flyer: e.target.value })
                }
                placeholder="https://ejemplo.com/imagen.jpg"
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              />
              {formData.flyer && (
                <div className="mt-3 rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={formData.flyer}
                    alt="Vista previa"
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "";
                      e.currentTarget.alt = "Error al cargar imagen";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500 font-medium">{error}</p>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setError(null);
              }}
              className="rounded-full px-6 border-white/10 hover:bg-white/5 transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-full px-6 bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
