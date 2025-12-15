/**
 * Currency formatting utilities for the Referrals system
 *
 * This module provides shared currency formatting functions to ensure
 * consistent currency display across all referral-related components.
 */

import { LOCALE } from "@/lib/constants";

/**
 * Formats a number as Colombian Peso (COP) currency
 *
 * @param amount - The numeric amount to format
 * @param options - Optional Intl.NumberFormat options to override defaults
 * @returns Formatted currency string (e.g., "$1.250.000")
 *
 * @example
 * ```typescript
 * formatCurrency(1250000) // "$1.250.000"
 * formatCurrency(500.50)  // "$501" (rounds to nearest peso)
 * ```
 */
export function formatCurrency(
  amount: number,
  options?: Partial<Intl.NumberFormatOptions>
): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    ...options,
  }).format(amount);
}

/**
 * Formats a number as a compact currency string (e.g., $1.2M, $500K)
 *
 * @param amount - The numeric amount to format
 * @returns Compact currency string
 *
 * @example
 * ```typescript
 * formatCompactCurrency(1250000) // "$1.3M"
 * formatCompactCurrency(500000)  // "$500K"
 * ```
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return formatCurrency(amount);
}
