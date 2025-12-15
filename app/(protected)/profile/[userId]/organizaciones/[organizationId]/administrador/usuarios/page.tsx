import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";
import { UsersTable } from "@/components/users-table";
import { AnalyticsChartsLazy } from "@/components/analytics-charts-lazy";
import { AdminHeader } from "@/components/admin-header";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import type { Metadata } from "next";

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Analíticas de Público - Gestión de Usuarios | Hunt Tickets",
  description:
    "Administra y analiza tu base de usuarios. Visualiza estadísticas demográficas, historial de compras y tendencias de tu audiencia.",
  robots: {
    index: false, // Don't index user-specific pages
    follow: false,
  },
};

interface UsuariosPageProps {
  params: Promise<{
    userId: string;
    organizationId: string;
  }>;
}

const UsuariosPage = async ({ params }: UsuariosPageProps) => {
  const { userId, organizationId } = await params;
  const reqHeaders = await headers();

  // Auth check using Better Auth
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
  }

  // Verify user is a member of the organization
  const memberRecord = await db.query.member.findFirst({
    where: and(
      eq(member.userId, userId),
      eq(member.organizationId, organizationId)
    ),
  });

  if (!memberRecord) {
    notFound();
  }

  // Check if user can view analytics (sellers cannot)
  const canViewAnalytics = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { analytics: ["view"] },
      organizationId,
    },
  });

  if (!canViewAnalytics?.success) {
    redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/mis-ventas`);
  }

  // TODO: Replace with real data fetch from database
  // For now using mock data from centralized location
  const { MOCK_USERS } = await import("@/lib/users/mock-data");
  const users = MOCK_USERS;

  // Total registered users (including those who haven't made purchases)
  const totalRegisteredUsers = 245;

  // Mock purchase stats - In production, fetch from database
  const purchaseStats = {
    ageGroups: [
      { ageGroup: "18-24", users: 45, tickets: 60, averagePrice: 75000 },
      { ageGroup: "25-34", users: 78, tickets: 105, averagePrice: 95000 },
      { ageGroup: "35-44", users: 32, tickets: 50, averagePrice: 120000 },
      { ageGroup: "45+", users: 15, tickets: 30, averagePrice: 150000 },
    ],
    genderGroups: [
      { gender: "Masculino", users: 90, tickets: 120, averagePrice: 85000 },
      { gender: "Femenino", users: 70, tickets: 100, averagePrice: 105000 },
      { gender: "Otro", users: 10, tickets: 25, averagePrice: 95000 },
    ],
    totalUsers: 170,
    totalTicketsSold: 245,
  };


  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Page Header */}
      <AdminHeader
        title="Analíticas de Público"
        subtitle="Estadísticas de usuarios que han comprado entradas"
      />

      {/* Analytics Section */}
      <div className="space-y-3">
        {!purchaseStats.ageGroups || purchaseStats.ageGroups.length === 0 ? (
          <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No hay usuarios con compras registradas aún</p>
              <p className="text-xs text-gray-500 mt-2">Los gráficos aparecerán cuando haya datos de compras</p>
            </CardContent>
          </Card>
        ) : (
          <AnalyticsChartsLazy
            ageGroups={purchaseStats.ageGroups}
            genderGroups={purchaseStats.genderGroups || []}
            totalUsers={purchaseStats.totalUsers}
            totalTicketsSold={purchaseStats.totalTicketsSold}
            totalRegisteredUsers={totalRegisteredUsers}
          />
        )}
      </div>

      {/* Users Table */}
      <Card className="bg-gray-50 dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a]">
        <CardHeader>
          <CardTitle className="text-lg">Listado de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          {users && users.length > 0 ? (
            <UsersTable users={users} />
          ) : (
            <div className="text-center py-24">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm text-gray-400 dark:text-white/40">No hay usuarios registrados</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsuariosPage;
