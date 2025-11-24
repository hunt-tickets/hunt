import type { Event } from "@/lib/schema";

/**
 * Mock Database for Development
 *
 * This file provides mock data and database functions for development/testing.
 * In production, these would be replaced with actual database queries.
 */

// Mock event type that extends Event with display properties
// Exported for use in components that display events with venue information
export type MockEvent = Event & {
  // Additional flattened venue information for display
  venue_name: string;
  venue_logo: string;
  venue_city: string;
  venue_address: string;
  venue_latitude: number;
  venue_longitude: number;
  venue_google_maps_link?: string;
  venue_google_website_url?: string;
  venue_google_phone_number?: string;
  venue_google_avg_rating?: string;
  venue_google_total_reviews?: string;
  venue_ai_description?: string;
  // Display helpers for date/time
  hour: string;
  end_hour: string;
  // Mock tickets array
  tickets: MockTicket[];
};

// Mock ticket type - aligned with TicketType from schema
// Exported for use in components that display ticket information
export interface MockTicket {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  price: string;
  capacity: number;
  soldCount: number;
  reservedCount: number;
  minPerOrder: number;
  maxPerOrder: number;
  saleStart: Date | null;
  saleEnd: Date | null;
  createdAt: Date;
  updatedAt: Date | null;
}

// Local type definition for payment data
interface PaymentData {
  id: string;
  eventId?: string;
  userId?: string;
  amount?: number;
  status?: string;
  createdAt?: string;
  order?: string;
  [key: string]: unknown; // Allow additional properties
}

// Mock Tickets
const createMockTickets = (eventId: string): MockTicket[] => [
  {
    id: `${eventId}-ticket-1`,
    eventId,
    name: "General",
    price: "50000",
    description: "Acceso general al evento",
    capacity: 500,
    soldCount: 0,
    reservedCount: 0,
    minPerOrder: 1,
    maxPerOrder: 10,
    saleStart: null,
    saleEnd: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: null,
  },
  {
    id: `${eventId}-ticket-2`,
    eventId,
    name: "VIP",
    price: "120000",
    description: "Acceso VIP con área exclusiva y bebidas incluidas",
    capacity: 100,
    soldCount: 0,
    reservedCount: 0,
    minPerOrder: 1,
    maxPerOrder: 10,
    saleStart: null,
    saleEnd: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: null,
  },
  {
    id: `${eventId}-ticket-3`,
    eventId,
    name: "Preventa",
    price: "35000",
    description: "Preventa limitada - Acceso general",
    capacity: 200,
    soldCount: 0,
    reservedCount: 0,
    minPerOrder: 1,
    maxPerOrder: 10,
    saleStart: null,
    saleEnd: null,
    createdAt: new Date("2025-01-01"),
    updatedAt: null,
  },
];

// Mock Events
const mockEvents: MockEvent[] = [
  {
    // Required Event fields
    id: "event-1",
    organizationId: "mock-org-1",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    name: "Neon Nights Festival",
    description:
      "Una experiencia única de música electrónica con los mejores DJs internacionales. Prepárate para una noche inolvidable de luces, sonido y energía.",
    date: new Date("2025-12-15T22:00:00Z"),
    endDate: new Date("2025-12-16T06:00:00Z"),
    status: true,
    city: "Bogotá",
    country: "Colombia",
    flyer:
      "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1200&fit=crop",
    venueId: "venue-1",
    variableFee: "0.08",
    fixedFee: null,
    age: "18",
    cash: false,
    extraInfo: null,
    ics: null,
    flyerApple: null,
    flyerGoogle: null,
    flyerOverlay: null,
    flyerBackground: null,
    flyerBanner: null,
    posFee: null,
    hex: null,
    priority: false,
    hexText: null,
    guestList: false,
    privateList: false,
    accessPass: false,
    guestListMaxHour: null,
    guestListQuantity: null,
    guestListInfo: null,
    hexTextSecondary: "A3A3A3",
    lateFee: null,
    guestEmail: null,
    guestName: null,
    faqs: null,
    // Display properties
    hour: "22:00",
    end_hour: "06:00",
    venue_name: "Club Octagon",
    venue_logo:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop",
    venue_city: "Bogotá",
    venue_address: "Calle 85 #12-50, Bogotá",
    venue_latitude: 4.6793,
    venue_longitude: -74.0466,
    venue_google_maps_link: "https://maps.google.com/?q=4.6793,-74.0466",
    tickets: createMockTickets("event-1"),
  },
];

// Mock Transactions Store (in-memory)
const mockTransactions: PaymentData[] = [];

/**
 * Get popular events (mock implementation)
 * Returns a list of popular events
 */
export async function getPopularEvents() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    data: mockEvents,
    error: null,
  };
}

/**
 * Get all active events (mock implementation)
 * Returns all events that haven't ended yet
 */
export async function getAllActiveEvents() {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const now = new Date();
  const activeEvents = mockEvents.filter((event) => {
    return event.endDate && event.endDate >= now;
  });

  return {
    data: activeEvents,
    error: null,
  };
}

/**
 * Get event by ID (mock implementation)
 */
export async function getEventById(id: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const event = mockEvents.find((e) => e.id === id);

  return {
    data: event || null,
    error: event ? null : { message: "Event not found" },
  };
}

/**
 * Get ticket by ID (mock implementation)
 */
export async function getTicketById(id: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Search through all events for the ticket
  for (const event of mockEvents) {
    const ticket = event.tickets.find((t: MockTicket) => t.id === id);
    if (ticket) {
      return {
        data: { ...ticket, event_id: event.id },
        error: null,
      };
    }
  }

  return {
    data: null,
    error: { message: "Ticket not found" },
  };
}

/**
 * Create transaction (mock implementation)
 * Stores transaction in memory
 */
export async function createTransaction(transaction: Omit<PaymentData, "id">) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const newTransaction: PaymentData = {
    ...transaction,
    id: `txn-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
  };

  mockTransactions.push(newTransaction);

  return {
    data: newTransaction,
    error: null,
  };
}

/**
 * Get transactions by order ID (mock implementation)
 */
export async function getTransactionsByOrder(orderId: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 50));

  const transactions = mockTransactions.filter((t) => t.order === orderId);

  return {
    data: transactions,
    error: null,
  };
}

/**
 * Update transaction status (mock implementation)
 */
export async function updateTransactionStatus(orderId: string, status: string) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 50));

  const transactions = mockTransactions.filter((t) => t.order === orderId);

  if (transactions.length === 0) {
    return {
      data: null,
      error: { message: "Transaction not found" },
    };
  }

  transactions.forEach((t) => {
    t.status = status;
  });

  return {
    data: transactions,
    error: null,
  };
}
