"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { unlinkAccount } from "@/actions/profile";
import { toast } from "@/lib/toast";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants/profile";
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
import type { UnlinkAccountButtonProps } from "@/lib/profile/types";

export function UnlinkAccountButton({
  accountId,
  providerName,
}: UnlinkAccountButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleUnlink = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await unlinkAccount(accountId);

      if (result.error) {
        toast.error({ title: result.error });
      } else if (result.success) {
        toast.success({ title: SUCCESS_MESSAGES.ACCOUNT_UNLINKED });
      }
    } catch (error) {
      toast.error({ title: ERROR_MESSAGES.UNLINK_ACCOUNT_FAILED });
      if (process.env.NODE_ENV === "development") {
        console.error("Error unlinking account:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          disabled={isLoading}
          aria-label={`Desvincular cuenta de ${providerName}`}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-2xl border dark:border-[#2a2a2a]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Desvincular cuenta de {providerName}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Ya no podrás iniciar sesión con
            esta cuenta de {providerName}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="rounded-xl" disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUnlink}
            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2
                  className="mr-2 h-4 w-4 animate-spin"
                  aria-hidden="true"
                />
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
