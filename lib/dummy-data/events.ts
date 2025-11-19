import { DUMMY_VENUES } from "./venues";
import { DUMMY_PRODUCERS } from "./producers";

export const DUMMY_EVENTS = [
  {
    id: "event-1",
    name: "Festival de Rock 2025",
    description: "El festival de rock más grande de Colombia con las mejores bandas internacionales",
    date: "2025-12-15T20:00:00Z",
    end_date: "2025-12-16T04:00:00Z",
    status: "active",
    flyer: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=800",
    venue_id: "venue-1",
    age: 18,
    variable_fee: 10,
    fixed_fee: 5000,
    priority: 1,
    faqs: [
      {
        question: "¿Cuál es la edad mínima?",
        answer: "18 años. Se requiere documento de identidad."
      },
      {
        question: "¿Hay parqueadero?",
        answer: "Sí, el venue cuenta con parqueadero disponible."
      }
    ],
    venues: DUMMY_VENUES[0],
    producers: [DUMMY_PRODUCERS[0]],
    tickets: [
      {
        id: "ticket-1",
        price: 150000,
        name: "General",
        description: "Acceso general al evento",
        event_id: "event-1",
      },
      {
        id: "ticket-2",
        price: 250000,
        name: "VIP",
        description: "Acceso VIP con zona especial",
        event_id: "event-1",
      },
    ],
  },
  {
    id: "event-2",
    name: "Noche Electrónica",
    description: "Los mejores DJs de música electrónica en una noche inolvidable",
    date: "2025-11-28T22:00:00Z",
    end_date: "2025-11-29T05:00:00Z",
    status: "active",
    flyer: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800",
    venue_id: "venue-2",
    age: 21,
    variable_fee: 8,
    fixed_fee: 3000,
    priority: 2,
    faqs: [],
    venues: DUMMY_VENUES[1],
    producers: [DUMMY_PRODUCERS[2]],
    tickets: [
      {
        id: "ticket-3",
        price: 80000,
        name: "Early Bird",
        description: "Precio especial anticipado",
        event_id: "event-2",
      },
      {
        id: "ticket-4",
        price: 120000,
        name: "General",
        description: "Acceso general al evento",
        event_id: "event-2",
      },
    ],
  },
  {
    id: "event-3",
    name: "Concierto Sinfónico",
    description: "Orquesta Filarmónica en concierto especial",
    date: "2025-12-20T19:00:00Z",
    end_date: "2025-12-20T22:00:00Z",
    status: "active",
    flyer: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=800",
    venue_id: "venue-3",
    age: null,
    variable_fee: 5,
    fixed_fee: 2000,
    priority: 3,
    faqs: [],
    venues: DUMMY_VENUES[2],
    producers: [DUMMY_PRODUCERS[1]],
    tickets: [
      {
        id: "ticket-5",
        price: 50000,
        name: "Platea",
        description: "Platea general",
        event_id: "event-3",
      },
      {
        id: "ticket-6",
        price: 100000,
        name: "Palco",
        description: "Palco preferencial",
        event_id: "event-3",
      },
    ],
  },
];

export const DUMMY_TICKETS = DUMMY_EVENTS.flatMap(event => event.tickets);
