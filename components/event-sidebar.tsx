"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Ticket,
  Settings,
  ArrowLeft,
  ScanLine,
  Banknote,
  ShoppingBag,
  CalendarDays,
  Calendar,
  Repeat,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAdminMenu } from "@/contexts/admin-menu-context";
import { SidebarUserMenu } from "@/components/sidebar-user-menu";

type EventType = "single" | "multi_day" | "recurring" | "slots";

const eventTypeConfig: Record<
  EventType,
  { label: string; icon: typeof Calendar }
> = {
  single: { label: "Evento único", icon: Calendar },
  multi_day: { label: "Evento de varios días", icon: CalendarDays },
  recurring: { label: "Evento recurrente", icon: Repeat },
  slots: { label: "Evento por horarios", icon: Clock },
};

interface EventSidebarProps {
  userId: string;
  organizationId: string;
  eventId: string;
  eventName: string;
  eventType?: EventType;
  role?: "owner" | "administrator" | "seller";
}

// Menu items with role requirements
const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "",
    description: "Resumen financiero y estadísticas",
    requiredRoles: ["owner", "administrator"],
  },
  {
    title: "Entradas",
    icon: Ticket,
    href: "/entradas",
    description: "Gestiona tipos de entrada",
    requiredRoles: ["owner", "administrator"],
  },
  {
    title: "Productos",
    icon: ShoppingBag,
    href: "/productos",
    description: "Cupones y productos canjeables",
    requiredRoles: ["owner", "administrator"],
  },
  {
    title: "Vender en Efectivo",
    icon: Banknote,
    href: "/vender",
    description: "Venta en efectivo",
    requiredRoles: ["owner", "administrator", "seller"], // All roles can sell
  },
  {
    title: "Control de Acceso",
    icon: ScanLine,
    href: "/accesos",
    description: "Gestión de códigos QR",
    requiredRoles: ["owner", "administrator"],
  },
  {
    title: "Configuración",
    icon: Settings,
    href: "/configuracion",
    description: "Ajustes del evento",
    requiredRoles: ["owner", "administrator"],
  },
];

export function EventSidebar({
  userId,
  organizationId,
  eventId,
  eventName,
  eventType = "single",
  role = "seller",
  // user,
}: EventSidebarProps) {
  const pathname = usePathname();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useAdminMenu();

  const baseEventPath = `/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}`;
  const backHref =
    role === "seller"
      ? `/profile/${userId}/organizaciones/${organizationId}/administrador/mis-ventas`
      : `/profile/${userId}/organizaciones/${organizationId}/administrador/eventos`;

  // Get event type configuration
  const typeConfig = eventTypeConfig[eventType];
  const TypeIcon = typeConfig.icon;

  // Filter menu items based on role
  const visibleMenuItems = menuItems.filter((item) =>
    item.requiredRoles.includes(role)
  );

  // Add "Días" menu item for multi-day events (insert after "Entradas")
  const menuItemsWithDays =
    eventType === "multi_day"
      ? visibleMenuItems.flatMap((item) =>
          item.href === "/entradas"
            ? [
                item,
                {
                  title: "Días",
                  icon: CalendarDays,
                  href: "/configuracion/dias",
                  description: "Gestiona los días del evento",
                  requiredRoles: ["owner", "administrator"] as const,
                },
              ]
            : [item]
        )
      : visibleMenuItems;

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
              href={backHref}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="h-5 w-5 text-gray-400 dark:text-gray-400" />
              <div
                className="text-xl font-bold text-foreground"
                style={{ fontFamily: "LOT, sans-serif" }}
              >
                HUNT
              </div>
            </Link>
            <div
              className="text-xs text-gray-500 dark:text-white/40 truncate mt-2 ml-8"
              title={eventName}
            >
              {eventName}
            </div>
            {/* Event Type Badge */}
            <div className="mt-2 ml-8 flex items-center gap-1.5">
              <TypeIcon className="h-3 w-3 text-gray-400 dark:text-white/40" />
              <span className="text-[10px] font-medium text-gray-400 dark:text-white/40 uppercase tracking-wide">
                {typeConfig.label}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {menuItemsWithDays.map((item) => {
              const Icon = item.icon;
              const fullHref = `${baseEventPath}${item.href}`;
              // Use exact matching only - avoid false positives from nested routes
              const isActive = pathname === fullHref;

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
              userId={userId}
              onMenuClose={() => setIsMobileMenuOpen(false)}
            />
          </div>
        </div>
      </aside>
    </>
  );
}
