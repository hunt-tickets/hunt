"use client";

import { useCallback } from "react";
import { IntegrationCard } from "./integration-card";
import { IntegrationComingSoonCard } from "./integration-coming-soon-card";
import type { Integration } from "@/lib/integrations/types";

interface IntegrationGridProps {
  integrations: Integration[];
  onInstall?: (integration: Integration) => void;
  onConfigure?: (integration: Integration) => void;
}

export function IntegrationGrid({
  integrations,
  onInstall,
  onConfigure,
}: IntegrationGridProps) {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {integrations.map((integration) => {
        if (integration.status === "coming-soon") {
          return <IntegrationComingSoonCard key={integration.id} integration={integration} />;
        }

        return (
          <IntegrationCard
            key={integration.id}
            integration={integration}
            onInstall={handleInstall}
            onConfigure={handleConfigure}
          />
        );
      })}
    </div>
  );
}
