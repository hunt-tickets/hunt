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
import { InviteMemberForm } from "./invite-member-form";
import { Mail } from "lucide-react";

interface InviteMemberDialogProps {
  organizationId: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function InviteMemberDialog({
  organizationId,
  size = "sm",
}: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    // Close dialog after successful invitation
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={size}>
          <Mail className="h-4 w-4 mr-2" />
          Invitar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[75vh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden p-5 sm:p-6">
        <DialogHeader className="space-y-1.5 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Invitar Miembro
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Envía una invitación por correo electrónico para unirse a la
            organización
          </DialogDescription>
        </DialogHeader>
        <InviteMemberForm
          organizationId={organizationId}
          onSuccess={handleSuccess}
        />
      </DialogContent>
    </Dialog>
  );
}
