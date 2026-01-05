"use client";

import { useState, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateUserName } from "@/actions/profile";
import { toast } from "sonner";

interface NameManagerProps {
  nombres: string | null;
  apellidos: string | null;
}

function SubmitButton({ hasChanges }: { hasChanges: boolean }) {
  const { pending } = useFormStatus();

  if (!hasChanges) return null;

  return (
    <div className="flex justify-end">
      <Button
        type="submit"
        disabled={pending || !hasChanges}
        size="sm"
        className="bg-primary hover:bg-primary/90 text-primary-foreground"
      >
        {pending ? "Guardando..." : "Confirmar cambios"}
      </Button>
    </div>
  );
}

export function NameManager({ nombres, apellidos }: NameManagerProps) {
  const [firstName, setFirstName] = useState(nombres || "");
  const [lastName, setLastName] = useState(apellidos || "");
  const [state, formAction] = useFormState(updateUserName, {});

  // Check if there are any changes
  const hasChanges =
    firstName !== (nombres || "") || lastName !== (apellidos || "");

  // Handle form state updates
  useEffect(() => {
    if (state.success) {
      toast.success("Nombre actualizado exitosamente");
      // Reset state is handled by page reload from server
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-3">
      {/* Name inputs in grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* First Name */}
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              name="nombres"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Nombre/s Completo"
              className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* Last Name */}
        <div className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <User className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
            <input
              type="text"
              name="apellidos"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Apellidos Completos"
              className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500"
            />
          </div>
        </div>
      </div>

      {/* Confirm button - only show when there are changes */}
      <SubmitButton hasChanges={hasChanges} />
    </form>
  );
}
