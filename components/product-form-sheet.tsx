"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Upload, X } from "lucide-react";

interface Product {
  id?: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  active: boolean;
  image?: string | null;
}

interface ProductFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSave: (product: Omit<Product, "id">) => void;
}

export function ProductFormSheet({
  open,
  onOpenChange,
  product,
  onSave,
}: ProductFormSheetProps) {
  const [formData, setFormData] = useState<Omit<Product, "id">>({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || 0,
    stock: product?.stock || 0,
    category: product?.category || "Bebidas",
    active: product?.active ?? true,
    image: product?.image || null,
  });

  const [imagePreview, setImagePreview] = useState<string | null>(
    product?.image || null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData({ ...formData, image: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData({ ...formData, image: null });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-background/95 backdrop-blur-xl border-white/10 p-6">
        <SheetHeader className="space-y-3 pb-6">
          <SheetTitle className="text-2xl font-bold">
            {product ? "Editar Producto" : "Crear Producto"}
          </SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
            {product
              ? "Modifica los detalles del producto"
              : "Completa la información para crear un nuevo producto"}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pr-2">
          {/* Image Upload */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Imagen</h3>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Imagen del Producto</Label>
              {imagePreview ? (
                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-white/10">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-3 right-3 h-9 w-9"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors bg-white/[0.02]">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="h-10 w-10 text-white/40 mb-2" />
                    <p className="text-sm text-white/60">
                      Click para subir imagen
                    </p>
                    <p className="text-xs text-white/40">
                      PNG, JPG o WEBP
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Información Básica</h3>

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
                placeholder="Ej: Cupón Barra - 2x1 Cerveza"
                className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                Descripción <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe el producto..."
                rows={3}
                className="min-h-[80px] rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors resize-none"
                required
              />
            </div>
          </div>

          {/* Category and Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Detalles</h3>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-sm font-medium">
                Categoría <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bebidas">Bebidas</SelectItem>
                  <SelectItem value="Comida">Comida</SelectItem>
                  <SelectItem value="Merchandising">Merchandising</SelectItem>
                  <SelectItem value="Experiencias">Experiencias</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-sm font-medium">
                  Precio (COP) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="100"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-medium">
                  Stock Disponible <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData({ ...formData, stock: Number(e.target.value) })
                  }
                  placeholder="0"
                  className="h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  required
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Estado</h3>

            <div className="flex items-center justify-between p-5 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="space-y-0.5">
                <Label htmlFor="active" className="text-sm font-medium">
                  Producto Activo
                </Label>
                <p className="text-sm text-white/60">
                  Los usuarios podrán comprar este producto
                </p>
              </div>
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, active: checked })
                }
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-white/10 sticky bottom-0 bg-background pb-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-full px-6 border-white/10 hover:bg-white/5 transition-all duration-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-full px-6 bg-primary hover:bg-primary/90 transition-all duration-300"
            >
              {product ? "Guardar Cambios" : "Crear Producto"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
