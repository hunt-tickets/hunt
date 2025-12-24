"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  createEvent,
  type EventFormState,
} from "@/lib/supabase/actions/events";
import { CreateEventSubmitButton } from "@/components/create-event-submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle, Plus, Info } from "lucide-react";
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
  const createEventWithOrg = createEvent.bind(null, organizationId);
  const [state, formAction] = useActionState(createEventWithOrg, initialState);

  // Close dialog on success
  useEffect(() => {
    if (state.success) {
      setOpen(false);
    }
  }, [state.success]);

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
                  autoFocus
                />
                {state.errors?.name && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {state.errors.name[0]}
                  </p>
                )}
              </div>

              {/* Next steps info */}
              <div className="flex gap-3 p-3 rounded-lg bg-[#111] border border-[#2a2a2a]">
                <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  Después de crear el evento podrás configurar fechas, flyer,
                  boletos y más detalles.
                </p>
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
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
