import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Ticket,
  Users,
  Calendar,
  UserCog,
  FileText,
  Shield,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";
// import { ShareButton } from "@/components/share-button";

interface SettingsPageProps {
  params: Promise<{
    userId: string;
  }>;
}

const SettingsPage = async ({ params }: SettingsPageProps) => {
  const { userId } = await params;
  const supabase = await createClient();

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    redirect("/login");
  }

  // Get profile to check admin status
  const { data: profile } = await supabase
    .from("profiles")
    .select("admin")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.admin ?? false;

  // Admin options
  const adminOptions = [
    {
      title: "Vender Tickets",
      description: "Gestionar ventas y transacciones de tickets",
      icon: Ticket,
      href: `/profile/${userId}/ajustes/vender-tickets`,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Administrar Perfiles",
      description: "Gestionar usuarios y permisos del sistema",
      icon: Users,
      href: `/profile/${userId}/ajustes/administrar-perfiles`,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "Administrar Eventos",
      description: "Configuración y gestión de eventos",
      icon: Calendar,
      href: `/profile/${userId}/administrador`,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Administrar Staff",
      description: "Gestionar equipo y vendedores autorizados",
      icon: UserCog,
      href: `/profile/${userId}/ajustes/administrar-staff`,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  // Regular user options
  const userOptions = [
    {
      title: "Términos y Condiciones",
      description: "Lee nuestros términos de servicio",
      icon: FileText,
      href: "/terminos-y-condiciones",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
    {
      title: "Política de Privacidad",
      description: "Conoce cómo protegemos tus datos",
      icon: Shield,
      href: "/resources/privacy",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
  ];

  const options = isAdmin ? adminOptions : userOptions;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isAdmin ? "Ajustes de Administrador" : "Ajustes"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isAdmin
            ? "Gestiona configuraciones y opciones del sistema"
            : "Configura tu cuenta y preferencias"}
        </p>
      </div>

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <Link key={option.href} href={option.href}>
              <Card className="h-full transition-all duration-500 hover:shadow-md cursor-pointer border-2 hover:border-primary/30">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${option.bgColor} ${option.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{option.title}</CardTitle>
                      <CardDescription className="mt-1.5">
                        {option.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          );
        })}

        {/* Sign Out Button (only for non-admin users) */}
        {!isAdmin && (
          <SignOutButton>
            <Card className="h-full transition-all duration-500 hover:shadow-md cursor-pointer border-2 hover:border-destructive/30">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400">
                    <LogOut className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg">Cerrar Sesión</CardTitle>
                    <CardDescription className="mt-1.5">
                      Salir de tu cuenta de forma segura
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </SignOutButton>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
