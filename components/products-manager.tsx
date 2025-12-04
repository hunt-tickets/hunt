"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductFormSheet } from "@/components/product-form-sheet";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  sold: number;
  active: boolean;
  category: string;
  image?: string | null;
  createdAt: string;
}

interface ProductsManagerProps {
  initialProducts: Product[];
}

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateProduct = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleSaveProduct = (productData: Omit<Product, "id" | "sold" | "createdAt">) => {
    if (editingProduct) {
      // Update existing product
      setProducts(
        products.map((p) =>
          p.id === editingProduct.id
            ? { ...p, ...productData }
            : p
        )
      );
      // TODO: Call API to update product
      console.log("Updating product:", editingProduct.id, productData);
    } else {
      // Create new product
      const newProduct: Product = {
        ...productData,
        id: `prod-${Date.now()}`,
        sold: 0,
        createdAt: new Date().toISOString(),
      };
      setProducts([newProduct, ...products]);
      // TODO: Call API to create product
      console.log("Creating product:", newProduct);
    }
  };

  // Calculate stats
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.active).length;
  const totalRevenue = products.reduce((sum, p) => sum + p.sold * p.price, 0);
  const totalSold = products.reduce((sum, p) => sum + p.sold, 0);

  return (
    <>
      {/* Header with Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Productos</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gestiona cupones y productos canjeables en este evento
          </p>
        </div>
        <Button
          onClick={handleCreateProduct}
          className="w-full sm:w-auto bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Producto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-white/60 uppercase tracking-wider">
                Total Productos
              </span>
            </div>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-gray-500 dark:text-white/60">
              {activeProducts} activos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-white/60 uppercase tracking-wider">
                Ventas Totales
              </span>
            </div>
            <div className="text-2xl font-bold">{totalSold}</div>
            <p className="text-xs text-gray-500 dark:text-white/60">
              Productos vendidos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingBag className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-white/60 uppercase tracking-wider">
                Ingresos
              </span>
            </div>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-gray-500 dark:text-white/60">
              Ingresos generados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products Grid */}
      {products && products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => (
            <Card
              key={product.id}
              className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a] overflow-hidden hover:border-gray-300 dark:hover:border-white/20 transition-all duration-200"
            >
              {/* Product Image */}
              <div className="relative aspect-square bg-gray-200 dark:bg-[#2a2a2a]">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-16 w-16 text-gray-400 dark:text-gray-600" />
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full backdrop-blur-sm ${
                      product.active
                        ? "bg-green-500/90 text-white"
                        : "bg-gray-500/90 text-white"
                    }`}
                  >
                    {product.active ? "Activo" : "Inactivo"}
                  </span>
                </div>

              </div>

              {/* Product Info */}
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-base mb-1 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[40px]">
                    {product.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 mb-3 pb-3 border-b border-gray-200 dark:border-white/10">
                  <div>
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      Stock
                    </div>
                    <div>
                      {product.stock - product.sold}/{product.stock}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-700 dark:text-gray-300">
                      Vendidos
                    </div>
                    <div>{product.sold}</div>
                  </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-foreground">
                      {formatCurrency(product.price)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {formatCurrency(product.price * product.sold)} generado
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleEditProduct(product)}
                  >
                    Editar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="py-24">
            <div className="text-center">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm text-gray-400 dark:text-white/40 mb-4">
                No hay productos creados aún
              </p>
              <Button
                onClick={handleCreateProduct}
                className="bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Producto
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product Form Sheet */}
      <ProductFormSheet
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editingProduct}
        onSave={handleSaveProduct}
      />
    </>
  );
}
