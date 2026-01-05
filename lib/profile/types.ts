/**
 * Profile-related TypeScript types and interfaces
 * Centralized type definitions for profile pages and components
 */

// Document types
export type DocumentType = "CC" | "CE" | "TI" | "PA" | "PEP";

// OAuth provider IDs
export type OAuthProviderId = "google" | "apple" | "facebook" | "github";

// Ticket status
export type TicketStatus = "valid" | "used" | "cancelled";

// Document data
export interface DocumentData {
  documentType: DocumentType | null;
  documentNumber: string | null;
}

// Phone verification data
export interface PhoneData {
  phoneNumber: string | null;
  phoneNumberVerified: boolean;
}

// Birth date data
export interface BirthDateData {
  birthdate: string | Date | null;
}

// Password form data
export interface PasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Profile form data (name editing)
export interface ProfileFormData {
  firstName: string;
  lastName: string;
}

// OAuth account
export interface OAuthAccount {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: Date;
  idToken?: string | null;
}

// Session data
export interface SessionData {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Parsed user agent info
export interface ParsedUserAgent {
  browser: string;
  browserVersion: string;
  deviceType: "desktop" | "mobile" | "tablet";
  deviceName: string;
  os: string;
}

// Ticket data
export interface TicketData {
  id: string;
  qr_code: string;
  status: TicketStatus;
  created_at: string;
  order_id: string;
  ticket_types: {
    id: string;
    name: string;
    price: string;
  } | null;
  orders: {
    id: string;
    total_amount: string;
    currency: string;
    paid_at: string;
    events: {
      id: string;
      name: string;
      date: string;
      venues: {
        name: string;
        city: string;
      } | null;
    } | null;
  } | null;
}

// Event with tickets grouped
export interface EventWithTickets {
  eventId: string;
  eventName: string;
  eventDate: string;
  venueName: string | null;
  venueCity: string | null;
  tickets: TicketData[];
}

// Organization data
export interface OrganizationData {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  createdAt: Date;
}

// Component props interfaces

export interface EmailManagerProps {
  email: string;
}

export interface PhoneVerificationManagerProps {
  phoneNumber?: string | null;
  phoneNumberVerified?: boolean;
}

export interface DocumentManagerProps {
  documentType?: string | null;
  documentNumber?: string | null;
}

export interface BirthDateManagerProps {
  birthDate?: string | Date | null;
}

export interface ActiveSessionsCardProps {
  activeSession: SessionData;
}

export interface LinkAccountButtonProps {
  providerId: string;
  providerName: string;
}

export interface UnlinkAccountButtonProps {
  accountId: string;
  providerId: string;
  providerName: string;
}

export interface TicketsListProps {
  ticketsByEvent: EventWithTickets[];
}

export interface CreateOrganizationDialogProps {
  variant?: "default" | "icon-only";
}

// Validation error
export interface ValidationError {
  field: string;
  message: string;
}

// Form state
export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isSubmitting: boolean;
  isDirty: boolean;
}

// API response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
