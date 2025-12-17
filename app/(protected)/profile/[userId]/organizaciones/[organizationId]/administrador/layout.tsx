import React, { ReactNode } from "react";
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
    organizationId: string;
  }>;
}

const AdministradorLayout = async ({
  children,
  params,
}: AdministradorLayoutProps) => {
  const { userId, organizationId } = await params;

  return (
    <AdminLayoutWrapper>
      <div className="min-h-screen bg-background">
        {/* Sidebar */}
        <AdminSidebar
          userId={userId}
          organizationId={organizationId} // First render organization_id
        />

        {/* Main Content - with left margin to accommodate fixed sidebar */}
        <main className="lg:ml-64 min-h-screen pt-4 px-4 sm:pt-6 sm:px-6 lg:pt-8 lg:px-8">
          {children}
        </main>
      </div>
    </AdminLayoutWrapper>
  );
};

export default AdministradorLayout;
