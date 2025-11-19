"use client";

import { ReactNode } from "react";
import { useAdminMenu } from "@/contexts/admin-menu-context";
import { Menu } from "lucide-react";

interface EventStickyHeaderProps {
  eventName: string;
  subtitle?: string;
  children?: ReactNode;
}

export function EventStickyHeader({
  eventName,
  subtitle,
  children,
}: EventStickyHeaderProps) {
  const { toggleMobileMenu } = useAdminMenu();

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-3 py-3 sm:px-6 sm:py-4">
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold sm:text-3xl truncate">{eventName}</h1>
            {subtitle && (
              <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 bg-zinc-100 border border-zinc-300 hover:bg-zinc-200 dark:bg-zinc-900 dark:border-zinc-700 dark:hover:bg-zinc-800"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5 text-zinc-900 dark:text-white" />
          </button>
        </div>

        {/* Tabs or additional content */}
        {children}
      </div>
    </div>
  );
}
