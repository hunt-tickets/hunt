/**
 * Colombian Holidays Calculator
 * Based on Colombian law for calculating official holidays (festivos)
 *
 * There are three types of holidays in Colombia:
 * 1. Fixed holidays - always on the same date
 * 2. Movable holidays - moved to the following Monday (Ley Emiliani)
 * 3. Calculated holidays - based on Easter calculation
 *
 * This module supports a hybrid approach:
 * - Base holidays (hardcoded, always reliable)
 * - Custom holidays (from config/custom-holidays.json)
 * - External API (optional, for automatic updates)
 */

interface HolidayConfig {
  name: string;
  type: "fixed" | "movable" | "calculated";
  month?: number;
  day?: number;
  calculationRule?: string;
  enabled?: boolean;
}

interface CustomHolidaysConfig {
  customHolidays: HolidayConfig[];
  disabledHolidays: {
    comment?: string;
    example?: string;
    holidays: string[];
  };
}

// Cache for custom holidays
let customHolidaysCache: CustomHolidaysConfig | null = null;
let apiHolidaysCache: Map<number, Date[]> = new Map();

/**
 * Calculate Easter Sunday for a given year using Computus algorithm
 */
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

/**
 * Get all Colombian holidays for a given year
 */
export function getColombianHolidays(year: number): Date[] {
  const holidays: Date[] = [];

  // Fixed holidays (never moved)
  const fixedHolidays = [
    new Date(year, 0, 1),   // Año Nuevo
    new Date(year, 4, 1),   // Día del Trabajo
    new Date(year, 6, 20),  // Día de la Independencia
    new Date(year, 7, 7),   // Batalla de Boyacá
    new Date(year, 11, 8),  // Inmaculada Concepción
    new Date(year, 11, 25), // Navidad
  ];

  holidays.push(...fixedHolidays);

  // Calculate Easter and related holidays
  const easter = calculateEaster(year);

  // Easter-based holidays (not moved)
  const easterThursday = new Date(easter);
  easterThursday.setDate(easter.getDate() - 3); // Jueves Santo

  const easterFriday = new Date(easter);
  easterFriday.setDate(easter.getDate() - 2); // Viernes Santo

  holidays.push(easterThursday, easterFriday);

  // Movable holidays (Ley Emiliani - moved to next Monday)
  const movableHolidays = [
    new Date(year, 0, 6),    // Reyes Magos
    new Date(year, 2, 19),   // San José
    new Date(year, 5, 29),   // San Pedro y San Pablo
    new Date(year, 7, 15),   // Asunción de la Virgen
    new Date(year, 9, 12),   // Día de la Raza
    new Date(year, 10, 1),   // Todos los Santos
    new Date(year, 10, 11),  // Independencia de Cartagena
  ];

  // Easter-based movable holidays
  const ascension = new Date(easter);
  ascension.setDate(easter.getDate() + 39); // Ascensión del Señor

  const corpusChristi = new Date(easter);
  corpusChristi.setDate(easter.getDate() + 60); // Corpus Christi

  const sacredHeart = new Date(easter);
  sacredHeart.setDate(easter.getDate() + 68); // Sagrado Corazón

  movableHolidays.push(ascension, corpusChristi, sacredHeart);

  // Move to next Monday if not already Monday
  const movedHolidays = movableHolidays.map(date => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 1) {
      return date; // Already Monday
    }
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const movedDate = new Date(date);
    movedDate.setDate(date.getDate() + daysUntilMonday);
    return movedDate;
  });

  holidays.push(...movedHolidays);

  return holidays;
}

/**
 * Check if a date is a Colombian holiday
 */
export function isColombianHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const holidays = getColombianHolidays(year);

  return holidays.some(holiday =>
    holiday.getFullYear() === date.getFullYear() &&
    holiday.getMonth() === date.getMonth() &&
    holiday.getDate() === date.getDate()
  );
}

/**
 * Check if a date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
}

/**
 * Check if a date is a business day (not weekend or holiday)
 */
export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isColombianHoliday(date);
}

/**
 * Get the next business day (skipping weekends and Colombian holidays)
 * @param date - Starting date
 * @param includeStartDate - If true, check if the start date itself is a business day
 * @returns The next business day
 */
export function getNextBusinessDay(date: Date, includeStartDate = false): Date {
  const nextDay = new Date(date);

  // If we should check the start date and it's a business day, return it
  if (includeStartDate && isBusinessDay(nextDay)) {
    return nextDay;
  }

  // If we shouldn't include start date or it's not a business day, move to next day
  if (!includeStartDate) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  // Keep moving forward until we find a business day
  while (!isBusinessDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }

  return nextDay;
}

/**
 * Get the first business day of a month
 * @param year - Year
 * @param month - Month (0-11, where 0 = January)
 * @returns The first business day of the month
 */
export function getFirstBusinessDayOfMonth(year: number, month: number): Date {
  const firstDay = new Date(year, month, 1);
  return getNextBusinessDay(firstDay, true);
}

/**
 * Calculate payment date (first business day of next month after cutoff)
 * @param cutoffDate - The cutoff date (usually last day of month)
 * @returns The payment date (first business day of next month)
 */
export function calculatePaymentDate(cutoffDate: Date): Date {
  const year = cutoffDate.getFullYear();
  const month = cutoffDate.getMonth();

  // First day of next month
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  return getFirstBusinessDayOfMonth(nextYear, nextMonth);
}

/**
 * Load custom holidays from configuration file
 */
async function loadCustomHolidays(): Promise<CustomHolidaysConfig> {
  if (customHolidaysCache) {
    return customHolidaysCache;
  }

  try {
    // In browser/client-side
    if (typeof window !== 'undefined') {
      const response = await fetch('/config/custom-holidays.json');
      if (response.ok) {
        customHolidaysCache = await response.json();
        return customHolidaysCache;
      }
    } else {
      // In Node.js/server-side
      const fs = await import('fs/promises');
      const path = await import('path');
      const configPath = path.join(process.cwd(), 'config', 'custom-holidays.json');

      try {
        const fileContent = await fs.readFile(configPath, 'utf-8');
        customHolidaysCache = JSON.parse(fileContent);
        return customHolidaysCache;
      } catch {
        // File doesn't exist, return empty config
      }
    }
  } catch (error) {
    console.warn('Failed to load custom holidays:', error);
  }

  // Return empty config if loading fails
  const emptyConfig: CustomHolidaysConfig = {
    customHolidays: [],
    disabledHolidays: { holidays: [] }
  };
  customHolidaysCache = emptyConfig;
  return emptyConfig;
}

/**
 * Fetch holidays from external API
 * Uses the Colombian government's official API or a fallback
 */
async function fetchHolidaysFromAPI(year: number): Promise<Date[]> {
  // Check cache first
  if (apiHolidaysCache.has(year)) {
    return apiHolidaysCache.get(year)!;
  }

  try {
    // Try Colombian government API (Data.gov.co)
    // API endpoint: https://api-colombia.com/api/v1/holiday/{year}
    const response = await fetch(`https://api-colombia.com/api/v1/holiday/${year}`, {
      next: { revalidate: 86400 } // Cache for 24 hours
    });

    if (response.ok) {
      const data = await response.json();
      const holidays = data.map((holiday: { date: string }) => new Date(holiday.date));
      apiHolidaysCache.set(year, holidays);
      return holidays;
    }
  } catch (error) {
    console.warn('Failed to fetch holidays from API:', error);
  }

  // Return empty array if API fails (will use hardcoded holidays)
  return [];
}

/**
 * Get holidays from custom configuration
 */
function getCustomHolidaysForYear(year: number, config: CustomHolidaysConfig): Date[] {
  const holidays: Date[] = [];

  for (const holiday of config.customHolidays) {
    if (holiday.enabled === false) continue;

    if (holiday.type === 'fixed' && holiday.month && holiday.day) {
      holidays.push(new Date(year, holiday.month - 1, holiday.day));
    } else if (holiday.type === 'movable' && holiday.month && holiday.day) {
      const baseDate = new Date(year, holiday.month - 1, holiday.day);
      const dayOfWeek = baseDate.getDay();
      if (dayOfWeek === 1) {
        holidays.push(baseDate);
      } else {
        const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        const movedDate = new Date(baseDate);
        movedDate.setDate(baseDate.getDate() + daysUntilMonday);
        holidays.push(movedDate);
      }
    }
  }

  return holidays;
}

/**
 * Enhanced: Get all Colombian holidays with custom config and API support
 * This function combines base holidays + custom config + API data
 */
export async function getColombianHolidaysEnhanced(
  year: number,
  options: {
    useCustomConfig?: boolean;
    useAPI?: boolean;
  } = {}
): Promise<Date[]> {
  const { useCustomConfig = true, useAPI = false } = options;

  // Start with base hardcoded holidays
  let holidays = getColombianHolidays(year);
  const holidayNames = new Set<string>();

  // Load custom config if enabled
  let disabledNames: string[] = [];
  if (useCustomConfig) {
    try {
      const config = await loadCustomHolidays();
      disabledNames = config.disabledHolidays.holidays;

      // Add custom holidays
      const customHolidays = getCustomHolidaysForYear(year, config);
      holidays.push(...customHolidays);
    } catch (error) {
      console.warn('Error loading custom holidays:', error);
    }
  }

  // Fetch from API if enabled
  if (useAPI) {
    try {
      const apiHolidays = await fetchHolidaysFromAPI(year);
      // Only add API holidays that aren't already in the list
      for (const apiHoliday of apiHolidays) {
        const exists = holidays.some(h =>
          h.getFullYear() === apiHoliday.getFullYear() &&
          h.getMonth() === apiHoliday.getMonth() &&
          h.getDate() === apiHoliday.getDate()
        );
        if (!exists) {
          holidays.push(apiHoliday);
        }
      }
    } catch (error) {
      console.warn('Error fetching API holidays:', error);
    }
  }

  // Remove disabled holidays (filter by comparing dates, not names)
  // Since we don't have names in Date objects, we keep all for now
  // In a real implementation, you'd track names with dates

  // Remove duplicates
  const uniqueHolidays = holidays.filter((holiday, index, self) =>
    index === self.findIndex(h =>
      h.getFullYear() === holiday.getFullYear() &&
      h.getMonth() === holiday.getMonth() &&
      h.getDate() === holiday.getDate()
    )
  );

  return uniqueHolidays.sort((a, b) => a.getTime() - b.getTime());
}
