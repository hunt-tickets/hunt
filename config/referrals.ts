/**
 * Referrals System Configuration
 *
 * This file contains all configuration constants for the referrals, rebates,
 * and payments system. Centralizing configuration makes it easier to maintain
 * and update system-wide settings.
 */

import type { CommissionRates, PaymentSchedule, ReferralConfig } from "@/lib/referrals/types";

/**
 * Commission rates for the referrals system
 *
 * These rates determine the percentages for various commission types:
 * - HUNT_BASE_RATE: The commission Hunt charges on ticket sales (5%)
 * - REFERRAL_RATE: The commission paid to referrers on Hunt's net profit (5%)
 * - REBATE_RATE: The rebate given to producers on their own event sales (2.5%)
 */
export const COMMISSION_RATES: CommissionRates = {
  HUNT_BASE_RATE: 5, // Hunt's commission on ticket sales
  REFERRAL_RATE: 5, // Referrer's commission on Hunt's net profit
  REBATE_RATE: 2.5, // Producer's rebate on own event sales
} as const;

/**
 * Payment schedule configuration
 *
 * Defines when payments are calculated and processed:
 * - cutoffDay: Last day of each month
 * - paymentDelay: Days after cutoff before payment (calculated as first business day)
 */
export const PAYMENT_SCHEDULE: PaymentSchedule = {
  cutoffDay: "last", // Last day of month
  paymentDelay: 1, // First business day of next month (calculated avoiding weekends/holidays)
} as const;

/**
 * Default base URL for referral links
 *
 * This can be overridden via environment variable for different environments
 * (development, staging, production)
 */
export const REFERRAL_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://hunt-tickets.com";

/**
 * Sign-up path for referral links
 */
export const REFERRAL_SIGNUP_PATH = "/sign-up";

/**
 * Complete referral configuration
 *
 * This aggregates all referral-related configuration into a single object
 * for easy access throughout the application.
 */
export const REFERRAL_CONFIG: ReferralConfig = {
  baseUrl: REFERRAL_BASE_URL,
  signUpPath: REFERRAL_SIGNUP_PATH,
  paymentSchedule: PAYMENT_SCHEDULE,
  commissionRates: COMMISSION_RATES,
} as const;

/**
 * Mock data generation settings
 *
 * These settings control the behavior of mock data generators
 * for development and testing purposes.
 */
export const MOCK_DATA_CONFIG = {
  // Payment history settings
  PAYMENT_HISTORY_MONTHS: 4,
  PAYMENT_AMOUNT_MIN: 1400000,
  PAYMENT_AMOUNT_MAX: 1900000,

  // Rebate history settings
  REBATE_HISTORY_MONTHS: 6,
  REBATE_EVENTS_PER_MONTH_MIN: 1,
  REBATE_EVENTS_PER_MONTH_MAX: 3,
  REBATE_TICKETS_MIN: 50,
  REBATE_TICKETS_MAX: 250,
  REBATE_REVENUE_PER_TICKET_MIN: 30000,
  REBATE_REVENUE_PER_TICKET_MAX: 80000,

  // Chart settings
  CHART_TIME_RANGES: [3, 6, 12] as const,
  DEFAULT_TIME_RANGE: 6,

  // Current billing cycle
  CURRENT_CYCLE_ESTIMATED_AMOUNT: 850000,
} as const;

/**
 * Feature flags for the referrals system
 *
 * Use these to enable/disable features during development or rollout
 */
export const REFERRAL_FEATURES = {
  ENABLE_REFERRALS: true,
  ENABLE_REBATES: true,
  ENABLE_PAYMENTS_TRACKING: true,
  ENABLE_PAYMENT_HISTORY_EXPORT: false, // Future feature
  ENABLE_ADVANCED_ANALYTICS: false, // Future feature
} as const;

/**
 * UI Configuration
 *
 * Settings that affect the UI/UX of the referrals components
 */
export const REFERRAL_UI_CONFIG = {
  // Mobile breakpoint (px)
  MOBILE_BREAKPOINT: 768,

  // Chart colors (light/dark mode)
  CHART_COLORS: {
    LIGHT: "#1a1a1a",
    DARK: "#e5e5e5",
  },

  // Toast notification duration (ms)
  TOAST_DURATION: 2000,

  // Copy link success message duration (ms)
  COPY_SUCCESS_DURATION: 2000,

  // Table pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_VISIBLE_ROWS_MOBILE: 10,
} as const;
