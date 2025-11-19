"use client";

import { MapPin } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CityFilterProps {
  // List of unique cities from events
  cities: string[];
  // Currently selected city
  selectedCity: string | null;
  // Callback when city changes
  onCityChange: (city: string | null) => void;
}

export function CityFilter({ cities, selectedCity, onCityChange }: CityFilterProps) {
  return (
    <div className="w-full h-full group">
      <Select
        value={selectedCity || "all"}
        onValueChange={(value) => onCityChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full h-full bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/15 backdrop-blur-md rounded-[24px] text-white data-[placeholder]:text-white/50 focus:border-white/40 focus:ring-0 focus:ring-offset-0 hover:border-white/25 hover:bg-white/12 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] data-[state=open]:border-white/40 data-[state=open]:bg-white/15 data-[state=open]:shadow-[0_8px_40px_rgb(255,255,255,0.08)]">
          <div className="flex items-center gap-3 px-2">
            <MapPin className="h-5 w-5 text-white/50 group-hover:text-white/70 transition-colors duration-200" />
            <SelectValue placeholder="Todas las ciudades" />
          </div>
        </SelectTrigger>
        <SelectContent className="bg-gradient-to-b from-gray-900/95 to-black/95 backdrop-blur-xl border-2 border-white/20 rounded-[20px] text-white shadow-[0_20px_70px_rgb(0,0,0,0.3)] min-w-[200px] overflow-hidden">
          <SelectItem
            value="all"
            className="cursor-pointer hover:bg-white/10 focus:bg-white/15 transition-colors duration-200 rounded-lg mx-1 my-0.5"
          >
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-white/60" />
              Todas las ciudades
            </span>
          </SelectItem>
          {cities.map((city) => (
            <SelectItem
              key={city}
              value={city}
              className="cursor-pointer hover:bg-white/10 focus:bg-white/15 transition-colors duration-200 rounded-lg mx-1 my-0.5"
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white/60" />
                {city}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
