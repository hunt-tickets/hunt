"use client";

import { useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleEventStatus } from "@/lib/supabase/actions/events";
import { Loader2 } from "lucide-react";

interface EventStatusToggleProps {
  eventId: string;
  initialStatus: boolean;
}

export function EventStatusToggle({ eventId, initialStatus }: EventStatusToggleProps) {
  const [status, setStatus] = useState(initialStatus);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (checked: boolean) => {
    startTransition(async () => {
      const result = await toggleEventStatus(eventId, checked);
      if (result.success) {
        setStatus(checked);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Switch
            checked={status}
            onCheckedChange={handleToggle}
            disabled={isPending}
          />
        )}
        <span className={`text-sm font-medium ${status ? "text-green-400" : "text-white/40"}`}>
          {status ? "Activo" : "Inactivo"}
        </span>
      </div>
    </div>
  );
}
