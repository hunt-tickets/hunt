import { CURRENT_USER } from "@/lib/dummy-data";

/**
 * Mock authentication helpers
 * These replace Supabase auth with a simple mock that always returns the current user
 */

export interface MockUser {
  id: string;
  email: string;
  user_metadata?: {
    name?: string;
    lastName?: string;
  };
}

export interface MockAuthResponse {
  data: {
    user: MockUser | null;
  };
  error: null;
}

/**
 * Get the currently "authenticated" user (always returns CURRENT_USER)
 */
export async function getUser(): Promise<MockAuthResponse> {
  return {
    data: {
      user: {
        id: CURRENT_USER.id,
        email: CURRENT_USER.email,
        user_metadata: {
          name: CURRENT_USER.name,
          lastName: CURRENT_USER.lastName,
        },
      },
    },
    error: null,
  };
}

/**
 * Check if user is authenticated (always true in mock)
 */
export async function isAuthenticated(): Promise<boolean> {
  return true;
}

/**
 * Get current user ID (always returns CURRENT_USER.id)
 */
export function getCurrentUserId(): string {
  return CURRENT_USER.id;
}

/**
 * Mock sign out (does nothing in mock)
 */
export async function signOut(): Promise<void> {
  // In mock, we don't actually sign out
  console.log("Mock sign out called");
}

/**
 * Check if current user is admin
 */
export function isAdmin(): boolean {
  return CURRENT_USER.admin;
}
