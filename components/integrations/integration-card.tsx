"use client";

import { useCallback } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BUTTON_LABELS, ARIA_LABELS } from "@/constants/integrations";
import { getStatusBadgeConfig } from "@/lib/integrations/utils";
import type { IntegrationCardProps } from "@/lib/integrations/types";

export function IntegrationCard({
  integration,
  onDetails,
  onInstall,
  onConfigure,
}: IntegrationCardProps) {
  const isComingSoon = integration.status === "coming-soon";
  const isConnected = integration.status === "connected";
  const badgeConfig = getStatusBadgeConfig(integration.status);

  const handleConnect = useCallback(() => {
    if (isConnected) {
      onConfigure?.(integration);
    } else {
      onInstall?.(integration);
    }
  }, [integration, isConnected, onInstall, onConfigure]);

  return (
    <Card
      className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all group"
      role="article"
      aria-label={`${ARIA_LABELS.CARD_PREFIX} ${integration.name}`}
    >
      <CardContent className="p-5 sm:p-6 flex flex-col h-full">
        <div className="flex flex-col items-center text-center space-y-4 flex-1">
          {/* Logo */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-white/[0.08] ring-1 ring-gray-200 dark:ring-white/10 group-hover:scale-105 transition-transform flex items-center justify-center p-4 sm:p-5">
            <Image
              src={integration.logo}
              alt={`${integration.name} logo`}
              width={96}
              height={96}
              className="object-contain"
              unoptimized
              loading="lazy"
            />
          </div>

          {/* Name */}
          <div className="flex-1 flex flex-col justify-center">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {integration.name}
            </h3>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 leading-relaxed line-clamp-3">
            {integration.description}
          </p>

          {/* Action Button */}
          <Button
            onClick={handleConnect}
            disabled={isComingSoon}
            className={`w-full h-10 sm:h-11 text-sm font-medium rounded-full transition-all ${
              isConnected
                ? "bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 text-white"
                : "bg-primary hover:bg-primary/90 text-primary-foreground"
            }`}
            aria-label={`${isConnected ? ARIA_LABELS.CONNECTED_BUTTON : ARIA_LABELS.CONNECT_BUTTON} ${integration.name}`}
          >
            {isConnected ? BUTTON_LABELS.CONNECTED : BUTTON_LABELS.CONNECT}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
