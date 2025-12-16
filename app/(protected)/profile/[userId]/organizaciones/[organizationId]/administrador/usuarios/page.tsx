import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { UsersTable } from "@/components/users-table";
import { AnalyticsChartsLazy } from "@/components/analytics-charts-lazy";
import { AdminHeader } from "@/components/admin-header";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@/lib/users/types";

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

// Helper: Calculate age from birthdate
function calculateAge(birthdate: string | null): number | null {
  if (!birthdate) return null;
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

// Helper: Get age group from age
function getAgeGroup(age: number | null): string {
  if (age === null) return "Sin edad";
  if (age < 18) return "18-24";
  if (age >= 18 && age <= 24) return "18-24";
  if (age >= 25 && age <= 34) return "25-34";
  if (age >= 35 && age <= 44) return "35-44";
  return "45+";
}

// Helper: Format gender for display
function formatGender(gender: string | null): string {
  if (!gender) return "Sin especificar";
  const map: Record<string, string> = {
    masculino: "Masculino",
    femenino: "Femenino",
    otro: "Otro",
    prefiero_no_decir: "Otro",
  };
  return map[gender] || gender;
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
    redirect(
      `/profile/${userId}/organizaciones/${organizationId}/administrador/mis-ventas`
    );
  }

  // ============================================================================
  // SINGLE EFFICIENT QUERY: Get tickets with user data for this organization
  // Path: tickets → ticket_types → events (filtered by org_id) → user
  // ============================================================================
  const supabase = await createClient();

  const { data: ticketsWithUsers, error } = await supabase
    .from("tickets")
    .select(
      `
      id,
      user_id,
      ticket_types!inner (
        id,
        price,
        events!inner (
          id,
          organization_id
        )
      ),
      user:user_id (
        id,
        name,
        apellidos,
        email,
        phoneNumber,
        birthdate,
        gender,
        document_id,
        createdAt
      )
    `
    )
    .eq("ticket_types.events.organization_id", organizationId);

  if (error) {
    console.error("Error fetching tickets:", error);
  }

  // ============================================================================
  // PROCESS DATA: Deduplicate users and calculate stats
  // ============================================================================
  const userMap = new Map<
    string,
    {
      user: User;
      ticketCount: number;
      totalSpent: number;
    }
  >();

  // Age and gender aggregation
  const ageGroupStats = new Map<
    string,
    { users: Set<string>; tickets: number; totalSpent: number }
  >();
  const genderStats = new Map<
    string,
    { users: Set<string>; tickets: number; totalSpent: number }
  >();

  let totalTicketsSold = 0;

  for (const ticket of ticketsWithUsers || []) {
    // Supabase returns single object for user relation (not array)
    const userData = ticket.user as unknown as {
      id: string;
      name: string | null;
      apellidos: string | null;
      email: string | null;
      phoneNumber: string | null;
      birthdate: string | null;
      gender: string | null;
      document_id: string | null;
      createdAt: string;
    } | null;

    if (!userData) continue;

    // ticket_types is a single object due to !inner join
    const ticketType = ticket.ticket_types as unknown as { price: string | number } | null;
    const ticketPrice = Number(ticketType?.price || 0);

    totalTicketsSold++;

    // Build/update user entry
    if (!userMap.has(userData.id)) {
      userMap.set(userData.id, {
        user: {
          id: userData.id,
          name: userData.name,
          lastName: userData.apellidos,
          email: userData.email,
          phone: userData.phoneNumber,
          birthdate: userData.birthdate,
          gender: formatGender(userData.gender),
          prefix: null,
          document_id: userData.document_id,
          created_at: userData.createdAt,
        },
        ticketCount: 0,
        totalSpent: 0,
      });
    }

    const entry = userMap.get(userData.id)!;
    entry.ticketCount++;
    entry.totalSpent += ticketPrice;

    // Aggregate by age group
    const age = calculateAge(userData.birthdate);
    const ageGroup = getAgeGroup(age);
    if (!ageGroupStats.has(ageGroup)) {
      ageGroupStats.set(ageGroup, { users: new Set(), tickets: 0, totalSpent: 0 });
    }
    const ageStat = ageGroupStats.get(ageGroup)!;
    ageStat.users.add(userData.id);
    ageStat.tickets++;
    ageStat.totalSpent += ticketPrice;

    // Aggregate by gender
    const gender = formatGender(userData.gender);
    if (gender !== "Sin especificar") {
      if (!genderStats.has(gender)) {
        genderStats.set(gender, { users: new Set(), tickets: 0, totalSpent: 0 });
      }
      const genderStat = genderStats.get(gender)!;
      genderStat.users.add(userData.id);
      genderStat.tickets++;
      genderStat.totalSpent += ticketPrice;
    }
  }

  // Convert user map to array for the table
  const users: User[] = Array.from(userMap.values()).map((entry) => entry.user);

  // Build age groups array (sorted)
  const ageGroupOrder = ["18-24", "25-34", "35-44", "45+", "Sin edad"];
  const ageGroups = ageGroupOrder
    .filter((group) => ageGroupStats.has(group))
    .map((ageGroup) => {
      const stat = ageGroupStats.get(ageGroup)!;
      return {
        ageGroup,
        users: stat.users.size,
        tickets: stat.tickets,
        averagePrice: stat.tickets > 0 ? Math.round(stat.totalSpent / stat.tickets) : 0,
      };
    });

  // Build gender groups array (sorted)
  const genderOrder = ["Masculino", "Femenino", "Otro"];
  const genderGroups = genderOrder
    .filter((gender) => genderStats.has(gender))
    .map((gender) => {
      const stat = genderStats.get(gender)!;
      return {
        gender,
        users: stat.users.size,
        tickets: stat.tickets,
        averagePrice: stat.tickets > 0 ? Math.round(stat.totalSpent / stat.tickets) : 0,
      };
    });

  const totalRegisteredUsers = users.length;

  const purchaseStats = {
    ageGroups,
    genderGroups,
    totalUsers: users.length,
    totalTicketsSold,
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
              <p className="text-gray-500">
                No hay usuarios con compras registradas aún
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Los gráficos aparecerán cuando haya datos de compras
              </p>
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
              <p className="text-sm text-gray-400 dark:text-white/40">
                No hay usuarios registrados
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsuariosPage;
