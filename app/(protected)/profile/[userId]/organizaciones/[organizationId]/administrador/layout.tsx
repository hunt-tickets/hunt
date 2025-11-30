import React, { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminLayoutWrapper } from "@/components/admin-layout-wrapper";
import { Metadata } from "next";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Eventos",
  };
}

interface AdministradorLayoutProps {
  children: ReactNode;
  params: Promise<{
    userId: string;
    organizationId: string;
  }>;
}

const AdministradorLayout = async ({ children, params }: AdministradorLayoutProps) => {
  const { userId, organizationId } = await params;

  // Fetch user's role in the organization for sidebar display
  const memberRecord = await db.query.member.findFirst({
    where: and(
      eq(member.userId, userId),
      eq(member.organizationId, organizationId)
    ),
  });

  const role = (memberRecord?.role as "owner" | "administrator" | "seller") || "seller";

  return (
    <AdminLayoutWrapper>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <AdminSidebar userId={userId} organizationId={organizationId} role={role} />

        {/* Main Content - with left margin to accommodate fixed sidebar */}
        <main className="lg:ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </AdminLayoutWrapper>
  );
};

export default AdministradorLayout;
