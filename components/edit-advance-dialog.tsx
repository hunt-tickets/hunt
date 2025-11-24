"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { updateEventAdvance, deleteEventAdvance } from "@/lib/supabase/actions/advances";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

interface Advance {
  id: string;
  amount: number;
  concept: string;
  payment_date: string;
  payment_method: string;
  notes: string | null;
  file: string | null;
  debt: boolean;
}

interface EditAdvanceDialogProps {
  advance: Advance | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EditAdvanceDialog({ advance, isOpen, onClose }: EditAdvanceDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    concept: "",
    date: "",
    payment_method: "transferencia",
    notes: "",
    file: "",
    debt: false,
  });

  const formatNumberWithCommas = (value: string) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    // Format with thousands separator
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');
    setFormData({ ...formData, amount: numbers });
  };

  useEffect(() => {
    if (advance) {
      setFormData({
        amount: advance.amount.toString(),
        concept: advance.concept,
        date: advance.payment_date,
        payment_method: advance.payment_method,
        notes: advance.notes || "",
        file: advance.file || "",
        debt: advance.debt,
      });
    }
  }, [advance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advance) return;

    setIsLoading(true);

    try {
      const result = await updateEventAdvance(advance.id, {
        amount: parseFloat(formData.amount),
        concept: formData.concept,
        date: formData.date,
        payment_method: formData.payment_method,
        notes: formData.notes || undefined,
        file: formData.file || undefined,
        debt: formData.debt,
      });

      if (result.success) {
        router.refresh();
        onClose();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error updating advance:", error);
      alert("Error al actualizar el avance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!advance) return;

    if (!confirm("¿Estás seguro de que deseas eliminar este avance? Esta acción no se puede deshacer.")) {
      return;
    }

    setIsDeleting(true);

    try {
      const result = await deleteEventAdvance(advance.id);

      if (result.success) {
        router.refresh();
        onClose();
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error deleting advance:", error);
      alert("Error al eliminar el avance");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!advance) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1a1a] border-white/10">
        <DialogHeader>
          <DialogTitle>Editar Avance de Pago</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Monto *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">$</span>
              <Input
                id="amount"
                type="text"
                placeholder="0"
                value={formatNumberWithCommas(formData.amount)}
                onChange={handleAmountChange}
                required
                className="bg-white/5 border-white/10 pl-8"
              />
            </div>
            {formData.amount && (
              <p className="text-xs text-white/40">
                {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(parseInt(formData.amount) || 0)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="concept">Concepto *</Label>
            <Input
              id="concept"
              placeholder="Ej: Anticipo 1 - Gastos de producción"
              value={formData.concept}
              onChange={(e) => setFormData({ ...formData, concept: e.target.value })}
              required
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="bg-white/5 border-white/10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_method">Método de Pago *</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="datafono">Datáfono</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/5">
            <div className="space-y-0.5">
              <Label htmlFor="debt" className="text-sm font-medium">
                Saldo a Favor
              </Label>
              <p className="text-sm text-white/60">
                Marcar si este registro es un saldo a favor del productor
              </p>
            </div>
            <Switch
              id="debt"
              checked={formData.debt}
              onCheckedChange={(checked) => setFormData({ ...formData, debt: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Información adicional sobre este avance..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Archivo (Opcional)</Label>
            <Input
              id="file"
              placeholder="URL del archivo o comprobante"
              value={formData.file}
              onChange={(e) => setFormData({ ...formData, file: e.target.value })}
              className="bg-white/5 border-white/10"
            />
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </>
              )}
            </Button>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading || isDeleting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading || isDeleting}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
