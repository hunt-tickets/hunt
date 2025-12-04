"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Settings, ArrowLeft, UserCircle, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAdminMenu } from "@/contexts/admin-menu-context";
import { OrganizationSelector } from "@/components/organization-selector";
import { SidebarUserMenu } from "@/components/sidebar-user-menu";

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date;
}

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
}

interface AdminSidebarProps {
  userId: string;
  organizationId: string;
  role: "owner" | "administrator" | "seller";
  organizations: Organization[];
  user: UserData | null;
}

const primaryMenuItems = [
  {
    title: "Eventos",
    icon: Calendar,
    href: "/administrador/eventos",
    description: "Crea y gestiona eventos",
    exact: false, // Will match /administrador/event/[id] too
  },
  {
    title: "Recompensas",
    icon: Gift,
    href: "/administrador/referidos",
    description: "Programa de referidos y rebate",
    exact: true,
  },
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

export function AdminSidebar({ userId, organizationId, organizations, user }: AdminSidebarProps) {
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
          "fixed top-0 left-0 h-screen w-64 bg-white dark:bg-[#202020] border-r border-gray-200 dark:border-[#2a2a2a] z-50 transition-transform duration-300 lg:translate-x-0 flex-shrink-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Logo/Brand with Back Button */}
          <div className="mb-6 px-3">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400 dark:text-gray-400" />
              <div className="text-xl font-bold text-foreground" style={{ fontFamily: "LOT, sans-serif" }}>
                HUNT
              </div>
            </Link>
          </div>

          {/* Organization Selector */}
          {organizations.length > 0 && (
            <div className="mb-6">
              <OrganizationSelector organizations={organizations} />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {/* Primary Menu Items */}
            {primaryMenuItems.map((item) => {
              const Icon = item.icon;
              const fullHref = `/profile/${userId}/organizaciones/${organizationId}${item.href}`;

              // Check if current route matches this menu item
              let isActive = false;
              if (item.exact) {
                isActive = pathname === fullHref;
              } else {
                // For non-exact matches (like /administrador/eventos which should also match /administrador/event/[id])
                if (item.href === "/administrador/eventos") {
                  isActive = pathname.includes("/administrador/eventos") || (pathname.includes("/administrador/event/") && !pathname.includes("/configuracion"));
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
                      ? "bg-gray-100 dark:bg-white/10 text-foreground border border-gray-200 dark:border-white/20"
                      : "text-gray-600 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <div>{item.title}</div>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-200 dark:border-[#2a2a2a] space-y-3">
            <ThemeToggle />

            {/* User Menu */}
            <SidebarUserMenu
              user={user}
              userId={userId}
              onMenuClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
