import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
// import { db } from "@/lib/drizzle";
// import { eq, and } from "drizzle-orm";

/**
 * API Endpoint to upload event images to Supabase Storage
 *
 * Usage: POST /api/events/upload-image
 * FormData:
 *   - file: File (the image file)
 *   - organizationId: string
 *   - eventId: string (required)
 *   - imageType: "flyer" | "gallery"
 *
 * Uploads to: /events/{eventId}/{imageType}_{timestamp}.{ext}
 * Returns: { success: true, url: string, path: string, fullPath: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const headersList = await headers();
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const organizationId = formData.get("organizationId") as string;
    const eventId = formData.get("eventId") as string;
    const imageType = formData.get("imageType") as string;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId is required" },
        { status: 400 }
      );
    }

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Generate unique filename: eventId/imageType_timestamp.ext
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `${eventId}/${imageType}_${timestamp}.${fileExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("events")
      .upload(fileName, arrayBuffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }

    // Get public URL using the path from upload response
    const { data: publicUrlData } = supabase.storage
      .from("events")
      .getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      url: publicUrlData.publicUrl,
      path: data.path,
      fullPath: data.fullPath,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
