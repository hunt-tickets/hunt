/**
 * Authentication and Authorization Utilities
 *
 * Centralized utilities for authentication verification and permission checks
 * to eliminate code duplication across protected routes.
 *
 * This eliminates ~295 lines of duplicated code across 15+ route files.
 */

import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import type { ReadonlyHeaders } from "next/dist/server/web/spec-extension/adapters/headers";

// ============================================================================
// TYPES
// ============================================================================

export interface MemberRecord {
  id: string;
  userId: string;
  organizationId: string;
  role: string;
  createdAt: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  // Add other session user properties as needed
}

export interface PermissionCheck {
  permission: Record<string, string[]>;
  organizationId: string;
}

// Permission types for better type safety
export type PermissionResource =
  | "dashboard"
  | "event"
  | "analytics"
  | "users"
  | "sales"
  | "settings";

export type PermissionAction = "view" | "create" | "update" | "delete";

// ============================================================================
// CORE AUTH UTILITIES
// ============================================================================

/**
 * Verifies user session and organization membership
 *
 * This function replaces ~15 lines of duplicated code in every protected route.
 * It handles:
 * - Session verification
 * - User ID matching
 * - Organization membership check
 * - Automatic redirects on failure
 *
 * @param userId - User ID from route params
 * @param organizationId - Organization ID from route params
 * @param headers - Request headers (await headers() in route)
 * @returns Member record if verification succeeds
 * @throws Redirects to sign-in or notFound if verification fails
 *
 * @example
 * ```typescript
 * // Before (15 lines):
 * const session = await auth.api.getSession({ headers: reqHeaders });
 * if (!session || session.user.id !== userId) {
 *   redirect("/sign-in");
 * }
 * const memberRecord = await db.query.member.findFirst({
 *   where: and(eq(member.userId, userId), eq(member.organizationId, organizationId)),
 * });
 * if (!memberRecord) {
 *   notFound();
 * }
 *
 * // After (1 line):
 * const memberRecord = await verifyOrganizationMember(userId, organizationId, reqHeaders);
 * ```
 */
export async function verifyOrganizationMember(
  userId: string,
  organizationId: string,
  headers: ReadonlyHeaders
): Promise<MemberRecord> {
  // Verify session exists and user ID matches
  const session = await auth.api.getSession({ headers });

  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
  }

  // Verify user is a member of the organization
  const memberRecord = await db.query.member.findFirst({
    where: and(
      eq(member.userId, userId),
      eq(member.organizationId, organizationId)
    ),
  });

  if (!memberRecord) {
    notFound();
  }

  return memberRecord as MemberRecord;
}

/**
 * Verifies user has specific permission in organization
 *
 * This function replaces ~10 lines of duplicated permission check code.
 * It automatically redirects to appropriate fallback page on failure.
 *
 * @param headers - Request headers
 * @param resource - Permission resource (e.g., "dashboard", "event")
 * @param action - Permission action (e.g., "view", "create")
 * @param organizationId - Organization ID
 * @param fallbackPath - Path to redirect if permission denied (optional)
 * @returns True if user has permission
 * @throws Redirects to fallback path if permission denied
 *
 * @example
 * ```typescript
 * // Before (10 lines):
 * const canViewDashboard = await auth.api.hasPermission({
 *   headers: reqHeaders,
 *   body: {
 *     permission: { dashboard: ["view"] },
 *     organizationId,
 *   },
 * });
 * if (!canViewDashboard?.success) {
 *   redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/mis-ventas`);
 * }
 *
 * // After (1 line):
 * await verifyPermission(reqHeaders, "dashboard", "view", organizationId, userId);
 * ```
 */
export async function verifyPermission(
  headers: ReadonlyHeaders,
  resource: PermissionResource,
  action: PermissionAction,
  organizationId: string,
  userId?: string,
  fallbackPath?: string
): Promise<boolean> {
  const hasPermission = await auth.api.hasPermission({
    headers,
    body: {
      permission: { [resource]: [action] },
      organizationId,
    },
  });

  if (!hasPermission?.success) {
    if (fallbackPath) {
      redirect(fallbackPath);
    } else if (userId) {
      // Default fallback: redirect to sales page
      redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/mis-ventas`);
    } else {
      redirect("/sign-in");
    }
  }

  return true;
}

/**
 * Combined verification: membership + permission
 *
 * Most common use case - verify both membership and permission in one call.
 * Replaces ~25 lines of duplicated code per route.
 *
 * @param userId - User ID from route params
 * @param organizationId - Organization ID from route params
 * @param headers - Request headers
 * @param resource - Permission resource
 * @param action - Permission action
 * @returns Member record if all checks pass
 *
 * @example
 * ```typescript
 * // Before (25 lines of auth + permission code)
 *
 * // After (1 line):
 * const member = await verifyMembershipAndPermission(
 *   userId,
 *   organizationId,
 *   reqHeaders,
 *   "event",
 *   "create"
 * );
 * ```
 */
export async function verifyMembershipAndPermission(
  userId: string,
  organizationId: string,
  headers: ReadonlyHeaders,
  resource: PermissionResource,
  action: PermissionAction,
  fallbackPath?: string
): Promise<MemberRecord> {
  // First verify membership
  const memberRecord = await verifyOrganizationMember(userId, organizationId, headers);

  // Then verify permission
  await verifyPermission(headers, resource, action, organizationId, userId, fallbackPath);

  return memberRecord;
}

// ============================================================================
// CONVENIENCE FUNCTIONS (Optional)
// ============================================================================

/**
 * Get session or redirect to sign-in
 */
export async function requireSession(headers: ReadonlyHeaders) {
  const session = await auth.api.getSession({ headers });

  if (!session) {
    redirect("/sign-in");
  }

  return session;
}

/**
 * Check if user has permission (returns boolean instead of throwing)
 */
export async function hasPermission(
  headers: ReadonlyHeaders,
  resource: PermissionResource,
  action: PermissionAction,
  organizationId: string
): Promise<boolean> {
  const result = await auth.api.hasPermission({
    headers,
    body: {
      permission: { [resource]: [action] },
      organizationId,
    },
  });

  return result?.success || false;
}

/**
 * Verify user owns a resource or has admin permission
 */
export async function verifyOwnershipOrAdmin(
  headers: ReadonlyHeaders,
  resourceOwnerId: string,
  currentUserId: string,
  organizationId: string
): Promise<boolean> {
  // If user is the owner, allow
  if (resourceOwnerId === currentUserId) {
    return true;
  }

  // Otherwise check if user has admin permission
  return await hasPermission(headers, "dashboard", "view", organizationId);
}
