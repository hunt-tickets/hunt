"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Pencil, Clock } from "lucide-react";
import { updateTicketType } from "@/lib/supabase/actions/tickets";
import { useRouter } from "next/navigation";
import { SimpleDateTimePicker } from "@/components/ui/simple-datetime-picker";

interface Ticket {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  capacity: number | null;
  max_date: string | null;
  sale_start?: string | null;
  sale_end?: string | null;
  min_per_order?: number;
  max_per_order?: number;
  status: boolean;
  section: string | null;
  row: string | null;
  seat: string | null;
  palco: string | null;
  hex: string | null;
  family: string | null;
  reference: string | null;
}

interface EditTicketSheetProps {
  ticket: Ticket;
}

export function EditTicketSheet({ ticket }: EditTicketSheetProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    name: ticket.name,
    description: ticket.description || "",
    price: ticket.price.toString(),
    quantity: ticket.quantity.toString(),
    capacity: ticket.capacity?.toString() || "",
    min_per_order: (ticket.min_per_order || 1).toString(),
    max_per_order: (ticket.max_per_order || 10).toString(),
    sale_start: ticket.sale_start || "",
    sale_end: ticket.sale_end || "",
    status: ticket.status,
  });

  // Reset form when ticket changes or sheet opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: ticket.name,
        description: ticket.description || "",
        price: ticket.price.toString(),
        quantity: ticket.quantity.toString(),
        capacity: ticket.capacity?.toString() || "",
        min_per_order: (ticket.min_per_order || 1).toString(),
        max_per_order: (ticket.max_per_order || 10).toString(),
        sale_start: ticket.sale_start || "",
        sale_end: ticket.sale_end || "",
        status: ticket.status,
      });
      setError(null);
    }
  }, [open, ticket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.capacity) {
      setError("Nombre, precio y capacidad son requeridos");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateTicketType(ticket.id, {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        capacity: parseInt(formData.capacity),
        min_per_order: parseInt(formData.min_per_order),
        max_per_order: parseInt(formData.max_per_order),
        sale_start: formData.sale_start || null,
        sale_end: formData.sale_end || null,
      });

      if (result.success) {
        setOpen(false);
        router.refresh();
      } else {
        setError(result.message || "Error al actualizar la entrada");
      }
    } catch {
      setError("Error inesperado al actualizar la entrada");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-white/10"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background/95 backdrop-blur-xl border-white/10 p-6">
        <SheetHeader className="space-y-3 pb-6">
          <SheetTitle className="text-2xl font-bold">Editar Entrada</SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
            Modifica la información de la entrada.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pr-2">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Información Básica</h3>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej: VIP, General, Palco..."
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la entrada..."
                className="min-h-[80px] rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Precio <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="50000"
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-sm font-medium">
                  Cantidad <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="100"
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity" className="text-sm font-medium">
                Capacidad <span className="text-red-500">*</span>
              </Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                placeholder="100"
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                required
              />
              <p className="text-xs text-white/40">
                Número total de entradas disponibles
              </p>
            </div>
          </div>

          {/* Restricciones de Compra */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Restricciones de Compra</h3>
            <p className="text-sm text-white/50">
              Define los límites de compra por orden
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_per_order" className="text-sm font-medium">
                  Mínimo por Orden
                </Label>
                <Input
                  id="min_per_order"
                  type="number"
                  min="1"
                  value={formData.min_per_order}
                  onChange={(e) => setFormData({ ...formData, min_per_order: e.target.value })}
                  placeholder="1"
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
                <p className="text-xs text-white/40">
                  Cantidad mínima por compra
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_per_order" className="text-sm font-medium">
                  Máximo por Orden
                </Label>
                <Input
                  id="max_per_order"
                  type="number"
                  min="1"
                  value={formData.max_per_order}
                  onChange={(e) => setFormData({ ...formData, max_per_order: e.target.value })}
                  placeholder="10"
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
                <p className="text-xs text-white/40">
                  Cantidad máxima por compra
                </p>
              </div>
            </div>
          </div>

          {/* Ventana de Venta */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-white/60" />
              <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Ventana de Venta</h3>
            </div>
            <p className="text-sm text-white/50">
              Define cuándo estarán disponibles estas entradas para la venta
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sale_start" className="text-sm font-medium">
                  Inicio de Venta
                </Label>
                <SimpleDateTimePicker
                  name="sale_start"
                  value={formData.sale_start}
                  onChange={(value) => setFormData({ ...formData, sale_start: value })}
                  placeholder="Selecciona fecha y hora"
                />
                <p className="text-xs text-white/40">
                  Deja vacío para ventas inmediatas
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sale_end" className="text-sm font-medium">
                  Fin de Venta
                </Label>
                <SimpleDateTimePicker
                  name="sale_end"
                  value={formData.sale_end}
                  onChange={(value) => setFormData({ ...formData, sale_end: value })}
                  placeholder="Selecciona fecha y hora"
                />
                <p className="text-xs text-white/40">
                  Deja vacío para ventas continuas
                </p>
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Estado</h3>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="space-y-0.5">
                <Label htmlFor="status" className="text-sm font-medium">
                  Entrada Activa
                </Label>
                <p className="text-sm text-white/60">
                  Activar o desactivar la entrada para la venta
                </p>
              </div>
              <Switch
                id="status"
                checked={formData.status}
                onCheckedChange={(checked) => setFormData({ ...formData, status: checked })}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-sm text-red-500 font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-background py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setError(null);
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
                  Actualizando...
                </span>
              ) : (
                "Guardar Cambios"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
