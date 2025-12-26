"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface CreateEventSubmitButtonProps {
  className?: string;
}

export function CreateEventSubmitButton({
  className,
}: CreateEventSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={`bg-white text-black hover:bg-white/90 rounded-lg ${className}`}
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Creando...
        </>
      ) : (
        "Crear Evento"
      )}
    </Button>
  );
}
