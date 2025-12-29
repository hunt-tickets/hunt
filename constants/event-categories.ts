export const EVENT_CATEGORIES = [
  "fiestas",
  "conciertos",
  "festivales",
  "bienestar",
  "clases",
  "ferias",
  "deportes",
  "teatro",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  fiestas: "Fiestas",
  conciertos: "Conciertos",
  festivales: "Festivales",
  bienestar: "Bienestar",
  clases: "Clases",
  ferias: "Ferias",
  deportes: "Deportes",
  teatro: "Teatro",
};

export const EVENT_SUBCATEGORIES: Record<EventCategory, string[]> = {
  fiestas: ["Electrónica", "Reggaetón", "Hip-Hop", "Techno", "House", "Latina"],
  conciertos: ["Rock", "Pop", "Jazz", "Clásica", "Indie", "Urbana"],
  festivales: ["Música", "Gastronomía", "Cultura", "Cine", "Arte", "Cerveza"],
  bienestar: ["Yoga", "Meditación", "Spa", "Retiros", "Fitness", "Salud Mental"],
  clases: ["Cocina", "Arte", "Música", "Baile", "Idiomas", "Fotografía"],
  ferias: ["Artesanía", "Emprendedores", "Gastronómica", "Navideña", "Vintage", "Libros"],
  deportes: ["Fútbol", "Running", "Ciclismo", "CrossFit", "Artes Marciales", "Extremos"],
  teatro: ["Obras", "Stand-up", "Musicales", "Danza", "Circo", "Improvisación"],
};
