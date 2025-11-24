import { isPossiblePhoneNumber, parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export interface PhoneValidationResult {
  valid: boolean;
  error?: string;
  formatted?: string;
  country?: string;
  nationalNumber?: string;
}

/**
 * Validates a phone number using possible validation (recommended for UX)
 * This checks only the length, not strict regex patterns
 */
export function validatePhoneNumber(phone: string): PhoneValidationResult {
  if (!phone || phone.trim() === '') {
    return {
      valid: false,
      error: 'Phone number is required',
    };
  }

  // Use isPossiblePhoneNumber for better UX (won't reject future number formats)
  if (!isPossiblePhoneNumber(phone)) {
    return {
      valid: false,
      error: 'Invalid phone number format',
    };
  }

  try {
    const parsed = parsePhoneNumber(phone);

    return {
      valid: true,
      formatted: parsed.formatInternational(),
      country: parsed.country,
      nationalNumber: parsed.nationalNumber,
    };
  } catch {
    return {
      valid: false,
      error: 'Could not parse phone number',
    };
  }
}

/**
 * Strict validation - use only when you need to validate against actual numbering plans
 * May reject valid but new numbers
 */
export function validatePhoneNumberStrict(phone: string): PhoneValidationResult {
  if (!phone || phone.trim() === '') {
    return {
      valid: false,
      error: 'Phone number is required',
    };
  }

  if (!isValidPhoneNumber(phone)) {
    return {
      valid: false,
      error: 'Invalid phone number',
    };
  }

  try {
    const parsed = parsePhoneNumber(phone);

    return {
      valid: true,
      formatted: parsed.formatInternational(),
      country: parsed.country,
      nationalNumber: parsed.nationalNumber,
    };
  } catch {
    return {
      valid: false,
      error: 'Could not parse phone number',
    };
  }
}

/**
 * Format a phone number for display
 */
export function formatPhoneNumber(phone: string, format: 'international' | 'national' = 'international'): string {
  try {
    const parsed = parsePhoneNumber(phone);
    return format === 'international'
      ? parsed.formatInternational()
      : parsed.formatNational();
  } catch {
    return phone;
  }
}
