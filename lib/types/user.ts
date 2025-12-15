/**
 * Shared user types across the application
 * Single source of truth for user-related interfaces
 */

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
