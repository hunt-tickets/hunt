"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, TrendingUp, TrendingDown, FileText, Receipt, CreditCard, ArrowLeft, Menu, X, List } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

interface AccountingSidebarProps {
  userId: string;
}

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "",
    description: "Resumen financiero general",
  },
  {
    title: "Ingresos",
    icon: TrendingUp,
    href: "/ingresos",
    description: "Gestión de ingresos",
  },
  {
    title: "Gastos",
    icon: TrendingDown,
    href: "/gastos",
    description: "Gestión de gastos",
  },
  {
    title: "Facturas",
    icon: Receipt,
    href: "/facturas",
    description: "Facturas emitidas y recibidas",
  },
  {
    title: "Cuentas por Cobrar",
    icon: CreditCard,
    href: "/cuentas-por-cobrar",
    description: "Pagos pendientes",
  },
  {
    title: "Transacciones",
    icon: List,
    href: "/transacciones",
    description: "Historial completo",
  },
  {
    title: "Reportes",
    icon: FileText,
    href: "/reportes",
    description: "Reportes contables",
  },
];

export function AccountingSidebar({ userId }: AccountingSidebarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-full bg-[#202020] border border-[#303030] hover:bg-[#2a2a2a] transition-colors"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <Menu className="h-5 w-5" />
        )}
      </button>

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
          "fixed top-0 left-0 h-screen w-64 bg-[#202020] border-r border-[#2a2a2a] z-40 transition-transform duration-300 lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full p-6">
          {/* Header */}
          <div className="mb-8 px-3">
            <div className="text-xl font-bold text-white mb-1" style={{ fontFamily: "LOT, sans-serif" }}>
              Contabilidad
            </div>
            <p className="text-xs text-white/40">Gestión Financiera</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const fullHref = `/profile/${userId}/administrador/contabilidad${item.href}`;
              const isActive = pathname === fullHref;

              return (
                <Link
                  key={item.href}
                  href={fullHref}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex flex-col gap-1 px-3 py-3 rounded-lg transition-all duration-200 text-sm group",
                    isActive
                      ? "bg-primary/10 text-white border-l-2 border-primary"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn(
                      "h-4 w-4 flex-shrink-0 transition-transform",
                      isActive && "scale-110"
                    )} />
                    <span className="font-medium">{item.title}</span>
                  </div>
                  <span className="text-xs text-white/30 ml-7">{item.description}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="pt-4 border-t border-[#2a2a2a] space-y-1">
            <ThemeToggle />
            <Link
              href={`/profile/${userId}/administrador`}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Admin
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
