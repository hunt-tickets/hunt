"use client";

import { useRef } from "react";
import {
  Heart,
  PartyPopper,
  GraduationCap,
  Music2,
  Tent,
  Store,
  Trophy,
  Theater,
  ChevronLeft,
  ChevronRight,
  X,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
  EVENT_SUBCATEGORIES,
  type EventCategory,
} from "@/constants/event-categories";

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

interface EventCategoryFilterProps {
  selectedCategory: EventCategory | null;
  selectedSubcategory: string | null;
  onCategoryChange: (category: EventCategory | null) => void;
  onSubcategoryChange: (subcategory: string | null) => void;
}

export function EventCategoryFilter({
  selectedCategory,
  selectedSubcategory,
  onCategoryChange,
  onSubcategoryChange,
}: EventCategoryFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const subcategoryScrollRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (categoryKey: EventCategory) => {
    if (selectedCategory === categoryKey) {
      onCategoryChange(null);
      onSubcategoryChange(null);
    } else {
      onCategoryChange(categoryKey);
      onSubcategoryChange(null);
    }
  };

  const handleSubcategoryClick = (subcategory: string) => {
    if (selectedSubcategory === subcategory) {
      onSubcategoryChange(null);
    } else {
      onSubcategoryChange(subcategory);
    }
  };

  const clearFilters = () => {
    onCategoryChange(null);
    onSubcategoryChange(null);
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

  // Si hay una categoría seleccionada, mostrar layout colapsado
  if (selectedCategory) {
    const SelectedIcon = CATEGORY_ICONS[selectedCategory];
    const subcategories = EVENT_SUBCATEGORIES[selectedCategory];

    return (
      <div className="flex items-center gap-2">
        {/* Categoría seleccionada */}
        <button
          onClick={() => handleCategoryClick(selectedCategory)}
          className="flex-shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-full bg-gray-100 dark:bg-white/10 text-foreground border border-gray-200 dark:border-white/20"
        >
          <SelectedIcon className="h-4 w-4" aria-hidden="true" />
          <span>{EVENT_CATEGORY_LABELS[selectedCategory]}</span>
        </button>

        {/* Botón limpiar */}
        <button
          onClick={clearFilters}
          className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-500/30 hover:bg-red-100 dark:hover:bg-red-500/30 transition-all"
          aria-label="Limpiar filtros"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Separador */}
        <div className="w-px h-6 bg-gray-200 dark:bg-white/20 flex-shrink-0" />

        {/* Subcategorías carousel */}
        <div className="relative group/sub flex-1 min-w-0">
          <button
            onClick={() => scroll(subcategoryScrollRef, "left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/20 shadow-md opacity-0 group-hover/sub:opacity-100 transition-opacity hidden sm:flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-700"
            aria-label="Scroll izquierda subcategorías"
          >
            <ChevronLeft className="h-3.5 w-3.5 text-gray-600 dark:text-white/70" />
          </button>

          <div
            ref={subcategoryScrollRef}
            className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-0 sm:px-5"
          >
            {subcategories.map((subcategory) => {
              const isActive = selectedSubcategory === subcategory;
              return (
                <button
                  key={subcategory}
                  onClick={() => handleSubcategoryClick(subcategory)}
                  className={cn(
                    "flex items-center px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap",
                    isActive
                      ? "bg-gray-100 dark:bg-white/10 text-foreground border border-gray-200 dark:border-white/20"
                      : "text-gray-600 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
                  )}
                >
                  {subcategory}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scroll(subcategoryScrollRef, "right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/20 shadow-md opacity-0 group-hover/sub:opacity-100 transition-opacity hidden sm:flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-700"
            aria-label="Scroll derecha subcategorías"
          >
            <ChevronRight className="h-3.5 w-3.5 text-gray-600 dark:text-white/70" />
          </button>
        </div>
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
          {EVENT_CATEGORIES.map((categoryKey) => {
            const Icon = CATEGORY_ICONS[categoryKey];
            const label = EVENT_CATEGORY_LABELS[categoryKey];
            return (
              <button
                key={categoryKey}
                role="tab"
                aria-selected={false}
                onClick={() => handleCategoryClick(categoryKey)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap text-gray-600 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
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

// Re-export types for convenience
export type { EventCategory };
