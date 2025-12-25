"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleDateTimePicker } from "@/components/ui/simple-datetime-picker";
import { Plus, Trash2, GripVertical, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EventDay {
  id: string;
  name: string;
  date: string;
  endDate: string;
  sortOrder: number;
}

interface MultiDayManagerProps {
  days: EventDay[];
  onChange: (days: EventDay[]) => void;
  disabled?: boolean;
}

export function MultiDayManager({
  days,
  onChange,
  disabled,
}: MultiDayManagerProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const addDay = () => {
    const newDay: EventDay = {
      id: `temp-${Date.now()}`,
      name: `Día ${days.length + 1}`,
      date: "",
      endDate: "",
      sortOrder: days.length,
    };
    onChange([...days, newDay]);
  };

  const updateDay = (index: number, updates: Partial<EventDay>) => {
    const newDays = [...days];
    newDays[index] = { ...newDays[index], ...updates };
    onChange(newDays);
  };

  const removeDay = (index: number) => {
    const newDays = days.filter((_, i) => i !== index);
    // Update sort orders
    newDays.forEach((day, i) => {
      day.sortOrder = i;
    });
    onChange(newDays);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newDays = [...days];
    const draggedItem = newDays[draggedIndex];
    newDays.splice(draggedIndex, 1);
    newDays.splice(dropIndex, 0, draggedItem);

    // Update sort orders
    newDays.forEach((day, i) => {
      day.sortOrder = i;
    });

    onChange(newDays);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="space-y-4">
      {days.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
          <Calendar className="w-10 h-10 text-zinc-400 mb-3" />
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mb-4">
            Agrega los días de tu evento
          </p>
          <Button
            type="button"
            onClick={addDay}
            disabled={disabled}
            variant="outline"
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar día
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {days.map((day, index) => (
              <div
                key={day.id}
                draggable={!disabled}
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={() => setDragOverIndex(null)}
                onDrop={() => handleDrop(index)}
                onDragEnd={handleDragEnd}
                className={cn(
                  "relative p-4 rounded-xl border transition-all",
                  "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800",
                  draggedIndex === index && "opacity-50",
                  dragOverIndex === index && "border-zinc-400 dark:border-zinc-600"
                )}
              >
                {/* Drag indicator */}
                {dragOverIndex === index && draggedIndex !== index && (
                  <div className="absolute -top-[2px] left-0 right-0 h-[3px] bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                )}

                <div className="flex items-start gap-3">
                  {/* Drag handle */}
                  <div
                    className={cn(
                      "flex-shrink-0 pt-2 cursor-grab active:cursor-grabbing",
                      "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300",
                      disabled && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Day content */}
                  <div className="flex-1 space-y-4">
                    {/* Day name */}
                    <div>
                      <Label htmlFor={`day-name-${index}`} className="text-xs text-zinc-500">
                        Nombre del día
                      </Label>
                      <Input
                        id={`day-name-${index}`}
                        value={day.name}
                        onChange={(e) => updateDay(index, { name: e.target.value })}
                        placeholder="Ej: Viernes, Día 1, Pre-Party"
                        disabled={disabled}
                        className="mt-1"
                      />
                    </div>

                    {/* Date pickers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <SimpleDateTimePicker
                        name={`day-date-${index}`}
                        label="Inicio"
                        value={day.date}
                        onChange={(value) => updateDay(index, { date: value })}
                        placeholder="Fecha y hora"
                        required
                      />
                      <SimpleDateTimePicker
                        name={`day-end-${index}`}
                        label="Fin"
                        value={day.endDate}
                        onChange={(value) => updateDay(index, { endDate: value })}
                        placeholder="Fecha y hora"
                        minDate={day.date ? new Date(day.date) : undefined}
                      />
                    </div>
                  </div>

                  {/* Delete button */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDay(index)}
                    disabled={disabled}
                    className="flex-shrink-0 text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="button"
            onClick={addDay}
            disabled={disabled}
            variant="outline"
            className="w-full gap-2"
          >
            <Plus className="w-4 h-4" />
            Agregar otro día
          </Button>
        </>
      )}
    </div>
  );
}
