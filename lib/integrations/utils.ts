/**
 * Integration Utility Functions
 * Helper functions for integration management
 */

import type { Integration, GroupedIntegrations, IntegrationCategory } from "./types";
import { INTEGRATION_CATEGORIES } from "@/constants/integrations";

/**
 * Filter integrations by search query
 * Searches in name and description
 */
export function filterIntegrations(integrations: Integration[], query: string): Integration[] {
  if (!query.trim()) return integrations;

  const lowerQuery = query.toLowerCase().trim();
  return integrations.filter(
    (integration) =>
      integration.name.toLowerCase().includes(lowerQuery) ||
      integration.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Group integrations by category
 */
export function groupIntegrationsByCategory(integrations: Integration[]): GroupedIntegrations {
  const grouped: GroupedIntegrations = {
    payment: [],
    webhooks: [],
  };

  integrations.forEach((integration) => {
    grouped[integration.category].push(integration);
  });

  return grouped;
}

/**
 * Check if grouped integrations have any results
 */
export function hasGroupedResults(grouped: GroupedIntegrations): boolean {
  return Object.values(grouped).some((group) => group.length > 0);
}

/**
 * Get integration status badge configuration
 */
export function getStatusBadgeConfig(status: string): {
  text: string;
  className: string;
} {
  switch (status) {
    case "connected":
      return {
        text: "Conectado",
        className:
          "bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20",
      };
    case "coming-soon":
      return {
        text: "Próximamente",
        className:
          "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20",
      };
    case "available":
      return {
        text: "Disponible",
        className:
          "bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20",
      };
    default:
      return {
        text: "Desconocido",
        className:
          "bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-500/20",
      };
  }
}

/**
 * Get category order for display
 */
export function getCategoryOrder(): IntegrationCategory[] {
  return [INTEGRATION_CATEGORIES.PAYMENT, INTEGRATION_CATEGORIES.WEBHOOKS];
}
