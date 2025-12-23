"use client";

import { useRef } from "react";
import {
  Heart,
  PartyPopper,
  GraduationCap,
  Music2,
  Tent,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Definición de categorías y subcategorías con iconos de Lucide
export const EVENT_CATEGORIES = {
  wellness: {
    label: "Wellness",
    icon: Heart,
    subcategories: ["Yoga", "Meditación", "Spa", "Retiros", "Bienestar Mental", "Fitness"],
  },
  parties: {
    label: "Parties",
    icon: PartyPopper,
    subcategories: ["Electrónica", "Reggaeton", "Hip-Hop", "Techno", "House", "Latina"],
  },
  clases: {
    label: "Clases",
    icon: GraduationCap,
    subcategories: ["Cocina", "Arte", "Música", "Baile", "Idiomas", "Fotografía"],
  },
  concerts: {
    label: "Concerts",
    icon: Music2,
    subcategories: ["Rock", "Pop", "Jazz", "Clásica", "Indie", "Urbana"],
  },
  festivals: {
    label: "Festivals",
    icon: Tent,
    subcategories: ["Música", "Gastronomía", "Cultura", "Cine", "Arte", "Cerveza"],
  },
  ferias: {
    label: "Ferias",
    icon: Store,
    subcategories: ["Artesanía", "Emprendedores", "Gastronómica", "Navideña", "Vintage", "Libros"],
  },
} as const;

export type CategoryKey = keyof typeof EVENT_CATEGORIES;

interface EventCategoryFilterProps {
  selectedCategory: CategoryKey | null;
  selectedSubcategory: string | null;
  onCategoryChange: (category: CategoryKey | null) => void;
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

  const handleCategoryClick = (categoryKey: CategoryKey) => {
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
            {EVENT_CATEGORIES[selectedCategory].subcategories.map((subcategory) => {
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
