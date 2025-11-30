import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UserCircle, Users, Shield } from "lucide-react";
import { UsersTable } from "@/components/users-table";
import { AnalyticsCharts } from "@/components/analytics-charts";
import { AdminHeader } from "@/components/admin-header";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

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

  // Mock users data - In production, fetch from database
  const users = [
    {
      id: "user-1",
      name: "María",
      lastName: "García",
      email: "maria@example.com",
      phone: "+57 300 123 4567",
      birthdate: "1995-06-15",
      gender: "Femenino",
      prefix: "+57",
      document_id: "1234567890",
      admin: false,
      created_at: "2025-01-15T10:30:00Z",
    },
    {
      id: "user-2",
      name: "Carlos",
      lastName: "Rodríguez",
      email: "carlos@example.com",
      phone: "+57 301 234 5678",
      birthdate: "1988-03-22",
      gender: "Masculino",
      prefix: "+57",
      document_id: "9876543210",
      admin: true,
      created_at: "2025-01-10T08:20:00Z",
    },
    {
      id: "user-3",
      name: "Ana",
      lastName: "López",
      email: "ana@example.com",
      phone: null,
      birthdate: "2000-11-30",
      gender: "Femenino",
      prefix: null,
      document_id: null,
      admin: false,
      created_at: "2025-01-20T14:15:00Z",
    },
  ];

  // Mock purchase stats - In production, fetch from database
  const purchaseStats = {
    ageGroups: [
      { ageGroup: "18-24", users: 45, tickets: 60 },
      { ageGroup: "25-34", users: 78, tickets: 105 },
      { ageGroup: "35-44", users: 32, tickets: 50 },
      { ageGroup: "45+", users: 15, tickets: 30 },
    ],
    genderGroups: [
      { gender: "Masculino", users: 90, tickets: 120 },
      { gender: "Femenino", users: 70, tickets: 100 },
      { gender: "Otro", users: 10, tickets: 25 },
    ],
    totalUsers: 170,
    totalTicketsSold: 245,
  };

  const adminCount = users?.filter(u => u.admin).length || 0;
  const totalUsers = users?.length || 0;
  const usersWithPhone = users?.filter(u => u.phone).length || 0;

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Page Header */}
      <AdminHeader
        title="USUARIOS"
        subtitle="Listado completo de usuarios del sistema"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-[#404040] mt-1">Usuarios registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Administradores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
            <p className="text-xs text-[#404040] mt-1">Con permisos admin</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCircle className="h-4 w-4" />
              Perfiles Completos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersWithPhone}</div>
            <p className="text-xs text-[#404040] mt-1">Con teléfono registrado</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Analíticas de Público</h2>
          <p className="text-sm text-[#404040] mt-1">Estadísticas de usuarios que han comprado entradas</p>
        </div>

        {!purchaseStats.ageGroups || purchaseStats.ageGroups.length === 0 ? (
          <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
            <CardContent className="py-12 text-center">
              <p className="text-white/40">No hay usuarios con compras registradas aún</p>
              <p className="text-xs text-white/30 mt-2">Los gráficos aparecerán cuando haya datos de compras</p>
            </CardContent>
          </Card>
        ) : (
          <AnalyticsCharts
            ageGroups={purchaseStats.ageGroups}
            genderGroups={purchaseStats.genderGroups || []}
            totalUsers={purchaseStats.totalUsers}
            totalTicketsSold={purchaseStats.totalTicketsSold}
          />
        )}
      </div>

      {/* Users Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Listado de Usuarios</h2>
        </div>

        {users && users.length > 0 ? (
          <UsersTable users={users} />
        ) : (
          <div className="text-center py-24 rounded-xl bg-white/[0.02] border border-white/5">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm text-white/40">No hay usuarios registrados</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsuariosPage;
