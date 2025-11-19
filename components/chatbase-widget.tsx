"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ChatbaseWidget() {
  const pathname = usePathname();
  const isAdminRoute = pathname?.includes("/administrador");

  useEffect(() => {
    // Hide chatbase widget on admin routes
    const chatbaseElement = document.querySelector("#chatbase-bubble-button");
    if (chatbaseElement) {
      (chatbaseElement as HTMLElement).style.display = isAdminRoute ? "none" : "block";
    }
  }, [isAdminRoute]);

  return null;
}
