"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { unlinkAccount } from "@/actions/profile";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UnlinkAccountButtonProps {
  accountId: string;
  providerName: string;
}

export function UnlinkAccountButton({
  accountId,
  providerName,
}: UnlinkAccountButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlink = async () => {
    setIsLoading(true);
    try {
      const result = await unlinkAccount(accountId);

      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(`Cuenta de ${providerName} desvinculada exitosamente`);
      }
    } catch (error) {
      toast.error("Error al desvincular la cuenta");
      console.error("Error unlinking account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Desvincular cuenta de {providerName}?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Ya no podrás iniciar sesión con
            esta cuenta de {providerName}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnlink}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Desvinculando...
              </>
            ) : (
              "Desvincular"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
