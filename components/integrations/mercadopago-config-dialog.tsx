"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface MercadoPagoAccount {
  id: string;
  processorAccountId: string;
  status: "active" | "inactive" | "suspended";
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

interface MercadoPagoConfigDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accounts: MercadoPagoAccount[];
  organizationId: string;
}

export function MercadoPagoConfigDialog({
  open,
  onOpenChange,
  accounts,
  organizationId,
}: MercadoPagoConfigDialogProps) {
  const router = useRouter();
  const [loadingAccountId, setLoadingAccountId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  // Handle status toggle
  const handleStatusChange = async (
    accountId: string,
    currentStatus: string,
    checked: boolean
  ) => {
    if (loadingAccountId || currentStatus === "suspended") return;

    const newStatus = checked ? "active" : "inactive";
    setLoadingAccountId(accountId);

    try {
      const response = await fetch(`/api/payment-accounts/${accountId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update status");
      }

      toast.success(
        `Cuenta ${newStatus === "active" ? "activada" : "desactivada"} exitosamente`
      );
      router.refresh();
    } catch (error) {
      console.error("Error updating account status:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar el estado de la cuenta"
      );
    } finally {
      setLoadingAccountId(null);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    setLoadingAccountId(accountToDelete);

    try {
      const response = await fetch(`/api/payment-accounts/${accountToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect account");
      }

      toast.success("Cuenta de Mercado Pago desconectada exitosamente");
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
      router.refresh();

      // Close dialog if no accounts left
      if (accounts.length === 1) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error disconnecting account:", error);
      toast.error("Error al desconectar la cuenta");
    } finally {
      setLoadingAccountId(null);
    }
  };

  const openDeleteDialog = (accountId: string) => {
    setAccountToDelete(accountId);
    setDeleteDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Configuración de Mercado Pago
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 dark:text-white/60">
              Gestiona tus cuentas conectadas de Mercado Pago
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {accounts.map((account) => {
              const metadata = account.metadata as {
                email?: string;
                first_name?: string;
                last_name?: string;
                live_mode?: boolean;
              } | null;

              const email = metadata?.email || "Sin correo";
              const name = metadata?.first_name && metadata?.last_name
                ? `${metadata.first_name} ${metadata.last_name}`
                : "Sin nombre";
              const liveMode = metadata?.live_mode ?? false;
              const isActive = account.status === "active";
              const isSuspended = account.status === "suspended";
              const isLoading = loadingAccountId === account.id;

              return (
                <div
                  key={account.id}
                  className="p-4 rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#202020]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-3">
                      {/* Account Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{name}</p>
                          <Badge
                            className={`text-xs ${
                              liveMode
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700"
                                : "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-700"
                            }`}
                          >
                            {liveMode ? "Producción" : "Test"}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-white/60">
                          {email}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-white/50">
                          Conectado el{" "}
                          {new Date(account.createdAt).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>

                      {/* Status Toggle */}
                      <div className="flex items-center gap-3 pt-2 border-t border-gray-200 dark:border-[#2a2a2a]">
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) =>
                            handleStatusChange(account.id, account.status, checked)
                          }
                          disabled={isLoading || isSuspended}
                        />
                        <span className="text-sm text-gray-600 dark:text-white/60">
                          {isSuspended
                            ? "Suspendida"
                            : isActive
                              ? "Activa"
                              : "Inactiva"}
                        </span>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={() => openDeleteDialog(account.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Add Another Account Button */}
            <Button
              variant="outline"
              className="w-full rounded-xl border-dashed"
              onClick={() => {
                // This will trigger the OAuth flow again
                window.location.href = `/api/mercadopago/authorize?organizationId=${organizationId}`;
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Conectar otra cuenta
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border dark:border-[#2a2a2a]">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Desconectar cuenta de Mercado Pago?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará la cuenta de Mercado Pago. Ya no podrás recibir
              pagos a través de esta cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl" disabled={loadingAccountId !== null}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loadingAccountId !== null}
            >
              {loadingAccountId !== null ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desconectando...
                </>
              ) : (
                "Desconectar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
