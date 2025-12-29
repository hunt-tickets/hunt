import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Integration } from "@/lib/integrations/types";

interface IntegrationComingSoonCardProps {
  integration: Integration;
}

export function IntegrationComingSoonCard({
  integration,
}: IntegrationComingSoonCardProps) {
  return (
    <Card
      className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 opacity-60"
      role="article"
      aria-label={`Integración de ${integration.name} - Próximamente`}
    >
      <CardContent className="p-5 sm:p-6 flex flex-col h-full">
        <div className="flex flex-col items-center text-center space-y-4 flex-1">
          {/* Logo */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gray-200 dark:bg-[#2a2a2a] flex items-center justify-center p-4 sm:p-5">
            <Image
              src={integration.logo}
              alt={`${integration.name} logo`}
              width={96}
              height={96}
              className="object-contain opacity-50"
              unoptimized
              loading="lazy"
            />
          </div>

          {/* Name and Badge */}
          <div className="flex-1 flex flex-col justify-center space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
              {integration.name}
            </h3>
            <Badge
              variant="outline"
              className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 text-xs w-fit mx-auto"
            >
              Próximamente
            </Badge>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-gray-600 dark:text-white/60 leading-relaxed line-clamp-3">
            {integration.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
