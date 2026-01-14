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
    logo: "/mercadopago-logo.webp",
    status: "available",
    category: INTEGRATION_CATEGORIES.PAYMENT,
    website: "https://mercadopago.com",
    documentationUrl: "https://www.mercadopago.com.co/developers",
  },

  // ZAPIER
  {
    id: "zapier",
    name: "Zapier",
    description: "Conecta Hunt Tickets con más de 5,000 aplicaciones y automatiza tus flujos de trabajo sin código.",
    logo: "https://cdn.zapier.com/zapier/images/logos/zapier-logomark.png",
    status: "available",
    category: INTEGRATION_CATEGORIES.WEBHOOKS,
    documentationUrl: "https://zapier.com/apps/hunt-tickets/integrations",
  },

  // N8N
  {
    id: "n8n",
    name: "n8n",
    description: "Automatización de código abierto y self-hosted. Crea workflows personalizados con control total de tus datos.",
    logo: "https://n8n.io/favicon.ico",
    status: "available",
    category: INTEGRATION_CATEGORIES.WEBHOOKS,
    website: "https://n8n.io",
    documentationUrl: "https://docs.n8n.io",
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
