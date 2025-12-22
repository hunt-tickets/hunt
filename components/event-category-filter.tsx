"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";

// Definición de categorías y subcategorías
export const EVENT_CATEGORIES = {
  wellness: {
    label: "Wellness",
    icon: "🧘",
    subcategories: ["Yoga", "Meditación", "Spa", "Retiros", "Bienestar Mental", "Fitness"],
  },
  parties: {
    label: "Parties",
    icon: "🎉",
    subcategories: ["Electrónica", "Reggaeton", "Hip-Hop", "Techno", "House", "Latina"],
  },
  clases: {
    label: "Clases",
    icon: "📚",
    subcategories: ["Cocina", "Arte", "Música", "Baile", "Idiomas", "Fotografía"],
  },
  concerts: {
    label: "Concerts",
    icon: "🎸",
    subcategories: ["Rock", "Pop", "Jazz", "Clásica", "Indie", "Urbana"],
  },
  festivals: {
    label: "Festivals",
    icon: "🎪",
    subcategories: ["Música", "Gastronomía", "Cultura", "Cine", "Arte", "Cerveza"],
  },
  ferias: {
    label: "Ferias",
    icon: "🏪",
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
  const handleCategoryClick = (categoryKey: CategoryKey) => {
    if (selectedCategory === categoryKey) {
      // Si la categoría ya está seleccionada, la deseleccionamos
      onCategoryChange(null);
      onSubcategoryChange(null);
    } else {
      // Seleccionamos la nueva categoría
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

  const categories = Object.entries(EVENT_CATEGORIES) as [CategoryKey, typeof EVENT_CATEGORIES[CategoryKey]][];

  return (
    <div className="space-y-3">
      {/* Categorías principales */}
      <div className="flex flex-wrap gap-2">
        {categories.map(([key, category]) => (
          <button
            key={key}
            onClick={() => handleCategoryClick(key)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full text-sm font-medium transition-all duration-200",
              selectedCategory === key
                ? "bg-white text-zinc-900 shadow-lg shadow-white/20"
                : "bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:border-white/30"
            )}
          >
            <span className="text-base">{category.icon}</span>
            <span>{category.label}</span>
          </button>
        ))}

        {/* Botón para limpiar filtros */}
        {(selectedCategory || selectedSubcategory) && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all duration-200"
          >
            <X className="h-3.5 w-3.5" />
            <span>Limpiar</span>
          </button>
        )}
      </div>

      {/* Subcategorías - se muestran cuando hay una categoría seleccionada */}
      {selectedCategory && (
        <div className="flex flex-wrap gap-2 pl-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <span className="text-white/50 text-sm py-2">Subcategorías:</span>
          {EVENT_CATEGORIES[selectedCategory].subcategories.map((subcategory) => (
            <button
              key={subcategory}
              onClick={() => handleSubcategoryClick(subcategory)}
              className={cn(
                "inline-flex items-center px-3 py-1.5 rounded-full text-sm transition-all duration-200",
                selectedSubcategory === subcategory
                  ? "bg-white/90 text-zinc-900 font-medium"
                  : "bg-white/5 text-white/80 border border-white/10 hover:bg-white/10 hover:border-white/20"
              )}
            >
              {subcategory}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
