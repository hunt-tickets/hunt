"use client";

import { GripVertical, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EventDayOutput } from "@/actions/event-days";

type EventDay = EventDayOutput;

interface DayCardProps {
  day: EventDay;
  index: number;
  isSelected: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onSelect: () => void;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
  onRemove: () => void;
  onDuplicate: () => void;
}

export function DayCard({
  day,
  index,
  isSelected,
  isDragging,
  isDragOver,
  onSelect,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onRemove,
  onDuplicate,
}: DayCardProps) {
  const formatDateSummary = (dateStr: string) => {
    if (!dateStr) return "Sin fecha configurada";

    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        "relative group cursor-pointer",
        "transition-all duration-200",
        isDragging && "opacity-50"
      )}
    >
      {/* Drag over indicator */}
      {isDragOver && !isDragging && (
        <div className="absolute -top-[2px] left-0 right-0 h-[3px] bg-zinc-900 dark:bg-zinc-100 rounded-full" />
      )}

      <div
        onClick={onSelect}
        className={cn(
          "relative p-4 rounded-xl border transition-all",
          "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800",
          "hover:border-zinc-300 dark:hover:border-zinc-700",
          isSelected &&
            "border-zinc-400 dark:border-zinc-600 bg-white dark:bg-zinc-900"
        )}
      >
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <div
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-5 h-5" />
          </div>

          {/* Day number badge */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-sm">
            {index + 1}
          </div>

          {/* Day content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
              {day.name || `Día ${index + 1}`}
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatDateSummary(day.date)}
            </p>
          </div>

          {/* Actions (visible on hover) */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate();
              }}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              title="Duplicar día"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="h-8 w-8 p-0 text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
              title="Eliminar día"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
