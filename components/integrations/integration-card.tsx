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

  const handleDetails = useCallback(() => {
    onDetails?.(integration);
  }, [integration, onDetails]);

  const handleInstall = useCallback(() => {
    onInstall?.(integration);
  }, [integration, onInstall]);

  const handleConfigure = useCallback(() => {
    onConfigure?.(integration);
  }, [integration, onConfigure]);

  return (
    <Card
      className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all group"
      role="article"
      aria-label={`${ARIA_LABELS.CARD_PREFIX} ${integration.name}`}
    >
      <CardContent className="p-4 sm:p-6 flex flex-col h-full">
        <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 flex-1">
          {/* Logo */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white dark:bg-white/[0.08] ring-1 ring-gray-200 dark:ring-white/10 group-hover:scale-105 transition-transform flex items-center justify-center p-2.5 sm:p-3">
            <Image
              src={integration.logo}
              alt={`${integration.name} logo`}
              width={64}
              height={64}
              className="object-contain"
              unoptimized
              loading="lazy"
            />
          </div>

          {/* Name and Status */}
          <div className="space-y-1.5 sm:space-y-2 flex-1 flex flex-col">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">
              {integration.name}
            </h3>
            <Badge
              variant="outline"
              className={`${badgeConfig.className} text-xs w-fit mx-auto`}
            >
              {badgeConfig.text}
            </Badge>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 leading-relaxed line-clamp-3">
            {integration.description}
          </p>

          {/* Actions */}
          <div className="flex gap-2 w-full pt-1 sm:pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDetails}
              className="flex-1 border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/[0.06] text-xs h-8 sm:h-9"
              disabled={isComingSoon}
              aria-label={`${ARIA_LABELS.DETAILS_BUTTON} ${integration.name}`}
            >
              {BUTTON_LABELS.DETAILS}
            </Button>
            {isConnected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleConfigure}
                className="flex-1 border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/[0.06] text-xs h-8 sm:h-9"
                aria-label={`${ARIA_LABELS.CONFIGURE_BUTTON} ${integration.name}`}
              >
                {BUTTON_LABELS.CONFIGURE}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleInstall}
                className="flex-1 border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/[0.06] text-xs h-8 sm:h-9"
                disabled={isComingSoon}
                aria-label={`${ARIA_LABELS.INSTALL_BUTTON} ${integration.name}`}
              >
                {BUTTON_LABELS.INSTALL}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
