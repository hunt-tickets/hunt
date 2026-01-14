"use client"
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Calendar, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SimpleDateTimePickerProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  name?: string;
  minDate?: Date;
  maxDate?: Date;
  label?: string;
  hint?: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  containerClassName?: string;
}

export const SimpleDateTimePicker = ({
  value,
  onChange,
  placeholder = "Selecciona fecha y hora",
  name,
  minDate,
  maxDate,
  label,
  hint,
  error,
  success,
  required,
  containerClassName
}: SimpleDateTimePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const [selectedHour, setSelectedHour] = useState(selectedDate?.getHours() || 19);
  const [selectedMinute, setSelectedMinute] = useState(selectedDate?.getMinutes() || 0);
  const [isPM, setIsPM] = useState((selectedDate?.getHours() || 19) >= 12);
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      const hours = date.getHours();
      setSelectedHour(hours);
      setSelectedMinute(date.getMinutes());
      setIsPM(hours >= 12);
      setViewDate(date);
    }
  }, [value]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const padding = 16;
      const calendarWidth = 384;
      const calendarHeight = 564; // Updated to actual rendered height
      const maxHeight = window.innerHeight * 0.9; // 90vh
      const effectiveHeight = Math.min(calendarHeight, maxHeight);

      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      let top = rect.bottom + 8; // No window.scrollY for fixed positioning
      let left = rect.left;

      // Check if it fits below, otherwise try above
      if (spaceBelow < effectiveHeight + padding) {
        if (spaceAbove >= effectiveHeight + padding) {
          // Position above
          top = rect.top - effectiveHeight - 8;
        } else {
          // Not enough space either way, position from top with padding
          top = padding;
        }
      }

      // Final boundary check - ensure it doesn't go off bottom
      const maxTop = window.innerHeight - effectiveHeight - padding;
      if (top > maxTop) {
        top = maxTop;
      }

      // Ensure it doesn't go off top
      if (top < padding) {
        top = padding;
      }

      // Horizontal positioning
      if (left + calendarWidth > window.innerWidth - padding) {
        left = Math.max(padding, window.innerWidth - calendarWidth - padding);
      }
      if (left < padding) {
        left = padding;
      }

      setCalendarPosition({ top, left });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const displayDateTime = (date: Date) => {
    const dateOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    };
    const dateStr = date.toLocaleDateString('es-ES', dateOptions);
    const timeStr = date.toLocaleTimeString('es-ES', timeOptions);
    return `${dateStr} • ${timeStr}`;
  };

  const isDateDisabled = (date: Date) => {
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // No permitir fechas anteriores a hoy
    const today = new Date();
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (dateOnly < todayOnly) return true;

    if (minDate) {
      const minDateOnly = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
      if (dateOnly < minDateOnly) return true;
    }
    if (maxDate) {
      const maxDateOnly = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());
      if (dateOnly > maxDateOnly) return true;
    }
    return false;
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(
      viewDate.getFullYear(),
      viewDate.getMonth(),
      day,
      selectedHour, // Ya está en formato 24H
      selectedMinute
    );
    if (!isDateDisabled(newDate)) {
      setSelectedDate(newDate);
      onChange?.(formatDateTime(newDate));
    }
  };

  const handleTimeChange = (hour12: number, minute: number, pm: boolean) => {
    // Convertir de 12H a 24H
    let hour24 = hour12;
    if (hour12 === 12) {
      hour24 = pm ? 12 : 0;
    } else {
      hour24 = pm ? hour12 + 12 : hour12;
    }

    setSelectedHour(hour24);
    setSelectedMinute(minute);
    setIsPM(pm);

    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(hour24);
      newDate.setMinutes(minute);
      setSelectedDate(newDate);
      onChange?.(formatDateTime(newDate));
    }
  };

  const changeMonth = (increment: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + increment, 1));
  };

  const changeYear = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
  };

  const changeMonthDirect = (month: number) => {
    setViewDate(new Date(viewDate.getFullYear(), month, 1));
  };

  const clearDate = () => {
    setSelectedDate(null);
    onChange?.('');
  };

  const daysInMonth = getDaysInMonth(viewDate);
  const firstDay = getFirstDayOfMonth(viewDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay }, (_, i) => i);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const today = new Date();
  const currentYear = today.getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 1 + i);

  const hours12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1-12
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  // Convertir hora 24H actual a 12H para mostrar
  const displayHour12 = selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour;

  const hasError = !!error;
  const hasSuccess = success && !hasError;

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <label className="text-sm font-medium text-gray-600 dark:text-white/60 select-none">
          {label}
          {required && <span className="text-gray-400 ml-1">*</span>}
        </label>
      )}

      <div ref={containerRef} className="relative">
        <input type="hidden" name={name} value={selectedDate ? formatDateTime(selectedDate) : ''} />

        {/* Input */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-2 rounded-xl border px-4 py-3 transition-all duration-200 cursor-pointer",
            "bg-gray-50/50 dark:bg-[#202020]/50 backdrop-blur-sm",
            "focus-within:outline-none focus-within:ring-2",
            hasError && [
              "border-red-300 dark:border-red-800",
              "focus-within:border-red-500 dark:focus-within:border-red-600",
              "focus-within:ring-red-500/20 dark:focus-within:ring-red-500/20",
            ],
            hasSuccess && [
              "border-green-300 dark:border-green-800",
              "focus-within:border-green-500 dark:focus-within:border-green-600",
              "focus-within:ring-green-500/20 dark:focus-within:ring-green-500/20",
            ],
            !hasError && !hasSuccess && [
              "border-gray-200 dark:border-[#2a2a2a]",
              "hover:border-gray-300 dark:hover:border-[#333333]",
              "focus-within:border-gray-900 dark:focus-within:border-white/50",
              "focus-within:ring-gray-900/10 dark:focus-within:ring-white/10",
            ]
          )}
        >
        <span className="flex-1 text-sm">
          {selectedDate ? (
            <span className="text-foreground">{displayDateTime(selectedDate)}</span>
          ) : (
            <span className="text-gray-400 dark:text-white/30">{placeholder}</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {!selectedDate && (
            <Calendar size={18} className="text-gray-500 dark:text-white/40" />
          )}
          {selectedDate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearDate();
              }}
              className="p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Calendar Popup Portal */}
      {mounted && isOpen && calendarPosition && createPortal(
        <div
          ref={calendarRef}
          data-date-picker-calendar
          className="fixed w-full max-w-sm rounded-xl border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] shadow-2xl p-4 z-[99999] max-h-[90vh] overflow-y-auto"
          style={{
            top: `${calendarPosition.top}px`,
            left: `${calendarPosition.left}px`,
          }}
        >
          {/* Month + Year Select */}
          <div className="flex gap-2 mb-4">
            <select
              value={viewDate.getMonth()}
              onChange={(e) => changeMonthDirect(parseInt(e.target.value))}
              className="flex-1 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#202020] px-3 py-2 pr-8 text-sm text-foreground outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
            <select
              value={viewDate.getFullYear()}
              onChange={(e) => changeYear(parseInt(e.target.value))}
              className="flex-1 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#202020] px-3 py-2 pr-8 text-sm text-foreground outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition-colors appearance-none cursor-pointer"
              style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mb-3 text-sm font-medium text-foreground">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#202020] transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 py-1.5">
              {months[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#202020] transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="w-full text-center text-sm mb-4">
            {/* Week days header */}
            <div className="grid grid-cols-7 mb-2">
              {weekDays.map(day => (
                <div key={day} className="py-2 text-xs font-medium text-gray-500 dark:text-white/50">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for alignment */}
              {emptyDays.map(i => (
                <div key={`empty-${i}`} />
              ))}

              {/* Days of month */}
              {days.map(day => {
                const currentDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                const isDisabled = isDateDisabled(currentDate);
                const isSelected = selectedDate &&
                  selectedDate.getDate() === day &&
                  selectedDate.getMonth() === viewDate.getMonth() &&
                  selectedDate.getFullYear() === viewDate.getFullYear();
                const isToday =
                  currentDate.getDate() === today.getDate() &&
                  currentDate.getMonth() === today.getMonth() &&
                  currentDate.getFullYear() === today.getFullYear();

                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={isDisabled}
                    className={`
                      w-10 h-10 flex items-center justify-center rounded-lg text-sm transition-colors
                      ${isSelected ? 'bg-gray-900 dark:bg-white/90 text-white dark:text-black font-semibold' : ''}
                      ${!isSelected && !isDisabled ? 'hover:bg-gray-100 dark:hover:bg-[#202020]' : ''}
                      ${isToday && !isSelected ? 'border border-gray-900 dark:border-white/50' : ''}
                      ${isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Picker */}
          <div className="border-t border-gray-200 dark:border-[#2a2a2a] pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock size={16} className="text-gray-500 dark:text-white/40" />
              <span className="text-sm font-medium text-gray-600 dark:text-white/60">Hora</span>
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={displayHour12}
                onChange={(e) => handleTimeChange(parseInt(e.target.value), selectedMinute, isPM)}
                className="flex-1 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#202020] px-3 py-2 pr-8 text-sm text-foreground outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
              >
                {hours12.map(hour => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <span className="text-gray-500 dark:text-white/40 font-bold">:</span>
              <select
                value={selectedMinute}
                onChange={(e) => handleTimeChange(displayHour12, parseInt(e.target.value), isPM)}
                className="flex-1 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#202020] px-3 py-2 pr-8 text-sm text-foreground outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
              >
                {minutes.map(minute => (
                  <option key={minute} value={minute}>
                    {String(minute).padStart(2, '0')}
                  </option>
                ))}
              </select>
              <select
                value={isPM ? 'PM' : 'AM'}
                onChange={(e) => handleTimeChange(displayHour12, selectedMinute, e.target.value === 'PM')}
                className="w-20 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#202020] px-3 py-2 pr-8 text-sm text-foreground outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white/20 transition-colors appearance-none cursor-pointer"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.25em 1.25em' }}
              >
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>
        </div>,
        document.body
      )}
      </div>

      {(hint || error) && (
        <p
          className={cn(
            "text-xs",
            hasError && "text-red-600 dark:text-red-400",
            !hasError && "text-gray-500 dark:text-white/40"
          )}
        >
          {error || hint}
        </p>
      )}
    </div>
  );
};
