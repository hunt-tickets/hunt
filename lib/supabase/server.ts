/**
 * Mock Supabase Server Client
 * This file provides a mock implementation to prevent import errors
 * All functions return empty data or mock responses
 */

import { createMockQueryBuilder } from "@/lib/db/mock-db";
import { getUser } from "@/lib/auth/mock-auth";

export async function createClient() {
  return {
    auth: {
      getUser,
      signOut: async () => ({ error: null }),
    },
    from: createMockQueryBuilder().from,
    rpc: createMockQueryBuilder().rpc,
  };
}
