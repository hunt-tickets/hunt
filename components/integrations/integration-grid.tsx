"use client";

import { useCallback } from "react";
import { IntegrationCard } from "./integration-card";
import { IntegrationComingSoonCard } from "./integration-coming-soon-card";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
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

      {/* Coming Soon Card */}
      <Card className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 border-dashed">
        <CardContent className="p-5 sm:p-6 flex flex-col h-full">
          <div className="flex flex-col items-center text-center space-y-4 flex-1 justify-center min-h-[280px]">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center">
              <Plus className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 dark:text-white/40" />
            </div>
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Próximamente más conexiones
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 leading-relaxed">
                Nuevas integraciones en camino
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
