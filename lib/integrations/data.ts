/**
 * Integration Data Configuration
 * Available integrations and their metadata
 */

import type { Integration, CategoryConfig } from "./types";
import { INTEGRATION_CATEGORIES } from "@/constants/integrations";
import { CreditCard, Webhook } from "lucide-react";

// Category Configuration
export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  [INTEGRATION_CATEGORIES.PAYMENT]: {
    name: "Pasarelas de Pago",
    icon: CreditCard,
    color: "text-green-600 dark:text-green-400",
  },
  [INTEGRATION_CATEGORIES.WEBHOOKS]: {
    name: "WebHooks",
    icon: Webhook,
    color: "text-purple-600 dark:text-purple-400",
  },
};

// Available Integrations
export const INTEGRATIONS: Integration[] = [
  // MERCADO PAGO
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Acepta pagos en efectivo, transferencias y tarjetas con la pasarela líder en Latinoamérica.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Mercado_Pago_logo.svg/2560px-Mercado_Pago_logo.svg.png",
    status: "available",
    category: INTEGRATION_CATEGORIES.PAYMENT,
    website: "https://mercadopago.com",
    documentationUrl: "https://www.mercadopago.com.co/developers",
  },

  // WEBHOOKS
  {
    id: "webhooks",
    name: "WebHooks",
    description: "Recibe notificaciones en tiempo real sobre eventos importantes como ventas, check-ins y cancelaciones.",
    logo: "https://cdn-icons-png.flaticon.com/512/1160/1160358.png",
    status: "available",
    category: INTEGRATION_CATEGORIES.WEBHOOKS,
    documentationUrl: "https://docs.hunt-tickets.com/webhooks",
  },
];

// Get integrations by category
export function getIntegrationsByCategory(category: string): Integration[] {
  return INTEGRATIONS.filter((integration) => integration.category === category);
}

// Get integration by ID
export function getIntegrationById(id: string): Integration | undefined {
  return INTEGRATIONS.find((integration) => integration.id === id);
}

// Get available integrations (not coming soon)
export function getAvailableIntegrations(): Integration[] {
  return INTEGRATIONS.filter((integration) => integration.status === "available");
}
