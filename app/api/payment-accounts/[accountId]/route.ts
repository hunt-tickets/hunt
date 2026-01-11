import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { paymentProcessorAccount } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const { accountId } = await params;

  // Check Session
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get the payment account to verify ownership
    const account = await db.query.paymentProcessorAccount.findFirst({
      where: eq(paymentProcessorAccount.id, accountId),
    });

    if (!account) {
      return NextResponse.json(
        { error: "Payment account not found" },
        { status: 404 }
      );
    }

    // // Verify the user is the owner of the account
    // if (account.userId !== session.user.id) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    // }

    // Delete the payment account
    await db
      .delete(paymentProcessorAccount)
      .where(eq(paymentProcessorAccount.id, accountId));

    return NextResponse.json(
      { success: true, message: "Payment account deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting payment account:", error);
    return NextResponse.json(
      { error: "Failed to delete payment account" },
      { status: 500 }
    );
  }
}
