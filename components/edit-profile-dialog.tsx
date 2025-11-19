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
import { EditProfileForm } from "./edit-profile-form";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface EditProfileDialogProps {
  profile: {
    name?: string | null;
    lastName?: string | null;
    phone?: string | null;
    birthdate?: string | null;
    gender?: string | null;
    prefix?: string | null;
    document_id?: string | null;
  };
}

export function EditProfileDialog({ profile }: EditProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    // Close dialog and refresh after successful update
    setOpen(false);
    router.refresh();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="gap-2">
          <Edit className="h-4 w-4" />
          <span className="hidden sm:inline">Editar Perfil</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md max-h-[75vh] sm:max-h-[85vh] overflow-y-auto overflow-x-hidden p-5 sm:p-6">
        <DialogHeader className="space-y-1.5 pb-3">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            Editar Perfil
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
            Actualiza tu información personal
          </DialogDescription>
        </DialogHeader>
        <EditProfileForm profile={profile} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
