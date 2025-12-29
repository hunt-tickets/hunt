import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { AdminHeader } from "@/components/admin-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gift, Users, Percent, Wallet } from "lucide-react";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import type { Metadata } from "next";

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Recompensas - Próximamente | Hunt Tickets",
  description:
    "Sistema de recompensas de Hunt Tickets - Próximamente disponible.",
  robots: {
    index: false, // Don't index user-specific pages
    follow: false,
  },
};

interface ReferidosPageProps {
  params: Promise<{
    userId: string;
    organizationId: string;
  }>;
}

export default async function ReferidosPage({ params }: ReferidosPageProps) {
  const { userId, organizationId } = await params;
  const reqHeaders = await headers();

  // Auth check
  const session = await auth.api.getSession({ headers: reqHeaders });
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

  // Check if user has admin permissions (sellers cannot view referrals)
  const canViewReferrals = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { dashboard: ["view"] },
      organizationId,
    },
  });

  if (!canViewReferrals?.success) {
    redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/mis-ventas`);
  }

  const features = [
    {
      icon: Users,
      title: "Programa de Referidos",
      description: "Gana comisiones por referir productores de eventos a la plataforma",
    },
    {
      icon: Percent,
      title: "Sistema de Rebate",
      description: "Obtén rebates automáticos basados en tus ventas mensuales",
    },
    {
      icon: Wallet,
      title: "Gestión de Pagos",
      description: "Administra tus recompensas y retiros de forma sencilla",
    },
  ];

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      {/* Header */}
      <AdminHeader
        title="Recompensas"
        subtitle="Sistema de recompensas y referidos"
      />

      {/* Coming Soon Card */}
      <Card className="bg-white dark:bg-[#202020] border-gray-200 dark:border-[#2a2a2a]">
        <CardContent className="p-8 sm:p-12">
          <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
            {/* Icon */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
              <Gift className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400" />
            </div>

            {/* Badge */}
            <Badge
              variant="outline"
              className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20"
            >
              Próximamente
            </Badge>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Sistema de Recompensas
              </h2>
              <p className="text-base sm:text-lg text-gray-600 dark:text-white/60">
                Estamos trabajando en un programa completo de recompensas para ti
              </p>
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/5"
                  >
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {feature.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-white/60">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Info */}
            <p className="text-sm text-gray-500 dark:text-white/40 pt-2">
              Te notificaremos cuando esta funcionalidad esté disponible
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
