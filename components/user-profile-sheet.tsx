"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Phone,
  FileText,
  Calendar,
  Cake,
  ShoppingBag,
  Ticket,
  Bell,
  BellOff,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ANIMATION_DELAYS } from "@/constants/constants";
import type { User, UserTransaction } from "@/lib/users/types";
import {
  formatUserPhone,
  getUserInitials,
  getFullName,
  getUserAge,
} from "@/lib/users/utils";

interface UserProfileSheetProps {
  user: User;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UserProfileSheet({
  user,
  open: controlledOpen,
  onOpenChange,
}: UserProfileSheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [totalTickets, setTotalTickets] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadTransactions();
    }
  }, [open]);

  const loadTransactions = async () => {
    setLoading(true);
    setError(null);

    // Simulate loading delay
    await new Promise((resolve) =>
      setTimeout(resolve, ANIMATION_DELAYS.MOCK_LOADING)
    );

    // TODO: Replace with real data fetch
    // For now using mock data from centralized location
    const { MOCK_TRANSACTIONS } = await import("@/lib/users/mock-data");

    const mockTotalSpent = MOCK_TRANSACTIONS.reduce(
      (sum, tx) => sum + tx.total,
      0
    );
    const mockTotalTickets = MOCK_TRANSACTIONS.reduce(
      (sum, tx) => sum + tx.quantity,
      0
    );

    setTransactions(MOCK_TRANSACTIONS);
    setTotalSpent(mockTotalSpent);
    setTotalTickets(mockTotalTickets);
    setLoading(false);
  };

  const fullName = getFullName(user.name, user.lastName);
  const phoneNumber = formatUserPhone(user.phone, user.prefix);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a] p-0 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="p-6 space-y-6">
          <SheetHeader className="space-y-2 p-0">
            <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              Perfil de Usuario
            </SheetTitle>
            <SheetDescription className="text-sm text-gray-500 dark:text-white/50">
              Información detallada del usuario e historial de compras
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            {/* User Info Header */}
            <div className="flex items-start gap-4 p-6 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
              <div className="h-16 w-16 rounded-xl bg-gray-100 dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0 font-bold text-xl text-gray-900 dark:text-white ring-1 ring-gray-200 dark:ring-white/10">
                {getUserInitials(user.name, user.lastName)}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {fullName}
                </h2>

                <div className="space-y-2">
                  {user.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-white/70">
                      <Mail className="h-3.5 w-3.5 text-gray-400 dark:text-white/40" />
                      {user.email}
                    </div>
                  )}
                  {phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-white/70">
                      <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-white/40" />
                      {phoneNumber}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {user.document_id && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40 mb-1">
                    <FileText className="h-3.5 w-3.5" />
                    Documento
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {user.document_id}
                  </div>
                </div>
              )}

              {user.birthdate && (
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40 mb-1">
                    <Cake className="h-3.5 w-3.5" />
                    Edad
                  </div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    {getUserAge(user.birthdate)} años
                  </div>
                  <div className="text-xs text-gray-500 dark:text-white/40 mt-0.5">
                    {formatDate(user.birthdate, "SHORT")}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40 mb-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Fecha de Registro
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatDate(user.created_at, "SHORT")}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40 mb-1">
                  {user.marketing_emails ? (
                    <Bell className="h-3.5 w-3.5" />
                  ) : (
                    <BellOff className="h-3.5 w-3.5" />
                  )}
                  Publicidad
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`text-sm font-semibold ${user.marketing_emails ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
                  >
                    {user.marketing_emails ? "Aceptada" : "No aceptada"}
                  </div>
                  {user.marketing_emails ? (
                    <Badge className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20 hover:bg-green-100 dark:hover:bg-green-500/10 text-xs">
                      Sí
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/10 text-xs">
                      No
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Purchase Stats */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Estadísticas de Compra
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40 mb-2">
                    <ShoppingBag className="h-4 w-4" />
                    Total Gastado
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${totalSpent.toLocaleString("es-CO")}
                  </div>
                </div>

                <div className="p-5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40 mb-2">
                    <Ticket className="h-4 w-4" />
                    Total Tickets
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {totalTickets}
                  </div>
                </div>
              </div>
            </div>

            {/* Transaction History */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Historial de Compras
              </h3>

              {loading ? (
                <div
                  className="text-center py-12 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5"
                  role="status"
                  aria-live="polite"
                >
                  <div
                    className="h-8 w-8 border-2 border-gray-300 dark:border-white/30 border-t-gray-900 dark:border-t-white rounded-full animate-spin mx-auto"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-gray-500 dark:text-white/40 mt-3">
                    Cargando transacciones...
                  </p>
                </div>
              ) : error ? (
                <div
                  className="text-center py-12 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20"
                  role="alert"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {error}
                  </p>
                </div>
              ) : transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                            {tx.event_name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-white/60 truncate">
                            {tx.ticket_name}
                          </div>
                        </div>
                        <Badge className="bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-white/70 border-0 hover:bg-gray-200 dark:hover:bg-white/10 text-xs ml-2">
                          {tx.source === "app"
                            ? "App"
                            : tx.source === "web"
                              ? "Web"
                              : "Efectivo"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500 dark:text-white/50">
                          {tx.quantity} ticket{tx.quantity > 1 ? "s" : ""}
                        </span>
                        <span className="font-bold text-gray-900 dark:text-white">
                          ${tx.total.toLocaleString("es-CO")}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 dark:text-white/30 mt-2 pt-2 border-t border-gray-200 dark:border-white/5">
                        {formatDate(tx.created_at, "WITH_TIME")}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-white/20" />
                  <p className="text-sm text-gray-500 dark:text-white/40">
                    Este usuario no ha realizado compras
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
