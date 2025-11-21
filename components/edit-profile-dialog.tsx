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
  user: {
    name: string;
    email: string;
    phoneNumber?: string | null;
  };
}

export function EditProfileDialog({ user }: EditProfileDialogProps) {
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
        <Button variant="outline" className="gap-2">
          Update profile
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
        <EditProfileForm user={user} onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}
