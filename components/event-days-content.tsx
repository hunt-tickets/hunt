"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SimpleDateTimePicker } from "@/components/ui/simple-datetime-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Trash2,
  GripVertical,
  Calendar,
  Copy,
  AlertCircle,
  ArrowLeft,
  CalendarRange,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/lib/toast";
import { syncEventDays } from "@/lib/supabase/actions/event-days";
import Link from "next/link";
import { useParams } from "next/navigation";

interface EventDay {
  id: string;
  name: string;
  date: string;
  endDate: string;
  sortOrder: number;
}

interface EventDaysContentProps {
  eventId: string;
  initialDays: EventDay[];
}

export function EventDaysContent({
  eventId,
  initialDays,
}: EventDaysContentProps) {
  const params = useParams();
  const userId = params.userId as string;
  const organizationId = params.organizationId as string;

  const [days, setDays] = useState<EventDay[]>(initialDays);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate event duration summary
  const durationSummary = useMemo(() => {
    if (days.length === 0) return null;

    const validDates = days
      .filter((d) => d.date)
      .map((d) => new Date(d.date))
      .sort((a, b) => a.getTime() - b.getTime());

    if (validDates.length === 0) return null;

    const firstDate = validDates[0];
    const lastDate = validDates[validDates.length - 1];

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("es-ES", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    };

    const daysDiff = Math.ceil(
      (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    return {
      start: formatDate(firstDate),
      end: formatDate(lastDate),
      totalDays: daysDiff,
      configuredDays: days.length,
    };
  }, [days]);

  // Validation warnings
  const warnings = useMemo(() => {
    const issues: string[] = [];

    // Check for days without dates
    const daysWithoutDates = days.filter((d) => !d.date);
    if (daysWithoutDates.length > 0) {
      issues.push(`${daysWithoutDates.length} día(s) sin fecha configurada`);
    }

    // Check for out of order dates
    const sortedByDate = [...days]
      .filter((d) => d.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const isOutOfOrder = days.some((day, index) => {
      if (!day.date) return false;
      const sortedIndex = sortedByDate.findIndex((d) => d.id === day.id);
      return sortedIndex !== -1 && sortedIndex !== index;
    });

    if (isOutOfOrder) {
      issues.push("Las fechas no están en orden cronológico");
    }

    return issues;
  }, [days]);

  const addDay = () => {
    // Auto-suggest next day's date based on last day
    let suggestedDate = "";
    if (days.length > 0) {
      const lastDay = days[days.length - 1];
      if (lastDay.date) {
        const lastDate = new Date(lastDay.date);
        lastDate.setDate(lastDate.getDate() + 1);
        suggestedDate = lastDate.toISOString();
      }
    }

    const newDay: EventDay = {
      id: `temp-${Date.now()}`,
      name: `Día ${days.length + 1}`,
      date: suggestedDate,
      endDate: "",
      sortOrder: days.length,
    };
    setDays([...days, newDay]);
  };

  const duplicateDay = (index: number) => {
    const dayToDuplicate = days[index];

    // Calculate next day's date
    let nextDate = "";
    let nextEndDate = "";
    if (dayToDuplicate.date) {
      const originalDate = new Date(dayToDuplicate.date);
      originalDate.setDate(originalDate.getDate() + 1);
      nextDate = originalDate.toISOString();

      if (dayToDuplicate.endDate) {
        const originalEndDate = new Date(dayToDuplicate.endDate);
        originalEndDate.setDate(originalEndDate.getDate() + 1);
        nextEndDate = originalEndDate.toISOString();
      }
    }

    const newDay: EventDay = {
      id: `temp-${Date.now()}`,
      name: `${dayToDuplicate.name} (copia)`,
      date: nextDate,
      endDate: nextEndDate,
      sortOrder: index + 1,
    };

    // Insert after the duplicated day
    const newDays = [...days];
    newDays.splice(index + 1, 0, newDay);

    // Update sort orders
    newDays.forEach((day, i) => {
      day.sortOrder = i;
    });

    setDays(newDays);
  };

  const updateDay = (index: number, updates: Partial<EventDay>) => {
    const newDays = [...days];
    newDays[index] = { ...newDays[index], ...updates };
    setDays(newDays);
  };

  const removeDay = (index: number) => {
    const newDays = days.filter((_, i) => i !== index);
    newDays.forEach((day, i) => {
      day.sortOrder = i;
    });
    setDays(newDays);
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

    newDays.forEach((day, i) => {
      day.sortOrder = i;
    });

    setDays(newDays);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await syncEventDays(eventId, days);
      if (result.success) {
        toast.success({ title: "Días guardados exitosamente" });
      } else {
        toast.error({ title: result.message || "Error al guardar los días" });
      }
    } catch (error) {
      console.error("Error saving days:", error);
      toast.error({ title: "Error al guardar los días" });
    } finally {
      setIsSaving(false);
    }
  };

  const backUrl = `/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/configuracion`;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back link */}
      <Link
        href={backUrl}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a configuración
      </Link>

      {/* Duration Summary Card */}
      {durationSummary && (
        <Card className="bg-gradient-to-r from-zinc-900 to-zinc-800 border-zinc-700">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <CalendarRange className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">Duración del evento</p>
                  <p className="text-lg font-semibold text-white">
                    {durationSummary.start} → {durationSummary.end}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  {durationSummary.configuredDays}
                </p>
                <p className="text-sm text-zinc-400">días configurados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <Card className="border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="py-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                {warnings.map((warning, i) => (
                  <p key={i} className="text-sm text-yellow-200">
                    {warning}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Days Manager */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Días del Evento
          </CardTitle>
          <CardDescription>
            Configura los días de tu evento. Arrastra para reordenar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {days.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl">
                <Calendar className="w-12 h-12 text-zinc-400 mb-4" />
                <p className="text-zinc-500 dark:text-zinc-400 text-center mb-4">
                  Agrega los días de tu evento
                </p>
                <Button onClick={addDay} variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Agregar primer día
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {days.map((day, index) => (
                    <div
                      key={day.id}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragLeave={() => setDragOverIndex(null)}
                      onDrop={() => handleDrop(index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "relative p-4 rounded-xl border transition-all",
                        "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800",
                        draggedIndex === index && "opacity-50",
                        dragOverIndex === index &&
                          "border-zinc-400 dark:border-zinc-600"
                      )}
                    >
                      {/* Drag indicator */}
                      {dragOverIndex === index && draggedIndex !== index && (
                        <div className="absolute -top-[2px] left-0 right-0 h-[3px] bg-zinc-900 dark:bg-zinc-100 rounded-full" />
                      )}

                      <div className="flex items-start gap-3">
                        {/* Drag handle */}
                        <div className="flex-shrink-0 pt-2 cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                          <GripVertical className="w-5 h-5" />
                        </div>

                        {/* Day number badge */}
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>

                        {/* Day content */}
                        <div className="flex-1 space-y-4">
                          {/* Day name */}
                          <div>
                            <Label
                              htmlFor={`day-name-${index}`}
                              className="text-xs text-zinc-500"
                            >
                              Nombre del día
                            </Label>
                            <Input
                              id={`day-name-${index}`}
                              value={day.name}
                              onChange={(e) =>
                                updateDay(index, { name: e.target.value })
                              }
                              placeholder="Ej: Viernes, Día 1, Pre-Party"
                              className="mt-1"
                            />
                          </div>

                          {/* Date pickers */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <SimpleDateTimePicker
                              name={`day-date-${index}`}
                              label="Inicio"
                              value={day.date}
                              onChange={(value) =>
                                updateDay(index, { date: value })
                              }
                              placeholder="Fecha y hora"
                              required
                            />
                            <SimpleDateTimePicker
                              name={`day-end-${index}`}
                              label="Fin"
                              value={day.endDate}
                              onChange={(value) =>
                                updateDay(index, { endDate: value })
                              }
                              placeholder="Fecha y hora"
                              minDate={day.date ? new Date(day.date) : undefined}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateDay(index)}
                            className="text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            title="Duplicar día"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDay(index)}
                            className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
                            title="Eliminar día"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  onClick={addDay}
                  variant="outline"
                  className="w-full gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Agregar otro día
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save button */}
      {days.length > 0 && (
        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="min-w-[120px]"
          >
            {isSaving ? "Guardando..." : "Guardar días"}
          </Button>
        </div>
      )}
    </div>
  );
}
