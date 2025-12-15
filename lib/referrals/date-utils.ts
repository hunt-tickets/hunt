/**
 * Date utility functions for the Referrals system
 *
 * This module provides shared date manipulation and formatting functions
 * to ensure consistent date handling across all referral-related components.
 */

/**
 * Gets the last day of a given month
 *
 * @param year - The year (e.g., 2024)
 * @param month - The month (0-11, where 0 = January)
 * @returns Date object representing the last day of the month
 *
 * @example
 * ```typescript
 * getLastDayOfMonth(2024, 0)  // Jan 31, 2024
 * getLastDayOfMonth(2024, 1)  // Feb 29, 2024 (leap year)
 * ```
 */
export function getLastDayOfMonth(year: number, month: number): Date {
  return new Date(year, month + 1, 0);
}

/**
 * Formats a Date object as a YYYY-MM-DD string in local timezone
 *
 * This function avoids timezone conversion issues that occur with toISOString()
 * by using local date components directly.
 *
 * @param date - The Date object to format
 * @returns ISO date string in local timezone (YYYY-MM-DD)
 *
 * @example
 * ```typescript
 * const date = new Date(2024, 0, 15); // Jan 15, 2024
 * formatDateString(date) // "2024-01-15"
 * ```
 */
export function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a Date object as a localized period string
 *
 * @param date - The Date object to format
 * @param locale - The locale to use (defaults to 'es-CO')
 * @returns Localized period string (e.g., "enero 2024", "diciembre 2023")
 *
 * @example
 * ```typescript
 * const date = new Date(2024, 0, 15);
 * formatPeriod(date) // "enero 2024"
 * ```
 */
export function formatPeriod(date: Date, locale = 'es-CO'): string {
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

/**
 * Formats a Date object as a short localized month string
 *
 * @param date - The Date object to format
 * @param locale - The locale to use (defaults to 'es-CO')
 * @returns Short month string (e.g., "ene 24", "dic 23")
 *
 * @example
 * ```typescript
 * const date = new Date(2024, 0, 15);
 * formatShortMonth(date) // "ene 24"
 * ```
 */
export function formatShortMonth(date: Date, locale = 'es-CO'): string {
  return date.toLocaleDateString(locale, { month: 'short', year: '2-digit' });
}

/**
 * Generates an array of dates for the last N months
 *
 * @param months - Number of months to generate (1-12)
 * @returns Array of Date objects representing the first day of each month
 *
 * @example
 * ```typescript
 * // If today is March 15, 2024
 * getLastNMonths(3) // [Dec 1 2023, Jan 1 2024, Feb 1 2024]
 * ```
 */
export function getLastNMonths(months: number): Date[] {
  const today = new Date();
  const result: Date[] = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    result.push(date);
  }

  return result;
}
