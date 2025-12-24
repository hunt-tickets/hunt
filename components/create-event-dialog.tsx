"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  createEvent,
  type EventFormState,
} from "@/lib/supabase/actions/events";
import {
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
} from "@/constants/event-categories";
import { CreateEventSubmitButton } from "@/components/create-event-submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle2,
  AlertCircle,
  Plus,
  Calendar,
  Clock,
  ImageIcon,
} from "lucide-react";
import { HoverButton } from "@/components/ui/hover-glow-button";

interface CreateEventDialogProps {
  className?: string;
  organizationId: string;
}

const initialState: EventFormState = {
  message: undefined,
  errors: {},
  success: false,
};

export function CreateEventDialog({
  className,
  organizationId,
}: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createEvent, initialState);

  // Form field states
  const [category, setCategory] = useState("");
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);

  // Close dialog on success
  useEffect(() => {
    if (state.success) {
      setCategory("");
      setFlyerPreview(null);
      setOpen(false);
    }
  }, [state.success]);

  const handleFlyerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFlyerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setFlyerPreview(null);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <HoverButton
        onClick={() => setOpen(true)}
        className={`flex flex-row items-center justify-center gap-2 px-6 py-3 rounded-full whitespace-nowrap text-sm font-medium bg-primary text-primary-foreground ${className}`}
        glowColor="#000000"
        backgroundColor="transparent"
        textColor="inherit"
        hoverTextColor="inherit"
      >
        <Plus className="h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0" />
        <span className="hidden sm:inline">Crear Evento</span>
      </HoverButton>

      <SheetContent
        side="right"
        className="w-full sm:max-w-md p-0 bg-[#0a0a0a] border-l border-[#1a1a1a] overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-[#1a1a1a]">
            <SheetTitle className="text-xl font-semibold">
              Nuevo Evento
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              Crea tu evento en segundos. Podrás configurar más detalles
              después.
            </p>
          </SheetHeader>

          {/* Form Content */}
          <div className="flex-1 px-6 py-6">
            <form
              action={formAction}
              className="space-y-6"
              id="create-event-form"
            >
              {/* Hidden organization ID */}
              <input
                type="hidden"
                name="organization_id"
                value={organizationId}
              />

              {/* Messages */}
              {state.message && !state.success && (
                <Alert
                  variant="destructive"
                  className="border-destructive/50 bg-destructive/10"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}

              {state.message && state.success && (
                <Alert className="border-green-500/50 bg-green-500/10">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <AlertDescription className="text-green-500">
                    {state.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Flyer Upload - Visual first */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">
                  Flyer del evento
                </Label>
                <label
                  htmlFor="flyer"
                  className="relative flex flex-col items-center justify-center w-full aspect-[3/4] rounded-xl border-2 border-dashed border-[#2a2a2a] hover:border-[#3a3a3a] bg-[#111] cursor-pointer transition-colors overflow-hidden group"
                >
                  {flyerPreview ? (
                    <>
                      <img
                        src={flyerPreview}
                        alt="Preview"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-sm text-white">Cambiar imagen</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <div className="h-12 w-12 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium text-foreground">
                          Arrastra tu flyer aquí
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          o haz clic para seleccionar
                        </p>
                      </div>
                    </div>
                  )}
                  <input
                    id="flyer"
                    name="flyer"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFlyerChange}
                    className="sr-only"
                  />
                </label>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre del evento
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej: Fiesta de Año Nuevo 2025"
                  className="h-11 bg-[#111] border-[#2a2a2a] focus-visible:ring-primary/50"
                />
                {state.errors?.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {state.errors.name[0]}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-11 bg-[#111] border-[#2a2a2a]">
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {EVENT_CATEGORY_LABELS[cat]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="category" value={category} />
              </div>

              {/* Date & Time - Compact */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">¿Cuándo es?</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      name="start_date"
                      type="date"
                      className="h-11 pl-10 bg-[#111] border-[#2a2a2a]"
                    />
                  </div>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                    <Input
                      name="start_time"
                      type="time"
                      className="h-11 pl-10 bg-[#111] border-[#2a2a2a]"
                    />
                  </div>
                </div>
                {(state.errors?.start_date || state.errors?.start_time) && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {state.errors?.start_date?.[0] ||
                      state.errors?.start_time?.[0]}
                  </p>
                )}
              </div>

              {/* Description - Optional, collapsible feel */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Descripción{" "}
                  <span className="text-xs text-muted-foreground/60">
                    (opcional)
                  </span>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Cuéntale a la gente de qué trata tu evento..."
                  className="min-h-[80px] resize-none bg-[#111] border-[#2a2a2a] focus-visible:ring-primary/50"
                />
              </div>

              {/* City - Simple */}
              <div className="space-y-2">
                <Label
                  htmlFor="city"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Ciudad{" "}
                  <span className="text-xs text-muted-foreground/60">
                    (opcional)
                  </span>
                </Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="Ej: Bogotá"
                  className="h-11 bg-[#111] border-[#2a2a2a] focus-visible:ring-primary/50"
                />
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#1a1a1a] bg-[#0a0a0a]">
            <div className="flex gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpen(false)}
                className="flex-1 h-11"
              >
                Cancelar
              </Button>
              <CreateEventSubmitButton
                form="create-event-form"
                className="flex-1 h-11"
              />
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Podrás agregar más detalles, días del evento y boletos después de
              crear el evento.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
