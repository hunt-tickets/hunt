import type { EventFull, Ticket, Producer } from "@/lib/types";

/**
 * Mock Database for Development
 *
 * This file provides mock data and database functions for development/testing.
 * In production, these would be replaced with actual database queries.
 */

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

// Mock Producers
const mockProducers: Producer[] = [
  {
    id: "producer-1",
    name: "Electro Beats",
    description: "Premier electronic music events",
    email: "contact@electrobeats.com",
    phone: "+57 300 123 4567",
    logo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
  },
  {
    id: "producer-2",
    name: "Urban Nights",
    description: "Hip hop and urban music experiences",
    email: "info@urbannights.com",
    phone: "+57 301 234 5678",
    logo: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
  },
  {
    id: "producer-3",
    name: "Rock Legends",
    description: "Rock concerts and festivals",
    email: "hello@rocklegends.com",
    phone: "+57 302 345 6789",
    logo: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop",
  },
];

// Mock Tickets
const createMockTickets = (eventId: string): Ticket[] => [
  {
    id: `${eventId}-ticket-1`,
    name: "General",
    price: 50000,
    description: "Acceso general al evento",
  },
  {
    id: `${eventId}-ticket-2`,
    name: "VIP",
    price: 120000,
    description: "Acceso VIP con área exclusiva y bebidas incluidas",
  },
  {
    id: `${eventId}-ticket-3`,
    name: "Preventa",
    price: 35000,
    description: "Preventa limitada - Acceso general",
  },
];

// Mock Events
const mockEvents: EventFull[] = [
  {
    id: "event-1",
    name: "Neon Nights Festival",
    flyer: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=1200&fit=crop",
    date: "2025-12-15",
    hour: "22:00",
    end_date: "2025-12-16",
    end_hour: "06:00",
    age: 18,
    description: "Una experiencia única de música electrónica con los mejores DJs internacionales. Prepárate para una noche inolvidable de luces, sonido y energía.",
    variable_fee: 0.08,
    venue_id: "venue-1",
    venue_name: "Club Octagon",
    venue_logo: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&h=200&fit=crop",
    venue_city: "Bogotá",
    venue_address: "Calle 85 #12-50, Bogotá",
    venue_latitude: 4.6793,
    venue_longitude: -74.0466,
    venue_google_maps_link: "https://maps.google.com/?q=4.6793,-74.0466",
    producers: [mockProducers[0]],
    tickets: createMockTickets("event-1"),
  },
  {
    id: "event-2",
    name: "Urban Flow Concert",
    flyer: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&h=1200&fit=crop",
    date: "2025-12-20",
    hour: "20:00",
    end_date: "2025-12-21",
    end_hour: "02:00",
    age: 16,
    description: "El mejor hip hop y reggaeton en vivo. Artistas urbanos que están marcando tendencia en la escena musical.",
    variable_fee: 0.08,
    venue_id: "venue-2",
    venue_name: "Teatro Colón",
    venue_logo: "https://images.unsplash.com/photo-1503023345310-bd7c1de61c7d?w=200&h=200&fit=crop",
    venue_city: "Medellín",
    venue_address: "Carrera 43 #6-50, Medellín",
    venue_latitude: 6.2442,
    venue_longitude: -75.5812,
    venue_google_maps_link: "https://maps.google.com/?q=6.2442,-75.5812",
    producers: [mockProducers[1]],
    tickets: createMockTickets("event-2"),
  },
  {
    id: "event-3",
    name: "Rock en el Parque",
    flyer: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=1200&fit=crop",
    date: "2025-12-22",
    hour: "18:00",
    end_date: "2025-12-22",
    end_hour: "23:00",
    age: null,
    description: "Festival de rock al aire libre con bandas locales e internacionales. Un tributo al rock en todas sus formas.",
    variable_fee: 0.08,
    venue_id: "venue-3",
    venue_name: "Parque Simón Bolívar",
    venue_logo: "https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=200&h=200&fit=crop",
    venue_city: "Bogotá",
    venue_address: "Calle 63 #60-00, Bogotá",
    venue_latitude: 4.6558,
    venue_longitude: -74.0928,
    venue_google_maps_link: "https://maps.google.com/?q=4.6558,-74.0928",
    producers: [mockProducers[2]],
    tickets: createMockTickets("event-3"),
  },
  {
    id: "event-4",
    name: "Techno Underground",
    flyer: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=1200&fit=crop",
    date: "2025-12-28",
    hour: "23:00",
    end_date: "2025-12-29",
    end_hour: "08:00",
    age: 21,
    description: "La experiencia techno más auténtica de la ciudad. Para verdaderos amantes del techno underground.",
    variable_fee: 0.08,
    venue_id: "venue-4",
    venue_name: "Industrial Warehouse",
    venue_logo: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=200&h=200&fit=crop",
    venue_city: "Cali",
    venue_address: "Calle 5 #38-00, Cali",
    venue_latitude: 3.4372,
    venue_longitude: -76.5225,
    venue_google_maps_link: "https://maps.google.com/?q=3.4372,-76.5225",
    producers: [mockProducers[0]],
    tickets: createMockTickets("event-4"),
  },
  {
    id: "event-5",
    name: "Salsa Nights",
    flyer: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=1200&fit=crop",
    date: "2025-12-30",
    hour: "21:00",
    end_date: "2025-12-31",
    end_hour: "03:00",
    age: 18,
    description: "Celebra con lo mejor de la salsa. Orquestas en vivo y la mejor pista de baile de la ciudad.",
    variable_fee: 0.08,
    venue_id: "venue-5",
    venue_name: "Zaperoco",
    venue_logo: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=200&h=200&fit=crop",
    venue_city: "Cali",
    venue_address: "Avenida 6 #15-20, Cali",
    venue_latitude: 3.4516,
    venue_longitude: -76.5320,
    venue_google_maps_link: "https://maps.google.com/?q=3.4516,-76.5320",
    producers: [mockProducers[1]],
    tickets: createMockTickets("event-5"),
  },
  {
    id: "event-6",
    name: "Indie Showcase",
    flyer: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?w=800&h=1200&fit=crop",
    date: "2026-01-05",
    hour: "19:00",
    end_date: "2026-01-05",
    end_hour: "23:30",
    age: 16,
    description: "Las mejores bandas indie de la escena local y regional. Apoya el talento emergente.",
    variable_fee: 0.08,
    venue_id: "venue-6",
    venue_name: "El Loft",
    venue_logo: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop",
    venue_city: "Medellín",
    venue_address: "Carrera 70 #44-55, Medellín",
    venue_latitude: 6.2486,
    venue_longitude: -75.5742,
    venue_google_maps_link: "https://maps.google.com/?q=6.2486,-75.5742",
    producers: [mockProducers[2], mockProducers[0]],
    tickets: createMockTickets("event-6"),
  },
  {
    id: "event-7",
    name: "Reggaeton Fiesta",
    flyer: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800&h=1200&fit=crop",
    date: "2026-01-10",
    hour: "22:00",
    end_date: "2026-01-11",
    end_hour: "04:00",
    age: 18,
    description: "El perreo no para. Los mejores exponentes del reggaeton en una sola noche.",
    variable_fee: 0.08,
    venue_id: "venue-7",
    venue_name: "La Reina",
    venue_logo: "https://images.unsplash.com/photo-1598387181032-a3103a2db5b3?w=200&h=200&fit=crop",
    venue_city: "Barranquilla",
    venue_address: "Calle 93 #43-50, Barranquilla",
    venue_latitude: 10.9878,
    venue_longitude: -74.7889,
    venue_google_maps_link: "https://maps.google.com/?q=10.9878,-74.7889",
    producers: [mockProducers[1]],
    tickets: createMockTickets("event-7"),
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
    const eventDate = new Date(event.end_date);
    return eventDate >= now;
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
    const ticket = event.tickets.find((t) => t.id === id);
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
    id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
export async function updateTransactionStatus(
  orderId: string,
  status: string
) {
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
