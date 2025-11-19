/**
 * Mock Server Actions for Events
 * These are stub functions to prevent import errors
 */

"use server";

export async function getEventFinancialReport(eventId: string) {
  return {
    totalSales: 0,
    totalTickets: 0,
    revenue: 0,
  };
}
