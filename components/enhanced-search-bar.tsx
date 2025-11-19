"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface EnhancedSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function EnhancedSearchBar({ searchQuery, onSearchChange }: EnhancedSearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onSearchChange("");
  };

  return (
    <div className="relative">
      {/* Search Icon */}
      <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10">
        <Search className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
          isFocused ? 'text-white/80' : 'text-white/50'
        }`} />
      </div>

      <Input
        type="text"
        placeholder="Buscar eventos..."
        className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 h-11 sm:h-12 text-base bg-white/10 border rounded-3xl text-white placeholder:text-white/50 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0 transition-all duration-200 ${
          isFocused
            ? 'border-white/40 bg-white/15'
            : 'border-white/20 hover:border-white/30 hover:bg-white/12'
        }`}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {/* Clear button */}
      {searchQuery && (
        <button
          onClick={handleClear}
          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/70 hover:text-white" />
        </button>
      )}
    </div>
  );
}
