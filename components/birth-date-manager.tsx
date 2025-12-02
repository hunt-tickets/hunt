"use client";

import React, { useState } from "react";
import { CalendarIcon, Edit2, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BirthDateManagerProps {
  birthDate?: Date | string | null;
}

export function BirthDateManager({ birthDate }: BirthDateManagerProps) {
  const existingDate = birthDate ? (birthDate instanceof Date ? birthDate : new Date(birthDate)) : null;

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(existingDate || undefined);
  const [month, setMonth] = useState<Date>(selected || new Date(2000, 0, 1));
  const [menuOpen, setMenuOpen] = useState(false);

  const formatDisplayDate = (date: Date) => {
    return format(date, "d 'de' MMMM, yyyy", { locale: es });
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

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

  const handleMonthChange = (monthIndex: string) => {
    const newMonthIndex = parseInt(monthIndex);
    const newDate = new Date(month);
    newDate.setMonth(newMonthIndex);
    setMonth(newDate);
  };

  const handleEdit = () => {
    setMenuOpen(false);
    setOpen(true);
  };

  const handleDelete = () => {
    setSelected(undefined);
    setMenuOpen(false);
    // Aquí puedes agregar la lógica para eliminar de la BD
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
          <div className="flex items-center gap-3 flex-1">
            <CalendarIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <span className={cn("text-sm font-medium", !selected && "text-gray-500")}>
              {selected ? formatDisplayDate(selected) : "Agregar fecha de nacimiento"}
            </span>
          </div>
          {selected && (
            <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-gray-400 hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] invisible group-hover:visible transition-all rounded-lg h-8 w-8 flex items-center justify-center"
                >
                  <span className="text-xl">⋯</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 rounded-2xl border dark:border-zinc-800 bg-background/95 backdrop-blur-md shadow-lg"
                sideOffset={8}
              >
                <div className="p-1">
                  <DropdownMenuItem
                    onClick={handleEdit}
                    className="rounded-xl cursor-pointer flex items-center px-3 py-2"
                  >
                    <Edit2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="rounded-xl cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/30 px-3 py-2"
                  >
                    <Trash2 className="mr-2 h-4 w-4" strokeWidth={1.5} />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-4 w-auto bg-white border-gray-200 dark:bg-[#1a1a1a] dark:border-[#2a2a2a] rounded-2xl">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={handleSelect}
          month={month}
          onMonthChange={setMonth}
          disabled={(date) => date > new Date() || date < new Date(1900, 0, 1)}
          className="p-0"
          classNames={{
            day_button: cn(
              "hover:bg-gray-100 dark:hover:bg-[#2a2a2a] data-[selected]:bg-primary data-[selected]:text-primary-foreground",
              "data-[disabled]:text-gray-600 data-[disabled]:cursor-not-allowed",
              "data-[outside]:text-gray-600"
            ),
            months: "flex flex-col sm:flex-row gap-4",
            month: "w-full space-y-4",
            month_caption: "relative flex h-10 items-center justify-center",
            caption_label: "text-sm font-medium capitalize",
            nav: "hidden",
            weekday: "size-9 p-0 text-xs font-medium text-gray-500",
            day: "group size-9 px-0 text-sm",
            today: "*:after:bg-primary",
            outside: "text-gray-600 opacity-50",
          }}
          components={{
            CaptionLabel: () => (
              <div className="flex items-center gap-2 w-full">
                <Select
                  value={String(month.getMonth())}
                  onValueChange={handleMonthChange}
                >
                  <SelectTrigger className="h-8 flex-1 text-xs bg-gray-100 border-gray-200 hover:border-gray-300 focus-visible:border-gray-200 dark:bg-[#1f1f1f] dark:border-[#2a2a2a] dark:hover:border-[#3a3a3a] dark:focus-visible:border-[#2a2a2a] focus-visible:ring-0 focus:ring-0 focus:outline-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 bg-white border-gray-200 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
                    {monthNames.map((monthName, idx) => (
                      <SelectItem key={idx} value={String(idx)}>
                        {monthName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={String(month.getFullYear())}
                  onValueChange={handleYearChange}
                >
                  <SelectTrigger className="h-8 flex-1 text-xs bg-gray-100 border-gray-200 hover:border-gray-300 focus-visible:border-gray-200 dark:bg-[#1f1f1f] dark:border-[#2a2a2a] dark:hover:border-[#3a3a3a] dark:focus-visible:border-[#2a2a2a] focus-visible:ring-0 focus:ring-0 focus:outline-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 bg-white border-gray-200 dark:bg-[#1a1a1a] dark:border-[#2a2a2a]">
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
