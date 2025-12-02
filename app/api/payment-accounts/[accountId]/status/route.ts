import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/drizzle";
import { paymentProcessorAccount, member } from "@/lib/schema";
import { eq, and, ne, inArray } from "drizzle-orm";

export async function PATCH(
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
    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = [
      "active",
      "inactive",
      "expired",
      "revoked",
      "pending",
      "suspended",
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

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

    // Verify the user is an administrator or owner of the organization
    const membership = await db.query.member.findFirst({
      where: and(
        eq(member.organizationId, account.organizationId),
        eq(member.userId, session.user.id),
        inArray(member.role, ["administrator", "owner"])
      ),
    });

    if (!membership) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // If activating this account, deactivate all other accounts for the same organization
    if (status === "active") {
      await db
        .update(paymentProcessorAccount)
        .set({ status: "inactive", updatedAt: new Date() })
        .where(
          and(
            eq(paymentProcessorAccount.organizationId, account.organizationId),
            eq(paymentProcessorAccount.status, "active"),
            ne(paymentProcessorAccount.id, accountId)
          )
        );
    }

    // Update the payment account status
    await db
      .update(paymentProcessorAccount)
      .set({ status, updatedAt: new Date() })
      .where(eq(paymentProcessorAccount.id, accountId));

    return NextResponse.json(
      {
        success: true,
        message: "Payment account status updated successfully",
        status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating payment account status:", error);
    return NextResponse.json(
      { error: "Failed to update payment account status" },
      { status: 500 }
    );
  }
}
