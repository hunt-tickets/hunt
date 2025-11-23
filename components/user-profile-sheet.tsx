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
import { Badge } from "@/components/ui/badge";
import { Eye, Mail, Phone, FileText, Calendar, Cake, ShoppingBag, Ticket } from "lucide-react";
import { getUserTransactions, type UserTransaction } from "@/lib/supabase/actions/profile";

interface User {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  birthdate: string | null;
  gender: string | null;
  prefix: string | null;
  document_id: string | null;
  admin: boolean;
  created_at: string;
}

interface UserProfileSheetProps {
  user: User;
}

// Calculate age from birthdate
function calculateAge(birthdate: string): number {
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export function UserProfileSheet({ user }: UserProfileSheetProps) {
  const [open, setOpen] = useState(false);
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
    try {
      const result = await getUserTransactions(user.id);
      if (result.error) {
        setError(result.error);
      } else {
        setTransactions(result.transactions || []);
        setTotalSpent(result.totalSpent);
        setTotalTickets(result.totalTickets);
      }
    } catch {
      setError("Error al cargar las transacciones");
    } finally {
      setLoading(false);
    }
  };

  const fullName = [user.name, user.lastName].filter(Boolean).join(' ') || 'Sin nombre';
  const phoneNumber = user.phone
    ? user.prefix
      ? `${user.prefix} ${user.phone}`
      : user.phone
    : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 hover:bg-white/10"
        >
          <Eye className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-background/95 backdrop-blur-xl border-white/10 p-6">
        <SheetHeader className="space-y-3 pb-6">
          <SheetTitle className="text-2xl font-bold">Perfil de Usuario</SheetTitle>
          <SheetDescription className="text-base text-muted-foreground">
            Información detallada del usuario e historial de compras.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 pr-2">
          {/* User Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Información Personal</h3>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="text-lg font-semibold text-white">{fullName}</div>

                  {user.email && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Mail className="h-4 w-4 text-white/40" />
                      {user.email}
                    </div>
                  )}

                  {phoneNumber && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Phone className="h-4 w-4 text-white/40" />
                      {phoneNumber}
                    </div>
                  )}

                  {user.document_id && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <FileText className="h-4 w-4 text-white/40" />
                      {user.document_id}
                    </div>
                  )}

                  {user.birthdate && (
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <Cake className="h-4 w-4 text-white/40" />
                      {calculateAge(user.birthdate)} años • {new Date(user.birthdate).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Calendar className="h-4 w-4 text-white/40" />
                    Registrado el {new Date(user.created_at).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>

                {user.admin && (
                  <Badge
                    variant="default"
                    className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-400 border border-amber-500/20"
                  >
                    Admin
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Purchase Stats */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Estadísticas de Compra</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                  <ShoppingBag className="h-4 w-4" />
                  Total Gastado
                </div>
                <div className="text-2xl font-bold text-white">
                  ${totalSpent.toLocaleString()}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5">
                <div className="flex items-center gap-2 text-white/50 text-sm mb-1">
                  <Ticket className="h-4 w-4" />
                  Total Tickets
                </div>
                <div className="text-2xl font-bold text-white">
                  {totalTickets}
                </div>
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider">Historial de Compras</h3>

            {loading ? (
              <div className="text-center py-12">
                <div className="h-8 w-8 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                <p className="text-sm text-white/40 mt-2">Cargando transacciones...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-4 rounded-lg border border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white truncate">{tx.event_name}</div>
                        <div className="text-sm text-white/60 truncate">{tx.ticket_name}</div>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-white/10 text-white/50 text-xs ml-2"
                      >
                        {tx.source === 'app' ? 'App' : tx.source === 'web' ? 'Web' : 'Efectivo'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/40">
                        {tx.quantity} ticket{tx.quantity > 1 ? 's' : ''}
                      </span>
                      <span className="font-semibold text-white">${tx.total.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-white/30 mt-2">
                      {new Date(tx.created_at).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 rounded-xl bg-white/[0.02] border border-white/5">
                <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm text-white/40">Este usuario no ha realizado compras</p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
