/**
 * Mock data for development and testing
 * WARNING: This file should NOT be imported in production code
 * Use data-source.ts instead
 */

import type { User, UserTransaction } from "./types/user";

export const MOCK_USERS: User[] = [
  {
    id: "user-1",
    name: "María",
    lastName: "García",
    email: "maria@example.com",
    phone: "300 123 4567",
    birthdate: "1995-06-15",
    gender: "Femenino",
    prefix: "+57",
    document_id: "1234567890",
    created_at: "2025-01-15T10:30:00Z",
    marketing_emails: true,
  },
  {
    id: "user-2",
    name: "Carlos",
    lastName: "Rodríguez",
    email: "carlos@example.com",
    phone: "301 234 5678",
    birthdate: "1988-03-22",
    gender: "Masculino",
    prefix: "+57",
    document_id: "9876543210",
    created_at: "2025-01-10T08:20:00Z",
    marketing_emails: false,
  },
  {
    id: "user-3",
    name: "Ana",
    lastName: "López",
    email: "ana@example.com",
    phone: null,
    birthdate: "2000-11-30",
    gender: "Femenino",
    prefix: null,
    document_id: null,
    created_at: "2025-01-20T14:15:00Z",
    marketing_emails: true,
  },
];

export const MOCK_TRANSACTIONS: UserTransaction[] = [
  {
    id: "tx-1",
    event_name: "Festival de Música 2025",
    ticket_name: "Entrada General",
    quantity: 2,
    total: 150000,
    source: "web",
    created_at: "2025-01-15T10:30:00Z",
  },
  {
    id: "tx-2",
    event_name: "Concierto Rock en Vivo",
    ticket_name: "VIP Premium",
    quantity: 1,
    total: 250000,
    source: "app",
    created_at: "2025-01-10T18:45:00Z",
  },
  {
    id: "tx-3",
    event_name: "Teatro Nacional",
    ticket_name: "Platea",
    quantity: 3,
    total: 180000,
    source: "cash",
    created_at: "2024-12-20T14:20:00Z",
  },
];
