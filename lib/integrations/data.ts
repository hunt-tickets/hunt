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

  // WEBHOOKS
  {
    id: "webhooks",
    name: "WebHooks",
    description: "Recibe notificaciones en tiempo real sobre eventos importantes como ventas, check-ins y cancelaciones.",
    logo: "https://cdn-icons-png.flaticon.com/512/2165/2165004.png",
    status: "available",
    category: INTEGRATION_CATEGORIES.WEBHOOKS,
    documentationUrl: "https://docs.hunt-tickets.com/webhooks",
  },

  // COMING SOON - Google Analytics
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Rastrea el comportamiento de usuarios y mide el rendimiento de tus eventos.",
    logo: "https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg",
    status: "coming-soon",
    category: INTEGRATION_CATEGORIES.WEBHOOKS,
    website: "https://analytics.google.com",
  },

  // COMING SOON - Meta Pixel
  {
    id: "meta-pixel",
    name: "Meta Pixel",
    description: "Optimiza tus campañas publicitarias en Facebook e Instagram con tracking avanzado.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    status: "coming-soon",
    category: INTEGRATION_CATEGORIES.WEBHOOKS,
    website: "https://business.facebook.com",
  },

  // COMING SOON - Mailchimp
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Sincroniza tus compradores y envía campañas de email marketing personalizadas.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Mailchimp_Logo.svg/2560px-Mailchimp_Logo.svg.png",
    status: "coming-soon",
    category: INTEGRATION_CATEGORIES.WEBHOOKS,
    website: "https://mailchimp.com",
  },

  // COMING SOON - WhatsApp Business
  {
    id: "whatsapp-business",
    name: "WhatsApp Business",
    description: "Envía confirmaciones de compra y notificaciones de eventos directamente por WhatsApp.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    status: "coming-soon",
    category: INTEGRATION_CATEGORIES.WEBHOOKS,
    website: "https://business.whatsapp.com",
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
