"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  // Current search query
  searchQuery: string;
  // Callback when search changes
  onSearchChange: (query: string) => void;
}

export function SearchBar({ searchQuery, onSearchChange }: SearchBarProps) {
  const handleClear = () => {
    onSearchChange("");
  };

  return (
    <div className="relative h-full group">
      {/* Search Icon with animation */}
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50 group-focus-within:text-white/80 transition-colors duration-200" />

      <Input
        type="search"
        placeholder="Buscar eventos, lugares..."
        className="pl-12 pr-12 h-full text-base bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/15 backdrop-blur-md rounded-[24px] text-white placeholder:text-white/50 focus-visible:border-white/40 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:bg-white/15 hover:border-white/25 hover:bg-white/12 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] focus-visible:shadow-[0_8px_40px_rgb(255,255,255,0.08)]"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Clear button - only show when there's text */}
      {searchQuery && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4 text-white/70" />
        </button>
      )}
    </div>
  );
}
