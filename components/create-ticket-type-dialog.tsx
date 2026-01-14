"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Calendar, CalendarRange, AlertCircle, Loader2 } from "lucide-react";
import { createTicketType } from "@/actions/events";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface EventDay {
  id: string;
  name: string;
  date: string;
}

interface CreateTicketTypeDialogProps {
  eventId: string;
  eventType?: "single" | "multi_day" | "recurring" | "slots";
  eventDays?: EventDay[];
  selectedDayId?: string;
}

export function CreateTicketTypeDialog({
  eventId,
  eventType = "single",
  eventDays = [],
  selectedDayId,
}: CreateTicketTypeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isMultiDay = eventType === "multi_day" && eventDays.length > 0;
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    capacity: "",
    minPerOrder: "1",
    maxPerOrder: "10",
    saleStart: "",
    saleEnd: "",
    eventDayId: selectedDayId || "", // "" means all days (pase general)
    sellerOnly: false,
  });

  // Update eventDayId when selectedDayId changes
  useEffect(() => {
    if (selectedDayId) {
      setFormData((prev) => ({ ...prev, eventDayId: selectedDayId }));
    }
  }, [selectedDayId]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      capacity: "",
      minPerOrder: "1",
      maxPerOrder: "10",
      saleStart: "",
      saleEnd: "",
      eventDayId: selectedDayId || "",
      sellerOnly: false,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    if (!formData.price || parseFloat(formData.price) < 0) {
      setError("El precio debe ser mayor o igual a 0");
      return;
    }

    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      setError("La capacidad debe ser al menos 1");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await createTicketType(eventId, {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity),
        minPerOrder: formData.minPerOrder ? parseInt(formData.minPerOrder) : 1,
        maxPerOrder: formData.maxPerOrder ? parseInt(formData.maxPerOrder) : 10,
        saleStart: formData.saleStart || undefined,
        saleEnd: formData.saleEnd || undefined,
        eventDayId: formData.eventDayId || undefined, // undefined = all days
      });

      if (result.success) {
        setOpen(false);
        resetForm();
        router.refresh();
      } else {
        setError(result.message || "Error al crear la entrada");
      }
    } catch {
      setError("Error inesperado al crear la entrada");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "";
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        size="sm"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 border-0"
      >
        <Plus className="h-4 w-4 mr-2" />
        Nueva Entrada
      </Button>

      <SheetContent
        side="right"
        className="w-full sm:w-[40vw] sm:max-w-[40vw] p-0 bg-white dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-[#2a2a2a] overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-5 border-b border-gray-200 dark:border-[#2a2a2a]">
            <SheetTitle className="text-xl font-semibold">
              Nueva Entrada
            </SheetTitle>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configura los detalles de tu entrada
            </p>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            {/* Form Content */}
            <div className="flex-1 px-6 py-6 space-y-6">
              {/* Error message */}
              {error && (
                <Alert
                  variant="destructive"
                  className="border-destructive/50 bg-destructive/10"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Nombre */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nombre <span className="text-gray-400">*</span>
                </Label>
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: General, VIP, Palco..."
                    className="h-6 w-full bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-none"
                    autoFocus
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descripción
                </Label>
                <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe los beneficios..."
                    className="min-h-[60px] w-full !bg-transparent !border-none focus-visible:ring-0 text-sm font-medium p-0 !text-gray-900 dark:!text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 !shadow-none resize-none"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Day Selection - Only for multi-day events */}
              {isMultiDay && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Día del evento</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* All Days (Pase General) option */}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, eventDayId: "" })
                      }
                      disabled={isLoading}
                      className={cn(
                        "p-3 rounded-xl border text-left transition-all",
                        formData.eventDayId === ""
                          ? "border-gray-400 dark:border-white/40 bg-gray-100 dark:bg-white/10"
                          : "border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#202020]"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <CalendarRange className="h-4 w-4" />
                        <span className="text-sm font-medium">Pase General</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Válido todos los días
                      </p>
                    </button>

                    {/* Individual day options */}
                    {eventDays.map((day) => {
                      const dayDate = day.date
                        ? new Date(day.date).toLocaleDateString("es-ES", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })
                        : "";
                      return (
                        <button
                          type="button"
                          key={day.id}
                          onClick={() =>
                            setFormData({ ...formData, eventDayId: day.id })
                          }
                          disabled={isLoading}
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all",
                            formData.eventDayId === day.id
                              ? "border-gray-400 dark:border-white/40 bg-gray-100 dark:bg-white/10"
                              : "border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#1a1a1a] hover:bg-gray-100 dark:hover:bg-[#202020]"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm font-medium">{day.name}</span>
                          </div>
                          {dayDate && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {dayDate}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Precio y Capacidad */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">
                    Precio <span className="text-gray-400">*</span>
                  </Label>
                  <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
                    <Input
                      id="price"
                      type="text"
                      inputMode="numeric"
                      value={formData.price ? parseInt(formData.price).toLocaleString('es-CO') : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, price: value });
                      }}
                      placeholder="50.000"
                      className="h-6 w-full bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={isLoading}
                      required
                    />
                  </div>
                  {formData.price && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatCurrency(formData.price)}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacity" className="text-sm font-medium">
                    Capacidad <span className="text-gray-400">*</span>
                  </Label>
                  <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
                    <Input
                      id="capacity"
                      type="text"
                      inputMode="numeric"
                      value={formData.capacity ? parseInt(formData.capacity).toLocaleString('es-CO') : ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, capacity: value });
                      }}
                      placeholder="100"
                      className="h-6 w-full bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Min/Max por orden */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minPerOrder" className="text-sm font-medium">
                    Mínimo por orden
                  </Label>
                  <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
                    <Input
                      id="minPerOrder"
                      type="number"
                      min="1"
                      value={formData.minPerOrder}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minPerOrder: e.target.value,
                        })
                      }
                      placeholder="1"
                      className="h-6 w-full bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPerOrder" className="text-sm font-medium">
                    Máximo por orden
                  </Label>
                  <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
                    <Input
                      id="maxPerOrder"
                      type="number"
                      min="1"
                      value={formData.maxPerOrder}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxPerOrder: e.target.value,
                        })
                      }
                      placeholder="10"
                      className="h-6 w-full bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Ventana de Venta */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="saleStart" className="text-sm font-medium">
                    Inicio de venta
                  </Label>
                  <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
                    <Input
                      id="saleStart"
                      type="datetime-local"
                      value={formData.saleStart}
                      onChange={(e) =>
                        setFormData({ ...formData, saleStart: e.target.value })
                      }
                      className="h-6 w-full bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-none"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="saleEnd" className="text-sm font-medium">
                    Fin de venta
                  </Label>
                  <div className="p-3 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors">
                    <Input
                      id="saleEnd"
                      type="datetime-local"
                      value={formData.saleEnd}
                      onChange={(e) =>
                        setFormData({ ...formData, saleEnd: e.target.value })
                      }
                      className="h-6 w-full bg-transparent border-none focus-visible:ring-0 text-sm font-medium p-0 placeholder:text-gray-500 dark:placeholder:text-gray-400 shadow-none"
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Disponible solo para vendedores */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a]">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="sellerOnly" className="text-sm font-medium cursor-pointer">
                      Disponible solo para vendedores
                    </Label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Esta entrada solo podrá ser vendida por vendedores en efectivo
                    </p>
                  </div>
                  <Switch
                    id="sellerOnly"
                    checked={formData.sellerOnly}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, sellerOnly: checked })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  className="flex-1 h-11 rounded-xl hover:bg-gray-200 dark:hover:bg-accent/50"
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-11 rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    "Crear entrada"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
