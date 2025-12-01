"use client";

import React, { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";

interface BirthDateManagerProps {
  birthDate?: Date | string | null;
}

export function BirthDateManager({ birthDate }: BirthDateManagerProps) {
  const existingDate = birthDate ? (birthDate instanceof Date ? birthDate : new Date(birthDate)) : null;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(existingDate || undefined);
  const [month, setMonth] = useState<Date>(selected || new Date(2000, 0, 1));

  const formatDisplayDate = (date: Date) => {
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  // Generate years (1900 to current year - 13 for minimum age)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 - 13 }, (_, i) => 1900 + i);

  const handleSelect = (date: Date | undefined) => {
    setSelected(date);
    setOpen(false);
    // Aquí puedes agregar la lógica para guardar en la BD
  };

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year);
    const newDate = new Date(month);
    newDate.setFullYear(newYear);
    setMonth(newDate);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center justify-between p-4 rounded-xl border border-[#2a2a2a] bg-[#1a1a1a] min-h-[72px] hover:border-[#3a3a3a] hover:bg-[#202020] transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 flex-1">
            <CalendarIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <span className={cn("text-sm font-medium", !selected && "text-gray-500")}>
              {selected ? formatDisplayDate(selected) : "Agregar fecha de nacimiento"}
            </span>
          </div>
          {selected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Aquí puedes agregar opciones adicionales
              }}
              className="text-gray-400 hover:text-gray-300 invisible group-hover:visible transition-all"
            >
              <span className="text-xl">⋯</span>
            </button>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-3 space-y-3 w-auto bg-[#1a1a1a] border-[#2a2a2a]">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          disabled={(date) => date > new Date() || date < new Date(1900, 0, 1)}
          className="rounded-lg border border-[#2a2a2a] bg-[#0a0a0a]"
          classNames={{
            day_button: cn(
              "hover:bg-[#2a2a2a] data-[selected]:bg-primary data-[selected]:text-primary-foreground",
              "data-[disabled]:text-gray-600 data-[disabled]:cursor-not-allowed"
            ),
            months: "flex flex-col sm:flex-row gap-4",
            month: "w-full",
            month_caption: "relative flex h-12 items-center justify-center mb-2",
            caption_label: "text-sm font-medium capitalize",
            nav: "flex gap-1 absolute left-0 right-0 top-0 justify-between items-center px-1 py-1.5",
            button_previous: "size-9 text-gray-400 hover:text-gray-300 hover:bg-[#2a2a2a] rounded-lg transition-colors flex items-center justify-center",
            button_next: "size-9 text-gray-400 hover:text-gray-300 hover:bg-[#2a2a2a] rounded-lg transition-colors flex items-center justify-center",
            weekday: "size-9 p-0 text-xs font-medium text-gray-500",
            day: "group size-9 px-0 text-sm",
            today: "*:after:bg-primary",
          }}
          components={{
            CaptionLabel: ({ children }) => (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium capitalize">{children}</span>
                <Select
                  value={String(month.getFullYear())}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="h-7 w-[80px] text-xs bg-[#0a0a0a] border-[#2a2a2a] hover:border-[#3a3a3a]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 bg-[#1a1a1a] border-[#2a2a2a]">
                    {years.reverse().map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ),
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
