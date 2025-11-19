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
import { Pencil } from "lucide-react";
import { updateTicket } from "@/lib/supabase/actions/tickets";
import { useRouter } from "next/navigation";

interface Ticket {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  capacity: number | null;
  max_date: string | null;
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
    max_date: ticket.max_date || "",
    status: ticket.status,
    section: ticket.section || "",
    row: ticket.row || "",
    seat: ticket.seat || "",
    palco: ticket.palco || "",
    hex: ticket.hex || "",
    family: ticket.family || "",
    reference: ticket.reference || "",
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
        max_date: ticket.max_date || "",
        status: ticket.status,
        section: ticket.section || "",
        row: ticket.row || "",
        seat: ticket.seat || "",
        palco: ticket.palco || "",
        hex: ticket.hex || "",
        family: ticket.family || "",
        reference: ticket.reference || "",
      });
      setError(null);
    }
  }, [open, ticket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.quantity) {
      setError("Nombre, precio y cantidad son requeridos");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await updateTicket(ticket.id, {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        max_date: formData.max_date || undefined,
        status: formData.status,
        section: formData.section || undefined,
        row: formData.row || undefined,
        seat: formData.seat || undefined,
        palco: formData.palco || undefined,
        hex: formData.hex || undefined,
        family: formData.family || undefined,
        reference: formData.reference || undefined,
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity" className="text-sm font-medium">
                  Capacidad
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  placeholder="100"
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_date" className="text-sm font-medium">
                  Fecha Máxima
                </Label>
                <Input
                  id="max_date"
                  type="datetime-local"
                  value={formData.max_date}
                  onChange={(e) => setFormData({ ...formData, max_date: e.target.value })}
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hex" className="text-sm font-medium">
                  Color (Hex)
                </Label>
                <Input
                  id="hex"
                  type="color"
                  value={formData.hex}
                  onChange={(e) => setFormData({ ...formData, hex: e.target.value })}
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="family" className="text-sm font-medium">
                  Familia
                </Label>
                <Input
                  id="family"
                  value={formData.family}
                  onChange={(e) => setFormData({ ...formData, family: e.target.value })}
                  placeholder="Ej: Platino, Premium..."
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Ubicación</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="section" className="text-sm font-medium">
                  Sección
                </Label>
                <Input
                  id="section"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder="A, B, C..."
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="palco" className="text-sm font-medium">
                  Palco
                </Label>
                <Input
                  id="palco"
                  value={formData.palco}
                  onChange={(e) => setFormData({ ...formData, palco: e.target.value })}
                  placeholder="1, 2, 3..."
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="row" className="text-sm font-medium">
                  Fila
                </Label>
                <Input
                  id="row"
                  value={formData.row}
                  onChange={(e) => setFormData({ ...formData, row: e.target.value })}
                  placeholder="1, 2, 3..."
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seat" className="text-sm font-medium">
                  Asiento
                </Label>
                <Input
                  id="seat"
                  value={formData.seat}
                  onChange={(e) => setFormData({ ...formData, seat: e.target.value })}
                  placeholder="1, 2, 3..."
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Otros */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Otros</h3>

            <div className="space-y-2">
              <Label htmlFor="reference" className="text-sm font-medium">
                Referencia
              </Label>
              <Input
                id="reference"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="REF-001"
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="space-y-0.5">
                <Label htmlFor="status" className="text-sm font-medium">
                  Estado
                </Label>
                <p className="text-sm text-white/60">
                  Activar o desactivar la entrada
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
