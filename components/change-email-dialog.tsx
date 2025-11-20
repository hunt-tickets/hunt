"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChangeEmailForm } from "./change-email-form";
import { Mail } from "lucide-react";

interface ChangeEmailDialogProps {
  currentEmail: string;
}

export function ChangeEmailDialog({ currentEmail }: ChangeEmailDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    // Keep dialog open to show success message
    // User can manually close it
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Mail className="h-4 w-4" />
          Cambiar Email
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[75vh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden p-5 sm:p-6">
        <DialogHeader className="space-y-1.5 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Cambiar Correo Electrónico
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Actualiza tu dirección de correo electrónico
          </DialogDescription>
        </DialogHeader>
        <ChangeEmailForm
          currentEmail={currentEmail}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
