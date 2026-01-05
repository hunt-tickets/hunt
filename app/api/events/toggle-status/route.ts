import { NextRequest, NextResponse } from "next/server";
import { toggleEventStatusDb } from "@/lib/helpers/events";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, status } = body;

    if (!eventId || typeof status !== "boolean") {
      return NextResponse.json(
        { success: false, message: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const result = await toggleEventStatusDb(eventId, status);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in toggle-status API:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
