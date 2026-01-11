"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Settings, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PaymentAccountActionsProps {
  accountId: string;
  processorName: string;
}

export function PaymentAccountActions({
  accountId,
  processorName,
}: PaymentAccountActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  /**
   * Handles payment account deletion
   */
  const handleDeleteAccount = async () => {
    setIsLoading(true);

    try {
      const response = await fetch(`/api/payment-accounts/${accountId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to disconnect payment account");
      }

      toast.success(`${processorName} desconectado exitosamente`);
      setIsDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Error disconnecting payment account:", error);
      toast.error(`Error al desconectar ${processorName}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={isLoading}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver detalles
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => setIsDialogOpen(true)}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Desconectar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialogContent className="rounded-2xl border dark:border-[#2a2a2a]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Desconectar {processorName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción eliminará el procesador de pagos de tu cuenta. Ya no podrás recibir pagos a través de {processorName}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl" disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
                Desconectando...
              </>
            ) : (
              "Desconectar"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
