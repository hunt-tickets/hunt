/**
 * Mock Server Actions for Profile
 * These are stub functions to prevent import errors
 */

"use server";

export async function getAllUsers() {
  const { DUMMY_PROFILES } = await import("@/lib/dummy-data");
  return DUMMY_PROFILES;
}

export async function getUsersWithPurchasesStats() {
  return [];
}
