"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Ticket } from "lucide-react";
import { createTicketType } from "@/lib/supabase/actions/events";
import { useRouter } from "next/navigation";

interface CreateTicketTypeDialogProps {
  eventId: string;
}

export function CreateTicketTypeDialog({ eventId }: CreateTicketTypeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
  });

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
      });

      if (result.success) {
        setOpen(false);
        resetForm();
        router.refresh();
      } else {
        setError(result.message || "Error al crear el tipo de entrada");
      }
    } catch {
      setError("Error inesperado al crear el tipo de entrada");
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
    <>
      {/* Trigger Button */}
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        className="rounded-lg border-white/10 hover:bg-white/5 transition-all duration-300"
      >
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Tipo
      </Button>

      {/* Sidebar Modal */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
          />

          {/* Sidebar Panel */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[500px] bg-[#1a1a1a] border-l border-white/10 z-50 overflow-y-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Ticket className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Nuevo Tipo de Entrada</h2>
                  <p className="text-sm text-white/60">
                    Crea una categoría para tus entradas
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Información Básica */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Información Básica
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nombre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ej: General, VIP, Palco..."
                    className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    required
                  />
                  <p className="text-xs text-white/40">
                    Nombre que identificará este tipo de entrada
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe los beneficios o características de esta entrada..."
                    className="min-h-[80px] rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Precio y Capacidad */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Precio y Disponibilidad
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">
                      Precio <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="50000"
                      className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                      required
                    />
                    {formData.price && (
                      <p className="text-xs text-primary">
                        {formatCurrency(formData.price)}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-sm font-medium">
                      Capacidad <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({ ...formData, capacity: e.target.value })
                      }
                      placeholder="100"
                      className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                      required
                    />
                    <p className="text-xs text-white/40">Entradas disponibles</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minPerOrder" className="text-sm font-medium">
                      Mínimo por orden
                    </Label>
                    <Input
                      id="minPerOrder"
                      type="number"
                      min="1"
                      value={formData.minPerOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, minPerOrder: e.target.value })
                      }
                      placeholder="1"
                      className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxPerOrder" className="text-sm font-medium">
                      Máximo por orden
                    </Label>
                    <Input
                      id="maxPerOrder"
                      type="number"
                      min="1"
                      value={formData.maxPerOrder}
                      onChange={(e) =>
                        setFormData({ ...formData, maxPerOrder: e.target.value })
                      }
                      placeholder="10"
                      className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Ventana de Venta */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
                  Ventana de Venta
                </h3>
                <p className="text-xs text-white/40 -mt-2">
                  Opcional: Define cuándo estará disponible esta entrada
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="saleStart" className="text-sm font-medium">
                      Inicio de venta
                    </Label>
                    <Input
                      id="saleStart"
                      type="datetime-local"
                      value={formData.saleStart}
                      onChange={(e) =>
                        setFormData({ ...formData, saleStart: e.target.value })
                      }
                      className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="saleEnd" className="text-sm font-medium">
                      Fin de venta
                    </Label>
                    <Input
                      id="saleEnd"
                      type="datetime-local"
                      value={formData.saleEnd}
                      onChange={(e) =>
                        setFormData({ ...formData, saleEnd: e.target.value })
                      }
                      className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <p className="text-sm text-red-500 font-medium">{error}</p>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  disabled={isLoading}
                  className="rounded-full px-6 border-white/10 hover:bg-white/5 transition-all duration-300"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-full px-6 bg-primary hover:bg-primary/90 transition-all duration-300 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creando...
                    </span>
                  ) : (
                    "Crear Tipo de Entrada"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </>
  );
}
