"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search, X, ShoppingCart, CreditCard, Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SellerDetailSheet } from "@/components/seller-detail-sheet";

interface Seller {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  cashSales: number; // Cash sales amount
  gatewaySales: number; // Gateway/online sales amount
  ticketsSold: number; // Number of tickets sold
  commission: number | null; // Commission amount (not percentage)
  created_at: string;
}

interface SellersTableProps {
  sellers: Seller[];
}

export function SellersTable({ sellers }: SellersTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Filter sellers based on search
  const filteredSellers = sellers.filter((seller) => {
    const fullName = [seller.name, seller.lastName].filter(Boolean).join(' ').toLowerCase();
    const email = (seller.email || "").toLowerCase();
    const phone = (seller.phone || "").toLowerCase();
    const search = searchTerm.toLowerCase();

    return searchTerm === "" ||
      fullName.includes(search) ||
      email.includes(search) ||
      phone.includes(search);
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredSellers.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentSellers = filteredSellers.slice(startIndex, endIndex);

  // Handle page changes
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize));
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "";

  return (
    <div className="p-6 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-white/50" />
          <Input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="h-12 pl-12 pr-4 rounded-xl border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 focus:bg-gray-200 dark:focus:bg-white/10 transition-colors text-base placeholder:text-gray-500 dark:placeholder:text-white/50"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-500 dark:text-white/50 whitespace-nowrap">
          {filteredSellers.length === sellers.length ? (
            <span>{sellers.length} vendedores</span>
          ) : (
            <span>
              {filteredSellers.length} de {sellers.length}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-b border-gray-200 dark:border-white/5">
              <TableHead className="font-medium text-gray-500 dark:text-white/50 py-3 text-xs uppercase tracking-wider">Vendedor</TableHead>
              <TableHead className="font-medium text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">Tickets</TableHead>
              <TableHead className="font-medium text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">Efectivo</TableHead>
              <TableHead className="font-medium text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">Pasarela</TableHead>
              <TableHead className="font-medium text-gray-500 dark:text-white/50 text-xs uppercase tracking-wider">Comisión</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentSellers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-24">
                  <div className="text-center">
                    <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm text-gray-400 dark:text-white/40 mb-2">No se encontraron vendedores</p>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchInput("")}
                        className="text-gray-600 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10"
                      >
                        Limpiar búsqueda
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              currentSellers.map((seller) => {
                const fullName = [seller.name, seller.lastName].filter(Boolean).join(' ') || 'Sin nombre';

                const initials = fullName
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2);

                return (
                  <SellerDetailSheet key={seller.id} seller={seller}>
                    <TableRow className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all duration-200 group cursor-pointer">
                      {/* Vendedor */}
                      <TableCell className="py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-xl bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0 font-semibold text-sm text-gray-900 dark:text-white/90 ring-1 ring-gray-200 dark:ring-white/10">
                            {initials}
                          </div>
                          <span className="font-medium truncate">{fullName}</span>
                        </div>
                      </TableCell>

                      {/* Tickets Vendidos */}
                      <TableCell className="py-5">
                        <span className="text-sm text-gray-700 dark:text-white/80 flex items-center gap-1.5">
                          <ShoppingCart className="h-3.5 w-3.5 text-gray-400 dark:text-white/50" />
                          {seller.ticketsSold.toLocaleString('es-CO')}
                        </span>
                      </TableCell>

                      {/* Ventas Efectivo */}
                      <TableCell className="py-5">
                        <span className="text-sm text-gray-700 dark:text-white/80 flex items-center gap-1.5">
                          <Banknote className="h-3.5 w-3.5 text-gray-400 dark:text-white/50" />
                          ${seller.cashSales.toLocaleString('es-CO')}
                        </span>
                      </TableCell>

                      {/* Ventas Pasarela */}
                      <TableCell className="py-5">
                        <span className="text-sm text-gray-700 dark:text-white/80 flex items-center gap-1.5">
                          <CreditCard className="h-3.5 w-3.5 text-gray-400 dark:text-white/50" />
                          ${seller.gatewaySales.toLocaleString('es-CO')}
                        </span>
                      </TableCell>

                      {/* Comisión */}
                      <TableCell className="py-5">
                        {seller.commission !== null ? (
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            ${seller.commission.toLocaleString('es-CO')}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-white/40">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  </SellerDetailSheet>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-white/50">Mostrar</span>
            <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-20 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500 dark:text-white/50">por página</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-white/50">
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
