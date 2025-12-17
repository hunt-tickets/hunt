"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Calendar,
  Settings,
  ArrowLeft,
  UserCircle,
  Gift,
  Puzzle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAdminMenu } from "@/contexts/admin-menu-context";
import { OrganizationSelector } from "@/components/organization-selector";
import { SidebarUserMenu } from "@/components/sidebar-user-menu";
import { authClient } from "@/lib/auth-client";
import { Member } from "@/lib/schema";
import { useEffect, useState } from "react";

type Role = "owner" | "administrator" | "seller";

interface AdminSidebarProps {
  userId: string;
  organizationId: string;
}

interface MenuItem {
  title: string;
  icon: typeof Calendar;
  href: string;
  description: string;
  exact: boolean;
  roles: Role[]; // Which roles can see this item
}

const primaryMenuItems: MenuItem[] = [
  {
    title: "Eventos",
    icon: Calendar,
    href: "/administrador/eventos",
    description: "Crea y gestiona eventos",
    exact: false,
    roles: ["owner", "administrator", "seller"], // Everyone can see events
  },
  {
    title: "Mis Ventas",
    icon: Calendar, // You may want a different icon
    href: "/administrador/mis-ventas",
    description: "Historial de ventas",
    exact: true,
    roles: ["seller"], // Only sellers see this
  },
  {
    title: "Usuarios",
    icon: UserCircle,
    href: "/administrador/usuarios",
    description: "Listado completo de usuarios",
    exact: true,
    roles: ["owner", "administrator"], // Sellers cannot access
  },
  {
    title: "Recompensas",
    icon: Gift,
    href: "/administrador/referidos",
    description: "Programa de referidos y rebate",
    exact: true,
    roles: ["owner", "administrator"], // Sellers cannot access
  },
  {
    title: "Integraciones",
    icon: Puzzle,
    href: "/administrador/integraciones",
    description: "Conecta servicios externos",
    exact: true,
    roles: ["owner", "administrator"], // Sellers cannot access
  },
  {
    title: "Configuración",
    icon: Settings,
    href: "/administrador/configuracion",
    description: "Ajustes del sistema",
    exact: true,
    roles: ["owner", "administrator"], // Sellers cannot access
  },
];

type OrganizationData = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date | string;
};

export function AdminSidebar({ userId, organizationId }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobileMenuOpen, setIsMobileMenuOpen } = useAdminMenu();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  // Fetch all sidebar data client-side
  const { data: organizationsData } = authClient.useListOrganizations();

  // Handle potential nesting - organizations might be in data.organizations or just data
  const organizations: OrganizationData[] = (() => {
    if (!organizationsData) return [];
    if (Array.isArray(organizationsData)) return organizationsData;
    if (
      typeof organizationsData === "object" &&
      "organizations" in organizationsData
    ) {
      return (organizationsData as { organizations: OrganizationData[] })
        .organizations;
    }
    return [];
  })();

  useEffect(() => {
    const fetchMembers = async () => {
      setIsLoadingRole(true);
      try {
        const { data, error } = await authClient.organization.listMembers({
          query: { organizationId },
        });
        if (data && !error) {
          // Handle potential nesting - data might be array or object with members
          const membersArray = Array.isArray(data)
            ? data
            : (data as unknown as { members?: unknown[] })?.members || [];
          setMembers(membersArray as Member[]);
        }
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setIsLoadingRole(false);
      }
    };

    fetchMembers();
  }, [organizationId]);

  // Find current user's role from members list
  const currentUserMember = members?.find((m: Member) => m.userId === userId);
  const role: Role = (currentUserMember?.role as Role) || "seller";

  // Filter menu items based on role
  const visibleMenuItems = primaryMenuItems.filter((item) =>
    item.roles.includes(role)
  );

  // Handle organization switch - navigate to the new organization's events page
  const handleOrganizationChange = (newOrgId: string) => {
    if (newOrgId !== organizationId) {
      router.push(`/profile/${userId}/organizaciones/${newOrgId}/administrador/eventos`);
    }
  };

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
              <div
                className="text-xl font-bold text-foreground"
                style={{ fontFamily: "LOT, sans-serif" }}
              >
                HUNT
              </div>
            </Link>
          </div>

          {/* Organization Selector */}
          {organizations && organizations.length > 0 && (
            <div className="mb-6">
              <OrganizationSelector
                organizations={organizations}
                selectedOrgId={organizationId}
                onSelectOrganization={handleOrganizationChange}
              />
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {/* Loading skeleton while fetching role */}
            {isLoadingRole ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-2 rounded-full"
                  >
                    <div className="h-4 w-4 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-white/10 animate-pulse" />
                  </div>
                ))}
              </>
            ) : (
              /* Primary Menu Items */
              visibleMenuItems.map((item) => {
                const Icon = item.icon;
                const fullHref = `/profile/${userId}/organizaciones/${organizationId}${item.href}`;

                // Check if current route matches this menu item
                let isActive = false;
                if (item.exact) {
                  isActive = pathname === fullHref;
                } else {
                  // For non-exact matches (like /administrador/eventos which should also match /administrador/event/[id])
                  if (item.href === "/administrador/eventos") {
                    isActive =
                      pathname.includes("/administrador/eventos") ||
                      (pathname.includes("/administrador/event/") &&
                        !pathname.includes("/configuracion"));
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
              })
            )}
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
