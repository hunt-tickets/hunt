export const EVENT_CATEGORIES = [
  "musica",
  "deportes",
  "gastronomia",
  "rumba",
  "familiar",
  "arte",
  "aire_libre",
  "bienestar",
  "negocios",
  "educacion",
  "mercados",
  "otro",
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  musica: "Música",
  deportes: "Deportes",
  gastronomia: "Gastronomía",
  rumba: "Rumba",
  familiar: "Familiar",
  arte: "Arte",
  aire_libre: "Aire Libre",
  bienestar: "Bienestar",
  negocios: "Negocios",
  educacion: "Educación",
  mercados: "Mercados",
  otro: "Otro",
};
