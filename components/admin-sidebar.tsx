"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Settings, ArrowLeft, UserCircle, Tag, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAdminMenu } from "@/contexts/admin-menu-context";

interface AdminSidebarProps {
  userId: string;
}

const primaryMenuItems = [
  {
    title: "Eventos",
    icon: Calendar,
    href: "/administrador",
    description: "Crea y gestiona eventos",
    exact: false, // Will match /administrador/event/[id] too
  },
  {
    title: "Marcas",
    icon: Tag,
    href: "/administrador/marcas",
    description: "Gestiona productores y marcas",
    exact: true,
  },
  {
    title: "Referidos",
    icon: Gift,
    href: "/administrador/referidos",
    description: "Programa de referidos y comisiones",
    exact: true,
  },
];

const adminMenuItems = [
  {
    title: "Usuarios",
    icon: UserCircle,
    href: "/administrador/usuarios",
    description: "Listado completo de usuarios",
    exact: true,
  },
  {
    title: "Configuración",
    icon: Settings,
    href: "/administrador/configuracion",
    description: "Ajustes del sistema",
    exact: true,
  },
];

export function AdminSidebar({ userId }: AdminSidebarProps) {
  const pathname = usePathname();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useAdminMenu();

  return (
    <>
      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-[#202020] border-r border-[#2a2a2a] z-50 transition-transform duration-300 lg:translate-x-0 flex-shrink-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo/Brand */}
          <div className="mb-8 px-3">
            <div className="text-xl font-bold text-white" style={{ fontFamily: "LOT, sans-serif" }}>
              HUNT
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {/* Primary Menu Items */}
            {primaryMenuItems.map((item) => {
              const Icon = item.icon;
              const fullHref = `/profile/${userId}${item.href}`;

              // Check if current route matches this menu item
              let isActive = false;
              if (item.exact) {
                isActive = pathname === fullHref;
              } else {
                // For non-exact matches (like /administrador which should also match /administrador/event/[id])
                if (item.href === "/administrador") {
                  isActive = pathname.includes("/administrador") && !pathname.includes("/configuracion") && !pathname.includes("/usuarios") && !pathname.includes("/marcas") && !pathname.includes("/referidos");
                } else {
                  isActive = pathname.includes(item.href);
                }
              }

              return (
                <Link
                  key={item.href}
                  href={fullHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-full transition-all text-sm font-medium",
                    isActive
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div>{item.title}</div>
                </Link>
              );
            })}

            {/* Separator with "Administrador" label */}
            <div className="py-4">
              <div className="px-3 mb-2">
                <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Administrador
                </span>
              </div>
              <div className="border-t border-white/10" />
            </div>

            {/* Admin Menu Items */}
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const fullHref = `/profile/${userId}${item.href}`;

              // Check if current route matches this menu item
              let isActive = false;
              if (item.exact) {
                isActive = pathname === fullHref;
              } else {
                isActive = pathname.includes(item.href);
              }

              return (
                <Link
                  key={item.href}
                  href={fullHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-full transition-all text-sm font-medium",
                    isActive
                      ? "bg-white/10 text-white border border-white/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div>{item.title}</div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-[#2a2a2a] space-y-1">
            <ThemeToggle />
            <Link
              href={`/profile/${userId}`}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
