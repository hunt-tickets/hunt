import {
  DUMMY_EVENTS,
  DUMMY_VENUES,
  DUMMY_PRODUCERS,
  DUMMY_PROFILES,
  DUMMY_TRANSACTIONS,
  DUMMY_CITIES,
  DUMMY_TICKETS,
  CURRENT_USER,
} from "@/lib/dummy-data";

/**
 * Mock database helpers
 * These replace Supabase database queries with functions that return dummy data
 */

// Events
export async function getAllActiveEvents(cityId?: string) {
  return {
    data: DUMMY_EVENTS,
    error: null,
  };
}

export async function getEventById(eventId: string) {
  const event = DUMMY_EVENTS.find((e) => e.id === eventId);
  return {
    data: event || null,
    error: event ? null : { message: "Event not found" },
  };
}

export async function getPopularEvents() {
  return {
    data: DUMMY_EVENTS.slice(0, 3),
    error: null,
  };
}

// Venues
export async function getAllVenues() {
  return {
    data: DUMMY_VENUES,
    error: null,
  };
}

export async function getVenueById(venueId: string) {
  const venue = DUMMY_VENUES.find((v) => v.id === venueId);
  return {
    data: venue || null,
    error: venue ? null : { message: "Venue not found" },
  };
}

// Cities
export async function getCities() {
  return {
    data: DUMMY_CITIES,
    error: null,
  };
}

// Producers
export async function getAllProducers() {
  return {
    data: DUMMY_PRODUCERS,
    error: null,
  };
}

export async function getProducerById(producerId: string) {
  const producer = DUMMY_PRODUCERS.find((p) => p.id === producerId);
  return {
    data: producer || null,
    error: producer ? null : { message: "Producer not found" },
  };
}

// Profiles
export async function getProfileById(userId: string) {
  const profile = DUMMY_PROFILES.find((p) => p.id === userId);
  return {
    data: profile || CURRENT_USER,
    error: null,
  };
}

export async function getAllUsers(page: number = 1, perPage: number = 1000) {
  return {
    data: DUMMY_PROFILES,
    error: null,
    count: DUMMY_PROFILES.length,
  };
}

export async function updateProfile(userId: string, data: any) {
  return {
    data: { ...CURRENT_USER, ...data },
    error: null,
  };
}

// Tickets
export async function getTicketsByEventId(eventId: string) {
  const tickets = DUMMY_TICKETS.filter((t) => t.event_id === eventId);
  return {
    data: tickets,
    error: null,
  };
}

export async function getTicketById(ticketId: string) {
  const ticket = DUMMY_TICKETS.find((t) => t.id === ticketId);
  return {
    data: ticket || null,
    error: ticket ? null : { message: "Ticket not found" },
  };
}

// Transactions
export async function getTransactionsByUserId(userId: string) {
  const transactions = DUMMY_TRANSACTIONS.filter((t) => t.user_id === userId);
  return {
    data: transactions,
    error: null,
  };
}

export async function getTransactionsByEventId(eventId: string) {
  // Find tickets for this event and then find transactions for those tickets
  const eventTickets = DUMMY_TICKETS.filter((t) => t.event_id === eventId);
  const ticketIds = eventTickets.map((t) => t.id);
  const transactions = DUMMY_TRANSACTIONS.filter((t) =>
    ticketIds.includes(t.ticket_id)
  );
  return {
    data: transactions,
    error: null,
  };
}

export async function createTransaction(data: any) {
  const newTransaction = {
    id: `tx-${Date.now()}`,
    ...data,
    created_at: new Date().toISOString(),
  };
  return {
    data: newTransaction,
    error: null,
  };
}

// Generic query builder mock (for components that use .from().select() pattern)
export function createMockQueryBuilder() {
  return {
    from: (table: string) => ({
      select: (columns?: string) => ({
        eq: (column: string, value: any) => ({
          data: [],
          error: null,
        }),
        in: (column: string, values: any[]) => ({
          data: [],
          error: null,
        }),
        single: () => ({
          data: null,
          error: null,
        }),
      }),
      insert: (data: any) => ({
        select: () => ({
          data: [data],
          error: null,
        }),
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => ({
            data: [data],
            error: null,
          }),
        }),
      }),
      delete: () => ({
        eq: (column: string, value: any) => ({
          data: null,
          error: null,
        }),
      }),
    }),
    rpc: (functionName: string, params?: any) => ({
      data: null,
      error: null,
    }),
  };
}

// RPC function mocks
export async function callRPC(functionName: string, params: any = {}) {
  console.log(`Mock RPC call: ${functionName}`, params);

  // Return appropriate mock data based on function name
  switch (functionName) {
    case "create_transaction_web":
      return {
        data: {
          id: `tx-${Date.now()}`,
          ...params,
        },
        error: null,
      };
    case "purchase_tickets":
      return {
        data: { success: true },
        error: null,
      };
    case "cancel_order":
      return {
        data: { success: true },
        error: null,
      };
    case "get_all_events_ordered":
      return {
        data: DUMMY_EVENTS,
        error: null,
      };
    default:
      return {
        data: null,
        error: null,
      };
  }
}
