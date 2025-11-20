/**
 * Mock Server Actions for Tickets
 * These are stub functions to prevent import errors
 */

"use server";

export async function getAllProducers() {
  const { DUMMY_PRODUCERS } = await import("@/lib/dummy-data");
  return DUMMY_PRODUCERS;
}

export async function getAllArtists() {
  return [];
}

export async function getAllVenues() {
  const { DUMMY_VENUES } = await import("@/lib/dummy-data");
  return DUMMY_VENUES;
}

export async function getProducerTeam(producerId: string) {
  return [];
}

export async function getCompleteEventTransactions(eventId: string) {
  return [];
}
