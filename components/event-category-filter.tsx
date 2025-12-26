"use client";

import { useRef } from "react";
import {
  Music2,
  Trophy,
  PartyPopper,
  Heart,
  GraduationCap,
  Store,
  Tent,
  Theater,
  ChevronLeft,
  ChevronRight,
  X,
  LucideIcon,
} from "lucide-react";
import { EVENT_CATEGORIES as CATEGORIES, EVENT_CATEGORY_LABELS, EventCategory } from "@/constants/event-categories";

// Mapeo de categorías a iconos
const CATEGORY_ICONS: Record<EventCategory, LucideIcon> = {
  fiestas: PartyPopper,
  conciertos: Music2,
  festivales: Tent,
  bienestar: Heart,
  clases: GraduationCap,
  ferias: Store,
  deportes: Trophy,
  teatro: Theater,
};

// Construir EVENT_CATEGORIES con labels del archivo de constantes
export const EVENT_CATEGORIES = Object.fromEntries(
  CATEGORIES.map((key) => [
    key,
    {
      label: EVENT_CATEGORY_LABELS[key],
      icon: CATEGORY_ICONS[key],
    },
  ])
) as Record<EventCategory, { label: string; icon: LucideIcon }>;

export type CategoryKey = keyof typeof EVENT_CATEGORIES;

interface EventCategoryFilterProps {
  selectedCategory: CategoryKey | null;
  onCategoryChange: (category: CategoryKey | null) => void;
}

export function EventCategoryFilter({
  selectedCategory,
  onCategoryChange,
}: EventCategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (categoryKey: CategoryKey) => {
    if (selectedCategory === categoryKey) {
      onCategoryChange(null);
    } else {
      onCategoryChange(categoryKey);
    }
  };

  const clearFilters = () => {
    onCategoryChange(null);
  };

  const scroll = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const scrollAmount = 200;
      ref.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const categories = Object.entries(EVENT_CATEGORIES) as [CategoryKey, typeof EVENT_CATEGORIES[CategoryKey]][];

  // Si hay una categoría seleccionada, mostrar layout colapsado
  if (selectedCategory) {
    const SelectedIcon = EVENT_CATEGORIES[selectedCategory].icon;

    return (
      <div className="flex items-center gap-2">
        {/* Categoría seleccionada */}
        <button
          onClick={() => handleCategoryClick(selectedCategory)}
          className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-full bg-gray-100 dark:bg-white/10 text-foreground border border-gray-200 dark:border-white/20"
        >
          <SelectedIcon className="h-4 w-4" aria-hidden="true" />
          <span>{EVENT_CATEGORIES[selectedCategory].label}</span>
        </button>

        {/* Botón limpiar */}
        <button
          onClick={clearFilters}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/30 transition-all"
          aria-label="Limpiar filtros"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // Sin categoría seleccionada - mostrar carrusel completo
  return (
    <div className="flex items-center gap-2">
      <div className="relative group/scroll flex-1 min-w-0">
        <button
          onClick={() => scroll(scrollContainerRef, "left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/20 shadow-md opacity-0 group-hover/scroll:opacity-100 transition-opacity hidden sm:flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-700"
          aria-label="Scroll izquierda"
        >
          <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-white/70" />
        </button>

        <div
          ref={scrollContainerRef}
          role="tablist"
          aria-label="Categorías de eventos"
          className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-0 sm:px-6"
        >
          {categories.map(([key, category]) => {
            const Icon = category.icon;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={false}
                onClick={() => handleCategoryClick(key)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap text-gray-600 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => scroll(scrollContainerRef, "right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/20 shadow-md opacity-0 group-hover/scroll:opacity-100 transition-opacity hidden sm:flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-700"
          aria-label="Scroll derecha"
        >
          <ChevronRight className="h-4 w-4 text-gray-600 dark:text-white/70" />
        </button>
      </div>
    </div>
  );
}
