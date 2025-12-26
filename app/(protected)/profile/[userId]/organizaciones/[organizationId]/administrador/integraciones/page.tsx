"use client";

import { useState, useMemo, useCallback } from "react";
import { AdminHeader } from "@/components/admin-header";
import { IntegrationSearch } from "@/components/integrations/integration-search";
import { IntegrationGrid } from "@/components/integrations/integration-grid";
import { IntegrationEmptyState } from "@/components/integrations/integration-empty-state";
import { INTEGRATIONS } from "@/lib/integrations/data";
import { filterIntegrations, groupIntegrationsByCategory, hasGroupedResults } from "@/lib/integrations/utils";
import { UI } from "@/constants/integrations";
import type { Integration } from "@/lib/integrations/types";

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter and group integrations
  const groupedIntegrations = useMemo(() => {
    const filtered = filterIntegrations(INTEGRATIONS, searchQuery);
    return groupIntegrationsByCategory(filtered);
  }, [searchQuery]);

  const hasResults = hasGroupedResults(groupedIntegrations);

  // Event handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleDetails = useCallback((integration: Integration) => {
    // TODO: Open details modal/dialog
    console.log("View details:", integration);
  }, []);

  const handleInstall = useCallback((integration: Integration) => {
    // TODO: Handle installation flow
    console.log("Install integration:", integration);
  }, []);

  const handleConfigure = useCallback((integration: Integration) => {
    // TODO: Open configuration modal/dialog
    console.log("Configure integration:", integration);
  }, []);

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Page Header */}
      <AdminHeader
        title={UI.HEADER.TITLE}
        subtitle={UI.HEADER.DESCRIPTION}
      />

      {/* Search Bar */}
      <IntegrationSearch value={searchQuery} onChange={handleSearchChange} />

      {/* Integrations Grid or Empty State */}
      {hasResults ? (
        <IntegrationGrid
          groupedIntegrations={groupedIntegrations}
          onDetails={handleDetails}
          onInstall={handleInstall}
          onConfigure={handleConfigure}
        />
      ) : (
        <IntegrationEmptyState />
      )}
    </div>
  );
}
