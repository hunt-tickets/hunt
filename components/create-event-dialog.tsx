"use client";

import { useState, useEffect } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/ui/form-input";
import {
  createEvent,
  type EventFormState,
} from "@/lib/supabase/actions/events";
import { CreateEventSubmitButton } from "@/components/create-event-submit-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Plus, Info } from "lucide-react";
import { HoverButton } from "@/components/ui/hover-glow-button";

interface CreateEventDialogProps {
  className?: string;
  organizationId: string;
  userId: string;
}

const initialState: EventFormState = {
  message: undefined,
  errors: {},
  success: false,
};

export function CreateEventDialog({
  className,
  organizationId,
  userId,
}: CreateEventDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const createEventWithOrg = createEvent.bind(null, organizationId);
  const [state, formAction] = useActionState(createEventWithOrg, initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to configuration page on success
  useEffect(() => {
    if (state.success && state.eventId) {
      setOpen(false);
      router.push(
        `/profile/${userId}/organizaciones/${organizationId}/administrador/event/${state.eventId}/configuracion`
      );
    }
  }, [state.success, state.eventId, router, userId, organizationId]);

  useEffect(() => {
    if (!open) {
      setIsSubmitting(false);
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

      {/* Mobile: Bottom Sheet */}
      <SheetContent
        side="bottom"
        className="sm:hidden w-full p-0 bg-white dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/10 overflow-y-auto max-h-[90vh] rounded-t-2xl"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-gray-200 dark:border-white/10">
            <SheetTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Nuevo Evento
            </SheetTitle>
            <p className="text-sm text-gray-600 dark:text-white/60">
              Crea tu evento en segundos. Podrás configurar más detalles
              después.
            </p>
          </SheetHeader>

          <form
            action={async (formData: FormData) => {
              setIsSubmitting(true);
              await formAction(formData);
              setIsSubmitting(false);
            }}
            className="flex-1 flex flex-col"
          >
            {/* Form Content */}
            <div className="flex-1 px-6 py-6 space-y-6 bg-white dark:bg-[#0a0a0a]">
              {/* Error message */}
              {state.message && !state.success && (
                <Alert
                  variant="destructive"
                  className="border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-900 dark:text-red-400">{state.message}</AlertDescription>
                </Alert>
              )}

              {/* Name */}
              <FormInput
                id="name"
                name="name"
                label="Nombre del evento"
                placeholder="Ej: Fiesta de Año Nuevo 2025"
                autoFocus
                disabled={isSubmitting}
                error={state.errors?.name?.[0]}
                required
              />

              {/* Next steps info */}
              <div className="flex gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  Después de crear el evento podrás configurar fechas, flyer,
                  boletos y más detalles.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <CreateEventSubmitButton className="flex-1" />
              </div>
            </div>
          </form>
        </div>
      </SheetContent>

      {/* Desktop: Right Side Sheet */}
      <SheetContent
        side="right"
        className="hidden sm:block w-full sm:max-w-md p-0 bg-white dark:bg-[#0a0a0a] border-l border-gray-200 dark:border-white/10 overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-gray-200 dark:border-white/10">
            <SheetTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Nuevo Evento
            </SheetTitle>
            <p className="text-sm text-gray-600 dark:text-white/60">
              Crea tu evento en segundos. Podrás configurar más detalles
              después.
            </p>
          </SheetHeader>

          <form
            action={async (formData: FormData) => {
              setIsSubmitting(true);
              await formAction(formData);
              setIsSubmitting(false);
            }}
            className="flex-1 flex flex-col"
          >
            {/* Form Content */}
            <div className="flex-1 px-6 py-6 space-y-6 bg-white dark:bg-[#0a0a0a]">
              {/* Error message */}
              {state.message && !state.success && (
                <Alert
                  variant="destructive"
                  className="border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-900 dark:text-red-400">{state.message}</AlertDescription>
                </Alert>
              )}

              {/* Name */}
              <FormInput
                id="name"
                name="name"
                label="Nombre del evento"
                placeholder="Ej: Fiesta de Año Nuevo 2025"
                autoFocus
                disabled={isSubmitting}
                error={state.errors?.name?.[0]}
                required
              />

              {/* Next steps info */}
              <div className="flex gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  Después de crear el evento podrás configurar fechas, flyer,
                  boletos y más detalles.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#0a0a0a]">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setOpen(false)}
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <CreateEventSubmitButton className="flex-1" />
              </div>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
