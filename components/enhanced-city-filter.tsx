"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface EnhancedCityFilterProps {
  cities: string[];
  selectedCity: string | null;
  onCityChange: (city: string | null) => void;
}

export function EnhancedCityFilter({ cities, selectedCity, onCityChange }: EnhancedCityFilterProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Select
      value={selectedCity || "all"}
      onValueChange={(value) => onCityChange(value === "all" ? null : value)}
    >
      {/* Mobile: Circle button with icon only */}
      {/* Desktop: Full width with text */}
      <SelectTrigger
        className={`
          /* Mobile: circle button - same height as search bar */
          w-12 h-12 p-0 rounded-full
          /* Desktop: full width with padding */
          sm:w-64 lg:w-72 sm:!h-12 sm:pl-4 sm:pr-4 sm:py-0 sm:rounded-3xl
          /* Common styles */
          bg-gray-50 dark:bg-white/10 border text-base text-gray-900 dark:text-white
          data-[placeholder]:text-gray-400 dark:data-[placeholder]:text-white/50
          focus-visible:ring-2 focus-visible:ring-gray-300 dark:focus-visible:ring-white/20
          focus-visible:ring-offset-0 transition-all duration-200
          flex items-center justify-center sm:justify-start
          ${
            isFocused
              ? 'border-gray-300 dark:border-white/40 bg-white dark:bg-white/15'
              : selectedCity
                ? 'border-gray-300 dark:border-white/30 bg-gray-100 dark:bg-white/15'
                : 'border-gray-200 dark:border-white/20 hover:border-gray-300 dark:hover:border-white/30 hover:bg-gray-100 dark:hover:bg-white/12'
          }
        `}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        {/* Mobile: Icon only */}
        <MapPin className={`h-5 w-5 sm:hidden transition-colors duration-200 ${
          selectedCity ? 'text-gray-700 dark:text-white' : 'text-gray-400 dark:text-white/50'
        }`} />

        {/* Desktop: Icon + Text */}
        <div className="hidden sm:flex items-center gap-2">
          <MapPin className={`h-5 w-5 transition-colors duration-200 ${
            isFocused ? 'text-gray-700 dark:text-white/80' : 'text-gray-400 dark:text-white/50'
          }`} />
          <SelectValue placeholder="Todas las ciudades" />
        </div>
      </SelectTrigger>

      <SelectContent className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl text-gray-900 dark:text-white text-base shadow-xl">
        <SelectItem
          value="all"
          className="cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 focus:bg-gray-100 dark:focus:bg-zinc-800 text-base"
        >
          Todas las ciudades
        </SelectItem>

        {cities.map((city) => (
          <SelectItem
            key={city}
            value={city}
            className="cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 focus:bg-gray-100 dark:focus:bg-zinc-800 text-base"
          >
            {city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
