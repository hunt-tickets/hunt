import { NextRequest, NextResponse } from "next/server";
import { getPopularEvents } from "@/lib/db/mock-db";

/**
 * GET /api/events/popular
 * Fetches popular events from the database (MOCK VERSION)
 *
 * Query Parameters:
 * - cityId (optional): Filter events by city (ignored in mock)
 * - limit (optional): Maximum number of events to return (default: 7)
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters from the URL
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit");

    // Parse limit parameter (ensure it's a valid number)
    const parsedLimit = limit ? parseInt(limit, 10) : 7;

    // Validate limit parameter
    if (limit && (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50)) {
      return NextResponse.json(
        { error: "Invalid limit parameter. Must be between 1 and 50." },
        { status: 400 }
      );
    }

    // Fetch popular events from mock data
    const { data: events } = await getPopularEvents();

    // Return the events as JSON response
    return NextResponse.json(events, {
      status: 200,
      headers: {
        // Cache the response for 5 minutes to reduce database load
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    // Log error for debugging
    console.error("Error in GET /api/events/popular:", error);

    // Return error response
    return NextResponse.json(
      {
        error: "Failed to fetch popular events",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}