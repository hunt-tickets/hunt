"use client";

import { cn } from "@/lib/utils";
import { Calendar, CalendarDays, Repeat, Clock } from "lucide-react";

export type EventType = "single" | "multi_day" | "recurring" | "slots";

interface EventTypeSelectorProps {
  value: EventType;
  onChange: (type: EventType) => void;
  disabled?: boolean;
}

const eventTypes = [
  {
    id: "single" as const,
    label: "Evento único",
    description: "Fiesta, concierto, conferencia",
    icon: Calendar,
  },
  {
    id: "multi_day" as const,
    label: "Varios días",
    description: "Festival, convención",
    icon: CalendarDays,
  },
  {
    id: "recurring" as const,
    label: "Recurrente",
    description: "Clases, reuniones semanales",
    icon: Repeat,
  },
  {
    id: "slots" as const,
    label: "Por horarios",
    description: "Tours, escape rooms, citas",
    icon: Clock,
  },
];

export function EventTypeSelector({
  value,
  onChange,
  disabled,
}: EventTypeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {eventTypes.map((type) => {
        const Icon = type.icon;
        const isSelected = value === type.id;

        return (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            disabled={disabled}
            className={cn(
              "relative flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all",
              "hover:border-zinc-400 dark:hover:border-zinc-600",
              isSelected
                ? "border-zinc-900 dark:border-zinc-100 bg-zinc-100 dark:bg-zinc-800"
                : "border-zinc-200 dark:border-zinc-800 bg-transparent",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center w-10 h-10 rounded-lg",
                isSelected
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <p
                className={cn(
                  "font-medium text-sm",
                  isSelected
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-700 dark:text-zinc-300"
                )}
              >
                {type.label}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-500">
                {type.description}
              </p>
            </div>
            {isSelected && (
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100" />
            )}
          </button>
        );
      })}
    </div>
  );
}
