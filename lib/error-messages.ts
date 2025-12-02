/**
 * Translates database/API error messages to user-friendly Spanish messages
 */

const errorTranslations: Record<string, string> = {
  // Reservation errors
  "User not found": "Usuario no encontrado",
  "Event not found or inactive": "Evento no encontrado o no está activo",
  "No items provided for reservation": "No se seleccionaron tickets",
  "Ticket type not found": "Tipo de ticket no encontrado",
  "Reservation not found": "Reservación no encontrada",
  "Reservation not found or unauthorized":
    "Reservación no encontrada o no autorizada",
  "Reservation is not active": "La reservación no está activa",
  "Reservation has expired": "La reservación ha expirado",

  // Order errors
  "Order not found": "Orden no encontrada",
  "Can only refund paid orders": "Solo se pueden reembolsar órdenes pagadas",
  "Can only cancel active reservations":
    "Solo se pueden cancelar reservaciones activas",

  // Auth errors
  "Debes iniciar sesión para continuar": "Debes iniciar sesión para continuar",
  "El carrito está vacío": "El carrito está vacío",
  "Evento no encontrado": "Evento no encontrado",

  // Cash sale errors
  "Email del comprador requerido": "Email del comprador requerido",
  "No se seleccionaron tickets": "No se seleccionaron tickets",
  "No existe un usuario con ese email": "No existe un usuario con ese email",
  "No tienes permisos para vender tickets de este evento":
    "No tienes permisos para vender tickets de este evento",
};

// Patterns for dynamic error messages
const errorPatterns: Array<{
  pattern: RegExp;
  translate: (match: RegExpMatchArray) => string;
}> = [
  {
    pattern: /Maximum order quantity for "(.+)" is (\d+)/,
    translate: (match) =>
      `La cantidad máxima para "${match[1]}" es ${match[2]}`,
  },
  {
    pattern: /Minimum order quantity for "(.+)" is (\d+)/,
    translate: (match) =>
      `La cantidad mínima para "${match[1]}" es ${match[2]}`,
  },
  {
    pattern:
      /Insufficient tickets available for "(.+)"\. Requested: (\d+), Available: (\d+)/,
    translate: (match) =>
      `No hay suficientes tickets para "${match[1]}". Solicitaste ${match[2]}, pero solo hay ${match[3]} disponibles`,
  },
  {
    pattern: /Ticket type "(.+)" is not available for sale at this time/,
    translate: (match) =>
      `El ticket "${match[1]}" no está disponible para venta en este momento`,
  },
  {
    pattern: /Invalid quantity: .+ for ticket type .+/,
    translate: () => "Cantidad inválida para el tipo de ticket",
  },
  {
    pattern: /Reservation is not active\. Status: (.+)/,
    translate: (match) => `La reservación no está activa. Estado: ${match[1]}`,
  },
  {
    pattern: /Can only cancel active reservations\. Current status: (.+)/,
    translate: (match) =>
      `Solo se pueden cancelar reservaciones activas. Estado actual: ${match[1]}`,
  },
  {
    pattern: /Can only refund paid orders\. Current status: (.+)/,
    translate: (match) =>
      `Solo se pueden reembolsar órdenes pagadas. Estado actual: ${match[1]}`,
  },
  {
    pattern: /Reservation has expired at .+/,
    translate: () => "La reservación ha expirado. Por favor, intenta de nuevo.",
  },
];

export function translateError(error: string): string {
  // Check exact matches first
  if (errorTranslations[error]) {
    return errorTranslations[error];
  }

  // Check patterns
  for (const { pattern, translate } of errorPatterns) {
    const match = error.match(pattern);
    if (match) {
      return translate(match);
    }
  }

  // Return original if no translation found
  return error;
}
