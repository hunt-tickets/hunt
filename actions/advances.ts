/**
 * Mock Server Actions for Advances
 * These are stub functions to prevent import errors
 */

"use server";

export async function getEventAdvances(eventId: string) {
  return [];
}

export async function createEventAdvance(
  _eventId: string,
  _data: {
    amount: number;
    concept: string;
    date: string;
    payment_method: string;
    notes?: string;
    file?: string;
    debt: boolean;
  }
) {
  return { success: true };
}
