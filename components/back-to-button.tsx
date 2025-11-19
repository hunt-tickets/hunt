"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

// interface BackToButtonProps {
//   route?: string;
// }

export function BackToButton() {
  const router = useRouter();
  // const pathName = usePathname();

  // const isAdminEventPage = pathName.includes("administrador") && pathName.includes("event");
  // const isAdminPage = pathName.includes("administrador");

  // const buttonText = isAdminEventPage
  //   ? "Volver a Eventos"
  //   : isAdminPage
  //   ? "Volver a mi Perfil"
  //   : "Volver";

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => router.back()}
      className="gap-2"
    >
      <ArrowLeft className="h-4 w-4" />
      {/* <span className="hidden sm:inline">{buttonText}</span> */}
      <span className="sm:hidden">Volver</span>
    </Button>
  );
}
