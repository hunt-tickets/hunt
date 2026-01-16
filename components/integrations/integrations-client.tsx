"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { IntegrationSearch } from "@/components/integrations/integration-search";
import { IntegrationGrid } from "@/components/integrations/integration-grid";
import { IntegrationEmptyState } from "@/components/integrations/integration-empty-state";
import { MercadoPagoConfigDialog } from "@/components/integrations/mercadopago-config-dialog";
import { INTEGRATIONS } from "@/lib/integrations/data";
import { filterIntegrations } from "@/lib/integrations/utils";
import type { Integration } from "@/lib/integrations/types";
import { toast } from "sonner";
import { PaymentProcessorAccount } from "@/lib/schema";

interface IntegrationsClientProps {
  paymentAccounts: PaymentProcessorAccount[];
  mpOauthUrl: string;
  organizationId: string;
  connectedIntegration?: string;
}

export function IntegrationsClient({
  paymentAccounts,
  mpOauthUrl,
  organizationId,
  connectedIntegration,
}: IntegrationsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mercadoPagoDialogOpen, setMercadoPagoDialogOpen] = useState(false);

  // Show success toast when returning from OAuth
  useEffect(() => {
    if (connectedIntegration === "mercadopago") {
      toast.success("Mercado Pago conectado exitosamente");
    }
  }, [connectedIntegration]);

  // Get Mercado Pago accounts
  const mercadoPagoAccounts = useMemo(() => {
    return paymentAccounts.filter(
      (account) => account.processorType === "mercadopago"
    );
  }, [paymentAccounts]);

  // Determine integration status
  const enrichedIntegrations = useMemo(() => {
    return INTEGRATIONS.map((integration) => {
      if (integration.id === "mercadopago") {
        return {
          ...integration,
          status:
            mercadoPagoAccounts.length > 0
              ? ("connected" as const)
              : ("available" as const),
        };
      }
      return integration;
    });
  }, [mercadoPagoAccounts]);

  // Filter integrations
  const filteredIntegrations = useMemo(() => {
    return filterIntegrations(enrichedIntegrations, searchQuery);
  }, [enrichedIntegrations, searchQuery]);

  const hasResults = filteredIntegrations.length > 0;

  // Event handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleInstall = useCallback(
    (integration: Integration) => {
      if (integration.id === "mercadopago") {
        // Redirect to OAuth flow
        window.location.href = mpOauthUrl;
      } else {
        // For other integrations, show coming soon toast
        toast.info(`${integration.name} estará disponible pronto`);
      }
    },
    [mpOauthUrl]
  );

  const handleConfigure = useCallback((integration: Integration) => {
    if (integration.id === "mercadopago") {
      setMercadoPagoDialogOpen(true);
    }
  }, []);

  return (
    <>
      {/* Search Bar */}
      <IntegrationSearch value={searchQuery} onChange={handleSearchChange} />

      {/* Integrations Grid or Empty State */}
      {hasResults ? (
        <IntegrationGrid
          integrations={filteredIntegrations}
          onInstall={handleInstall}
          onConfigure={handleConfigure}
        />
      ) : (
        <IntegrationEmptyState />
      )}

      {/* Mercado Pago Configuration Dialog */}
      <MercadoPagoConfigDialog
        open={mercadoPagoDialogOpen}
        onOpenChange={setMercadoPagoDialogOpen}
        accounts={mercadoPagoAccounts}
        organizationId={organizationId}
      />
    </>
  );
}
