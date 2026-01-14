"use client";

import { useState, useEffect, useActionState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createEvent, type EventFormState } from "@/actions/events";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Info, Loader2 } from "lucide-react";
import { HoverButton } from "@/components/ui/hover-glow-button";
import {
  EventTypeSelector,
  type EventType,
} from "@/components/event-config/event-type-selector";

interface CreateEventDialogProps {
  className?: string;
  organizationId: string;
}

const initialState: EventFormState = {};

export function CreateEventDialog({
  className,
  organizationId,
}: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [eventType, setEventType] = useState<EventType>("single");

  // Bind organizationId to the action, useActionState returns [state, action, pending]
  const createEventWithOrg = createEvent.bind(null, organizationId);
  const [state, formAction, pending] = useActionState(
    createEventWithOrg,
    initialState
  );

  // Reset eventType when dialog closes
  useEffect(() => {
    if (!open) {
      setEventType("single");
    }
  }, [open]);

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
        className="w-full sm:max-w-md p-0 bg-white dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-[#2a2a2a] overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-gray-200 dark:border-[#2a2a2a]">
            <SheetTitle className="text-xl font-semibold">
              Nuevo Evento
            </SheetTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Crea tu evento en segundos. Podrás configurar más detalles
              después.
            </p>
          </SheetHeader>

          <form action={formAction} className="flex-1 flex flex-col">
            {/* Form Content */}
            <div className="flex-1 px-6 py-6 space-y-6">
              {/* Error message */}
              {state.message && (
                <Alert
                  variant="destructive"
                  className="border-destructive/50 bg-destructive/10"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{state.message}</AlertDescription>
                </Alert>
              )}

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre del evento <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Ej: Fiesta de Año Nuevo 2025"
                  className="h-11 bg-gray-50 dark:bg-[#111] border-gray-200 dark:border-[#2a2a2a] focus-visible:ring-primary/50 rounded-xl"
                  autoFocus
                  disabled={pending}
                  required
                  minLength={1}
                />
                {state.errors?.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {state.errors.name[0]}
                  </p>
                )}
              </div>

              {/* Event Type */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Tipo de evento</Label>
                <input type="hidden" name="type" value={eventType} />
                <EventTypeSelector
                  value={eventType}
                  onChange={setEventType}
                  disabled={pending}
                />
                <p className="text-xs text-amber-500/90 flex items-center gap-1.5">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  El tipo de evento no se puede cambiar después de crearlo.
                </p>
                {state.errors?.type && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {state.errors.type[0]}
                  </p>
                )}
              </div>

              {/* Next steps info */}
              <div className="flex gap-3 p-3 rounded-xl bg-gray-50 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a]">
                <Info className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Después de crear el evento podrás configurar fechas, flyer,
                  boletos y más detalles.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0a0a0a]">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="flex-1 h-11 rounded-xl hover:bg-gray-200 dark:hover:bg-accent/50"
                  disabled={pending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 rounded-xl"
                  disabled={pending}
                >
                  {pending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear evento"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
