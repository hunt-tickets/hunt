/**
 * Mock Server Queries for Venues
 * These are stub functions to prevent import errors
 */

export async function getVenues() {
  const { DUMMY_VENUES } = await import("@/lib/dummy-data");
  return DUMMY_VENUES;
}
