/**
 * Integration Types
 * Type definitions for integration management
 */

import type { LucideIcon } from "lucide-react";

// Integration status types
export type IntegrationStatus = "available" | "coming-soon" | "connected" | "disconnected";

// Integration category types
export type IntegrationCategory = "payment" | "webhooks";

// Base integration interface
export interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: IntegrationStatus;
  category: IntegrationCategory;
  website?: string;
  documentationUrl?: string;
}

// Category configuration
export interface CategoryConfig {
  name: string;
  icon: LucideIcon;
  color: string;
}

// Integration card props
export interface IntegrationCardProps {
  integration: Integration;
  onInstall?: (integration: Integration) => void;
  onConfigure?: (integration: Integration) => void;
}

// Grouped integrations type
export type GroupedIntegrations = Record<IntegrationCategory, Integration[]>;

// Integration filter function type
export type IntegrationFilterFn = (integration: Integration, query: string) => boolean;
