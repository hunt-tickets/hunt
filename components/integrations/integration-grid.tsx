"use client";

import { useCallback } from "react";
import { IntegrationCard } from "./integration-card";
import { CATEGORY_CONFIG } from "@/lib/integrations/data";
import { getCategoryOrder } from "@/lib/integrations/utils";
import type { GroupedIntegrations, Integration } from "@/lib/integrations/types";

interface IntegrationGridProps {
  groupedIntegrations: GroupedIntegrations;
  onInstall?: (integration: Integration) => void;
  onConfigure?: (integration: Integration) => void;
}

export function IntegrationGrid({
  groupedIntegrations,
  onInstall,
  onConfigure,
}: IntegrationGridProps) {
  const categoryOrder = getCategoryOrder();

  const handleInstall = useCallback(
    (integration: Integration) => {
      onInstall?.(integration);
    },
    [onInstall]
  );

  const handleConfigure = useCallback(
    (integration: Integration) => {
      onConfigure?.(integration);
    },
    [onConfigure]
  );

  return (
    <div className="space-y-6 sm:space-y-10">
      {categoryOrder.map((categoryKey) => {
        const category = CATEGORY_CONFIG[categoryKey];
        const categoryIntegrations = groupedIntegrations[categoryKey];

        if (!categoryIntegrations || categoryIntegrations.length === 0) return null;

        return (
          <section key={categoryKey} className="space-y-3 sm:space-y-4">
            {/* Category Header */}
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              {category.name}
            </h2>

            {/* Integrations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {categoryIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onInstall={handleInstall}
                  onConfigure={handleConfigure}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
