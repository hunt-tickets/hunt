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
import { AnalyticsCharts } from "@/components/analytics-charts";
import { AdminHeader } from "@/components/admin-header";

interface UsuariosPageProps {
  params: Promise<{
    userId: string;
  }>;
}

const UsuariosPage = async ({ params }: UsuariosPageProps) => {
  const { userId } = await params;

  // Auth check using Better Auth
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.id !== userId) {
    redirect("/sign-in");
  }

  // Mock: Check if user is admin
  const profile = {
    admin: true, // In production, fetch from database
  };

  if (!profile?.admin) {
    notFound();
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

  const adminCount = users?.filter(u => u.admin).length || 0;
  const totalUsers = users?.length || 0;
  const usersWithPhone = users?.filter(u => u.phone).length || 0;

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Page Header */}
      <AdminHeader
        title="Analíticas de Público"
        subtitle="Estadísticas de usuarios que han comprado entradas"
      />

      {/* Analytics Section */}
      <div className="space-y-4">
        {!purchaseStats.ageGroups || purchaseStats.ageGroups.length === 0 ? (
          <Card className="bg-gray-50 dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-[#303030]">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400 dark:text-white/40">No hay usuarios con compras registradas aún</p>
              <p className="text-xs text-gray-400 dark:text-white/30 mt-2">Los gráficos aparecerán cuando haya datos de compras</p>
            </CardContent>
          </Card>
        ) : (
          <AnalyticsCharts
            ageGroups={purchaseStats.ageGroups}
            genderGroups={purchaseStats.genderGroups || []}
            totalUsers={purchaseStats.totalUsers}
            totalTicketsSold={purchaseStats.totalTicketsSold}
            totalRegisteredUsers={totalUsers}
          />
        )}
      </div>

      {/* Users Table */}
      <Card className="bg-gray-50 dark:bg-background/50 backdrop-blur-sm border-gray-200 dark:border-[#303030]">
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
