"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function ProfileNavigation() {
  const pathname = usePathname();

  const isProfilePage = pathname === "/profile";
  const isAdminPage = pathname?.includes("/administrador");

  return (
    <nav className="sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-0.5 sm:gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          <Link
            href="/profile"
            className={`relative whitespace-nowrap px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
              isProfilePage
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mi Perfil
            {isProfilePage && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </Link>
          <Link
            href={`/profile/administrador`}
            className={`relative whitespace-nowrap px-3 py-2.5 text-xs sm:text-sm font-medium transition-colors flex-shrink-0 ${
              isAdminPage
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="hidden sm:inline">Administrar Eventos</span>
            <span className="sm:hidden">Administrador</span>
            {isAdminPage && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
