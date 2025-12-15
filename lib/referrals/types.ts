/**
 * Type definitions for the Referrals, Rebates, and Payments system
 *
 * This file contains all TypeScript interfaces and types used across
 * the referrals feature to ensure type safety and consistency.
 */

// ============================================================================
// REFERRALS TYPES
// ============================================================================

export type ReferralStatus = 'Activo' | 'Inactivo';

export interface ReferredProducer {
  id: string;
  name: string;
  joinDate: string; // ISO date string
  status: ReferralStatus;
  eventsCreated: number;
  yourEarnings: number;
}

export interface ReferralStats {
  totalReferrals: number;
  activeProducers: number;
  totalEarnings: number;
  pendingEarnings: number;
}

export interface ReferralData {
  referralCode: string;
  baseUrl: string;
  huntCommissionRate: number;
  referralCommissionRate: number;
  stats: ReferralStats;
  referredProducers: ReferredProducer[];
}

// ============================================================================
// PAYMENTS TYPES
// ============================================================================

export type PaymentStatus = 'En Curso' | 'Pagado' | 'Pendiente' | 'Fallido';

export interface BillingCycle {
  cutoffDate: string; // ISO date string (YYYY-MM-DD)
  paymentDate: string; // ISO date string (YYYY-MM-DD)
  estimatedAmount?: number;
  amount?: number;
  status: PaymentStatus;
  period: string; // e.g., "Diciembre 2024"
}

export interface PaymentRecord {
  id: string;
  cutoffDate: string; // ISO date string
  paymentDate: string; // ISO date string
  amount: number;
  status: PaymentStatus;
  period: string;
}

export interface PaymentStats {
  totalPaid: number;
  nextPaymentAmount: number;
  averagePayment: number;
}

export interface PaymentData {
  currentBillingCycle: BillingCycle;
  nextBillingCycle: Omit<BillingCycle, 'estimatedAmount' | 'amount' | 'status'>;
  paymentHistory: PaymentRecord[];
  stats: PaymentStats;
}

// ============================================================================
// REBATE TYPES
// ============================================================================

export type RebateStatus = 'Aplicado' | 'Pendiente' | 'Procesando';

export interface RebateRecord {
  id: string;
  eventName: string;
  eventDate: string; // ISO date string
  ticketsSold: number;
  totalRevenue: number;
  rebatePercentage: number;
  rebateAmount: number;
  status: RebateStatus;
  period: string;
}

export interface RebateStats {
  totalRebate: number;
  totalRevenue: number;
  totalTickets: number;
  averageRebate: number;
  rebatePercentage: number;
}

export interface RebatePeriod {
  cutoffDate: string; // ISO date string
  period: string;
  estimatedRebate: number;
  activeEvents: number;
}

export interface RebateData {
  currentPeriod: RebatePeriod;
  rebateHistory: RebateRecord[];
  stats: RebateStats;
}

// ============================================================================
// CHART TYPES
// ============================================================================

export interface ChartDataPoint {
  month: string;
  amount: number;
  isEstimated?: boolean;
}

export type TimeRange = '3' | '6' | '12';

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface ReferralTabsProps {
  userId: string;
}

export interface ReferralAdminContentProps {
  userId: string;
  data?: ReferralData; // Optional for testing/mock data injection
}

export interface PaymentsContentProps {
  userId: string;
  data?: PaymentData; // Optional for testing/mock data injection
}

export interface RebateContentProps {
  userId: string;
  data?: RebateData; // Optional for testing/mock data injection
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface ApiResponse<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface CommissionRates {
  HUNT_BASE_RATE: number;
  REFERRAL_RATE: number;
  REBATE_RATE: number;
}

export interface PaymentSchedule {
  cutoffDay: 'last'; // Last day of month
  paymentDelay: number; // Days after cutoff (calculated as first business day)
}

export interface ReferralConfig {
  baseUrl: string;
  signUpPath: string;
  paymentSchedule: PaymentSchedule;
  commissionRates: CommissionRates;
}
