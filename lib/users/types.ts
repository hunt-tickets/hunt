/**
 * Type definitions for the Users Management System
 *
 * This file contains all TypeScript interfaces and types used across
 * the users feature to ensure type safety and consistency.
 */

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  name: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  birthdate: string | null;
  gender: string | null;
  prefix: string | null;
  document_id: string | null;
  created_at: string;
  marketing_emails?: boolean;
  admin?: boolean;
}

export interface UserTransaction {
  id: string;
  event_name: string;
  ticket_name: string;
  quantity: number;
  total: number;
  source: 'web' | 'app' | 'cash';
  created_at: string;
}

export interface UserWithTransactions extends User {
  transactions?: UserTransaction[];
  totalSpent?: number;
  totalTickets?: number;
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface UsersTableProps {
  users: User[];
  organizationId: string;
}

export interface UserProfileSheetProps {
  user: UserWithTransactions;
  isOpen: boolean;
  onClose: () => void;
}

export interface EditUserSheetProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
}

export interface UsersGrowthChartProps {
  users: User[];
}

// ============================================================================
// SERVER ACTION TYPES
// ============================================================================

export interface UpdateProfileState {
  success?: boolean;
  error?: string;
}

export interface GetAllUsersResponse {
  users: User[] | null;
  error: string | null;
}

export interface UpdateUserResponse {
  user: User | null;
  error: string | null;
}

export interface DeleteUserResponse {
  success: boolean;
  error: string | null;
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

export interface UserFilters {
  search?: string;
  gender?: string | null;
  admin?: boolean | null;
  hasTransactions?: boolean | null;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserSortOptions {
  field: 'name' | 'email' | 'created_at' | 'totalSpent' | 'totalTickets';
  direction: 'asc' | 'desc';
}

// ============================================================================
// FORM TYPES
// ============================================================================

export interface UserFormData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  prefix: string;
  birthdate: string;
  gender: string;
  document_id: string;
  marketing_emails: boolean;
}

export interface UserValidationErrors {
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  birthdate?: string;
  gender?: string;
  document_id?: string;
}

// ============================================================================
// EXPORT TYPES
// ============================================================================

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  fields: (keyof User)[];
  filters?: UserFilters;
}

export type ExportProgress = {
  status: 'idle' | 'preparing' | 'exporting' | 'completed' | 'error';
  progress: number;
  total: number;
  message?: string;
};

// ============================================================================
// GENDER TYPES
// ============================================================================

export type GenderType = 'Masculino' | 'Femenino' | 'Otro' | 'Prefiero no decir';

export const GENDER_OPTIONS: { value: GenderType; label: string }[] = [
  { value: 'Masculino', label: 'Masculino' },
  { value: 'Femenino', label: 'Femenino' },
  { value: 'Otro', label: 'Otro' },
  { value: 'Prefiero no decir', label: 'Prefiero no decir' },
];

// ============================================================================
// STATISTICS TYPES
// ============================================================================

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersWithPurchases: number;
  totalRevenue: number;
  averageTicketsPerUser: number;
}

export interface UserGrowthDataPoint {
  month: string;
  users: number;
  revenue?: number;
}
