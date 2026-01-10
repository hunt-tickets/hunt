import { NextRequest, NextResponse } from "next/server";
import { toggleEventCashSalesDb } from "@/lib/helpers/events";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, cashEnabled } = body;

    if (!eventId || typeof cashEnabled !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const result = await toggleEventCashSalesDb(eventId, cashEnabled);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in toggle-cash-sales API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
