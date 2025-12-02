import React, { ReactNode } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AdminLayoutWrapper } from "@/components/admin-layout-wrapper";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Eventos",
  };
}

interface AdministradorLayoutProps {
  children: ReactNode;
  params: Promise<{
    userId: string;
  }>;
}

const AdministradorLayout = async ({ children, params }: AdministradorLayoutProps) => {
  const { userId } = await params;

  // Fetch user's organizations using Better Auth API
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  return (
    <AdminLayoutWrapper>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <AdminSidebar userId={userId} organizations={organizations || []} />

        {/* Main Content - with left margin to accommodate fixed sidebar */}
        <main className="lg:ml-64 min-h-screen">
          {children}
        </main>
      </div>
    </AdminLayoutWrapper>
  );
};

export default AdministradorLayout;
