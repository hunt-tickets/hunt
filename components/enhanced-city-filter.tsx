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
      <SelectTrigger
        className={`w-full !h-11 sm:!h-12 pl-3 sm:pl-4 pr-3 sm:pr-4 py-0 bg-white/10 border rounded-3xl text-base text-white data-[placeholder]:text-white/50 focus-visible:ring-2 focus-visible:ring-white/20 focus-visible:ring-offset-0 transition-all duration-200 ${
          isFocused
            ? 'border-white/40 bg-white/15'
            : 'border-white/20 hover:border-white/30 hover:bg-white/12'
        }`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <MapPin className={`h-4 w-4 sm:h-5 sm:w-5 transition-colors duration-200 ${
            isFocused ? 'text-white/80' : 'text-white/50'
          }`} />
          <SelectValue placeholder="Todas las ciudades" />
        </div>
      </SelectTrigger>

        <SelectContent className="bg-white border border-zinc-200 rounded-2xl text-zinc-900 text-base shadow-xl">
          <SelectItem
            value="all"
            className="cursor-pointer hover:bg-zinc-100 focus:bg-zinc-100 text-base"
          >
            Todas las ciudades
          </SelectItem>

          {cities.map((city) => (
            <SelectItem
              key={city}
              value={city}
              className="cursor-pointer hover:bg-zinc-100 focus:bg-zinc-100 text-base"
            >
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
  );
}
