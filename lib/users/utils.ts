/**
 * User utility functions
 *
 * This module provides shared utility functions for user-related operations
 * to ensure consistency and eliminate code duplication.
 */

import type { User, GenderType } from "@/lib/users/types";

/**
 * Formats a user's phone number with prefix
 *
 * @param phone - The phone number
 * @param prefix - The country/area code prefix
 * @returns Formatted phone string or null if no phone
 *
 * @example
 * ```typescript
 * formatUserPhone("3001234567", "+57") // "+57 3001234567"
 * formatUserPhone("3001234567", null)  // "3001234567"
 * formatUserPhone(null, "+57")         // null
 * ```
 */
export function formatUserPhone(
  phone: string | null,
  prefix: string | null
): string | null {
  if (!phone) return null;
  return prefix ? `${prefix} ${phone}` : phone;
}

/**
 * Gets user initials from name and lastName
 *
 * @param name - User's first name
 * @param lastName - User's last name
 * @returns Two-letter initials in uppercase
 *
 * @example
 * ```typescript
 * getUserInitials("Juan", "Pérez")           // "JP"
 * getUserInitials("María José", "García")    // "MG"
 * getUserInitials("Ana", null)               // "A"
 * getUserInitials(null, null)                // "?"
 * ```
 */
export function getUserInitials(
  name: string | null,
  lastName: string | null
): string {
  const fullName = getFullName(name, lastName);

  if (!fullName) return "?";

  return fullName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Gets user's full name
 *
 * @param name - User's first name
 * @param lastName - User's last name
 * @returns Full name or fallback text
 *
 * @example
 * ```typescript
 * getFullName("Juan", "Pérez")    // "Juan Pérez"
 * getFullName("María", null)      // "María"
 * getFullName(null, "García")     // "García"
 * getFullName(null, null)         // "Sin nombre"
 * ```
 */
export function getFullName(
  name: string | null,
  lastName: string | null
): string {
  if (!name && !lastName) return "Sin nombre";
  if (!name) return lastName!;
  if (!lastName) return name;
  return `${name} ${lastName}`;
}

/**
 * Formats gender for display
 *
 * @param gender - Gender value
 * @returns Formatted gender string
 *
 * @example
 * ```typescript
 * formatUserGender("Masculino")           // "Masculino"
 * formatUserGender("Femenino")            // "Femenino"
 * formatUserGender("Otro")                // "Otro"
 * formatUserGender(null)                  // "No especificado"
 * ```
 */
export function formatUserGender(gender: string | null): string {
  if (!gender) return "No especificado";
  return gender;
}

/**
 * Gets gender display emoji
 *
 * @param gender - Gender value
 * @returns Emoji representing the gender
 *
 * @example
 * ```typescript
 * getGenderEmoji("Masculino")    // "👨"
 * getGenderEmoji("Femenino")     // "👩"
 * getGenderEmoji("Otro")         // "⚧"
 * getGenderEmoji(null)           // "👤"
 * ```
 */
export function getGenderEmoji(gender: string | null): string {
  if (!gender) return "👤";

  switch (gender as GenderType) {
    case "Masculino":
      return "👨";
    case "Femenino":
      return "👩";
    case "Otro":
      return "⚧";
    case "Prefiero no decir":
      return "👤";
    default:
      return "👤";
  }
}

/**
 * Validates email format
 *
 * @param email - Email to validate
 * @returns True if valid email format
 *
 * @example
 * ```typescript
 * isValidEmail("test@example.com")    // true
 * isValidEmail("invalid.email")       // false
 * isValidEmail(null)                  // false
 * ```
 */
export function isValidEmail(email: string | null): boolean {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates phone number format (basic)
 *
 * @param phone - Phone to validate
 * @returns True if valid phone format
 *
 * @example
 * ```typescript
 * isValidPhone("3001234567")    // true
 * isValidPhone("123")           // false
 * isValidPhone(null)            // false
 * ```
 */
export function isValidPhone(phone: string | null): boolean {
  if (!phone) return false;
  // Basic validation: at least 7 digits
  const phoneRegex = /^\d{7,}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Gets user age from birthdate
 *
 * @param birthdate - ISO date string
 * @returns Age in years or null if invalid
 *
 * @example
 * ```typescript
 * getUserAge("2000-01-01")    // 24 (as of 2024)
 * getUserAge("invalid")       // null
 * getUserAge(null)            // null
 * ```
 */
export function getUserAge(birthdate: string | null): number | null {
  if (!birthdate) return null;

  try {
    const birth = new Date(birthdate);
    const today = new Date();
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
 * Formats birthdate for display
 *
 * @param birthdate - ISO date string
 * @param locale - Locale for formatting (default: 'es-CO')
 * @returns Formatted date string with age
 *
 * @example
 * ```typescript
 * formatUserBirthdate("2000-01-01")    // "1 de ene de 2000 (24 años)"
 * formatUserBirthdate("invalid")       // "Fecha inválida"
 * formatUserBirthdate(null)            // "No especificado"
 * ```
 */
export function formatUserBirthdate(
  birthdate: string | null,
  locale = 'es-CO'
): string {
  if (!birthdate) return "No especificado";

  try {
    const date = new Date(birthdate);
    const age = getUserAge(birthdate);
    const formatted = date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    return age !== null ? `${formatted} (${age} años)` : formatted;
  } catch {
    return "Fecha inválida";
  }
}

/**
 * Gets user display name (for avatars, headers, etc.)
 *
 * @param user - User object
 * @returns Display name
 *
 * @example
 * ```typescript
 * getUserDisplayName({ name: "Juan", lastName: "Pérez" })    // "Juan Pérez"
 * getUserDisplayName({ name: "María", email: "m@test.com" }) // "María"
 * getUserDisplayName({ email: "test@test.com" })             // "test@test.com"
 * ```
 */
export function getUserDisplayName(user: Partial<User>): string {
  if (user.name || user.lastName) {
    return getFullName(user.name || null, user.lastName || null);
  }
  return user.email || "Usuario";
}

/**
 * Sanitizes user data for CSV export
 *
 * @param value - Value to sanitize
 * @returns Sanitized string safe for CSV
 *
 * @example
 * ```typescript
 * sanitizeForCSV("Normal text")       // "Normal text"
 * sanitizeForCSV("Text with, comma")  // "Text with comma"
 * sanitizeForCSV("=FORMULA")          // "'=FORMULA"
 * ```
 */
export function sanitizeForCSV(value: unknown): string {
  if (value === null || value === undefined) return '';

  let str = String(value);

  // Prevent CSV injection
  if (str.startsWith('=') || str.startsWith('+') || str.startsWith('-') || str.startsWith('@')) {
    str = `'${str}`;
  }

  // Remove commas and newlines
  str = str.replace(/,/g, ' ').replace(/\n/g, ' ');

  return str;
}

/**
 * Checks if user has made any purchases
 *
 * @param user - User with transactions
 * @returns True if user has transactions
 */
export function userHasPurchases(user: Partial<User & { transactions?: unknown[] }>): boolean {
  return !!user.transactions && user.transactions.length > 0;
}

/**
 * Checks if user was created within last N days
 *
 * @param createdAt - ISO date string
 * @param days - Number of days
 * @returns True if user is new
 */
export function isNewUser(createdAt: string | null, days = 30): boolean {
  if (!createdAt) return false;

  try {
    const created = new Date(createdAt);
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - days);

    return created >= daysAgo;
  } catch {
    return false;
  }
}
