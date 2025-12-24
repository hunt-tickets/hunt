"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CreateEventSubmitButtonProps {
  form?: string;
  className?: string;
}

export function CreateEventSubmitButton({
  form,
  className,
}: CreateEventSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className={cn("w-full sm:w-auto h-10 px-6", className)}
      form={form}
    >
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? "Creando..." : "Crear Evento"}
    </Button>
  );
}
