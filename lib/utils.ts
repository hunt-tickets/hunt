import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DATE_FORMATS, LOCALE } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate age from birthdate
 * @param birthdate - ISO date string or null
 * @returns Age in years or null if birthdate is invalid
 */
export function calculateAge(birthdate: string | null): number | null {
  if (!birthdate) return null;

  try {
    const today = new Date();
    const birth = new Date(birthdate);

    // Validate date
    if (isNaN(birth.getTime())) return null;

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age >= 0 ? age : null;
  } catch {
    return null;
  }
}

/**
 * Format date consistently across the app
 * @param date - Date string or Date object
 * @param format - Format type from DATE_FORMATS
 * @returns Formatted date string
 */
export function formatDate(
  date: string | Date,
  format: keyof typeof DATE_FORMATS = 'SHORT'
): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '-';

    return dateObj.toLocaleDateString(LOCALE, DATE_FORMATS[format]);
  } catch {
    return '-';
  }
}

/**
 * Sanitize CSV field to prevent formula injection
 * @param field - Field value to sanitize
 * @returns Sanitized field safe for CSV export
 */
export function sanitizeCSVField(field: string): string {
  if (!field) return '';

  const fieldStr = String(field);

  // Prevent formula injection by prepending single quote to potentially dangerous characters
  if (
    fieldStr.startsWith('=') ||
    fieldStr.startsWith('+') ||
    fieldStr.startsWith('-') ||
    fieldStr.startsWith('@') ||
    fieldStr.startsWith('\t') ||
    fieldStr.startsWith('\r')
  ) {
    return `'${fieldStr}`;
  }

  // Escape quotes
  return fieldStr.replace(/"/g, '""');
}
