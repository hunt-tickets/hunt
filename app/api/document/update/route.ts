import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: Request) {
  try {
    // Get authenticated user
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Extract request body
    const body = await request.json();
    const { documentTypeId, documentId } = body;

    // Update user using Better Auth API to ensure session is updated
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        documentTypeId: documentTypeId || null,
        documentId: documentId?.trim() || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Error al actualizar el documento" },
      { status: 500 }
    );
  }
}
