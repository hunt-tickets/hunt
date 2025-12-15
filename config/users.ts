/**
 * Centralized configuration for Users System
 *
 * All configurable values for the users feature are defined here
 * to ensure consistency and easy maintenance.
 */

// ============================================================================
// PAGINATION CONFIG
// ============================================================================

export const USERS_PAGINATION = {
  /**
   * Number of users to display per page in tables
   */
  PAGE_SIZE: 1000,

  /**
   * Number of users to load initially
   */
  INITIAL_LOAD: 50,

  /**
   * Number of users to load when "Load More" is clicked
   */
  LOAD_MORE_SIZE: 50,
} as const;

// ============================================================================
// VALIDATION CONFIG
// ============================================================================

export const USERS_VALIDATION = {
  /**
   * Minimum length for user names
   */
  MIN_NAME_LENGTH: 2,

  /**
   * Maximum length for user names
   */
  MAX_NAME_LENGTH: 50,

  /**
   * Minimum phone number length (digits only)
   */
  MIN_PHONE_LENGTH: 7,

  /**
   * Maximum phone number length (digits only)
   */
  MAX_PHONE_LENGTH: 15,

  /**
   * Email regex pattern
   */
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  /**
   * Phone regex pattern (basic: 7+ digits)
   */
  PHONE_REGEX: /^\d{7,}$/,

  /**
   * Minimum age for user registration
   */
  MIN_AGE: 13,

  /**
   * Maximum age for validation
   */
  MAX_AGE: 120,
} as const;

// ============================================================================
// EXPORT CONFIG
// ============================================================================

export const USERS_EXPORT = {
  /**
   * Supported export formats
   */
  FORMATS: ["csv", "xlsx", "pdf"] as const,

  /**
   * Default fields to include in exports
   */
  DEFAULT_FIELDS: [
    "name",
    "lastName",
    "email",
    "phone",
    "gender",
    "created_at",
  ] as const,

  /**
   * Maximum number of users to export at once
   */
  MAX_EXPORT_SIZE: 10000,

  /**
   * CSV delimiter
   */
  CSV_DELIMITER: ",",

  /**
   * Date format for exports
   */
  DATE_FORMAT: "yyyy-MM-dd",
} as const;

// ============================================================================
// DISPLAY CONFIG
// ============================================================================

export const USERS_DISPLAY = {
  /**
   * Default locale for date/number formatting
   */
  DEFAULT_LOCALE: "es-CO",

  /**
   * Date format options for birthdate display
   */
  BIRTHDATE_FORMAT: {
    day: "numeric",
    month: "short",
    year: "numeric",
  } as const,

  /**
   * Default fallback text for missing names
   */
  FALLBACK_NAME: "Sin nombre",

  /**
   * Default fallback text for missing email
   */
  FALLBACK_EMAIL: "Usuario",

  /**
   * Default fallback text for unspecified values
   */
  FALLBACK_UNSPECIFIED: "No especificado",

  /**
   * Default fallback text for invalid dates
   */
  FALLBACK_INVALID_DATE: "Fecha inválida",

  /**
   * Default initials when name is not available
   */
  FALLBACK_INITIALS: "?",
} as const;

// ============================================================================
// GENDER CONFIG
// ============================================================================

export const USERS_GENDER = {
  /**
   * Available gender options
   */
  OPTIONS: [
    { value: "Masculino", label: "Masculino", emoji: "👨" },
    { value: "Femenino", label: "Femenino", emoji: "👩" },
    { value: "Otro", label: "Otro", emoji: "⚧" },
    { value: "Prefiero no decir", label: "Prefiero no decir", emoji: "👤" },
  ] as const,

  /**
   * Default emoji for unspecified gender
   */
  DEFAULT_EMOJI: "👤",
} as const;

// ============================================================================
// STATISTICS CONFIG
// ============================================================================

export const USERS_STATS = {
  /**
   * Number of days to consider a user as "new"
   */
  NEW_USER_DAYS: 30,

  /**
   * Number of months to show in growth charts
   */
  GROWTH_CHART_MONTHS: 6,

  /**
   * Minimum data points required for chart display
   */
  MIN_CHART_DATA_POINTS: 2,
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const USERS_FEATURES = {
  /**
   * Enable user export functionality
   */
  ENABLE_EXPORT: true,

  /**
   * Enable user statistics dashboard
   */
  ENABLE_STATISTICS: true,

  /**
   * Enable user growth charts
   */
  ENABLE_GROWTH_CHARTS: true,

  /**
   * Enable user profile editing
   */
  ENABLE_PROFILE_EDIT: true,

  /**
   * Enable user deletion
   */
  ENABLE_USER_DELETE: true,

  /**
   * Enable bulk user operations
   */
  ENABLE_BULK_OPERATIONS: false,

  /**
   * Enable advanced filtering
   */
  ENABLE_ADVANCED_FILTERS: true,

  /**
   * Enable marketing email preferences
   */
  ENABLE_MARKETING_EMAILS: true,
} as const;

// ============================================================================
// UI CONFIG
// ============================================================================

export const USERS_UI_CONFIG = {
  /**
   * Table configuration
   */
  TABLE: {
    /**
     * Enable row hover effect
     */
    ENABLE_HOVER: true,

    /**
     * Enable row selection
     */
    ENABLE_SELECTION: false,

    /**
     * Enable column sorting
     */
    ENABLE_SORTING: true,

    /**
     * Enable column filtering
     */
    ENABLE_FILTERING: true,

    /**
     * Default sort field
     */
    DEFAULT_SORT_FIELD: "created_at" as const,

    /**
     * Default sort direction
     */
    DEFAULT_SORT_DIRECTION: "desc" as const,
  },

  /**
   * Search configuration
   */
  SEARCH: {
    /**
     * Minimum characters to trigger search
     */
    MIN_SEARCH_LENGTH: 2,

    /**
     * Debounce delay in milliseconds
     */
    DEBOUNCE_DELAY: 300,

    /**
     * Placeholder text
     */
    PLACEHOLDER: "Buscar por nombre, email o teléfono...",
  },

  /**
   * Sheet/Modal configuration
   */
  SHEET: {
    /**
     * Enable close on outside click
     */
    CLOSE_ON_OUTSIDE_CLICK: true,

    /**
     * Enable close on escape key
     */
    CLOSE_ON_ESCAPE: true,
  },
} as const;

// ============================================================================
// MOCK DATA CONFIG
// ============================================================================

export const USERS_MOCK_DATA_CONFIG = {
  /**
   * Enable mock data in development
   */
  ENABLE_MOCK_DATA: process.env.NODE_ENV === "development",

  /**
   * Number of mock users to generate for testing
   */
  MOCK_USERS_COUNT: 100,

  /**
   * Number of mock transactions per user
   */
  MOCK_TRANSACTIONS_PER_USER: 3,
} as const;

// ============================================================================
// SECURITY CONFIG
// ============================================================================

export const USERS_SECURITY = {
  /**
   * Fields to exclude from CSV export for privacy
   */
  SENSITIVE_FIELDS: ["document_id"],

  /**
   * Fields that require CSV injection prevention
   */
  CSV_INJECTION_FIELDS: ["name", "lastName", "email"],

  /**
   * Maximum file size for avatar uploads (in bytes)
   */
  MAX_AVATAR_SIZE: 5 * 1024 * 1024, // 5MB

  /**
   * Allowed avatar file types
   */
  ALLOWED_AVATAR_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

// ============================================================================
// TRANSACTION CONFIG
// ============================================================================

export const USERS_TRANSACTIONS = {
  /**
   * Available transaction sources
   */
  SOURCES: [
    { value: "web", label: "Web", color: "blue" },
    { value: "app", label: "App", color: "green" },
    { value: "cash", label: "Efectivo", color: "yellow" },
  ] as const,

  /**
   * Number of transactions to show initially
   */
  INITIAL_DISPLAY: 10,

  /**
   * Enable transaction filtering by source
   */
  ENABLE_SOURCE_FILTER: true,

  /**
   * Enable transaction filtering by date range
   */
  ENABLE_DATE_FILTER: true,
} as const;
