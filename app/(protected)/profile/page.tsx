import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  Shield,
  Clock,
  Calendar,
  Key,
  Fingerprint,
} from "lucide-react";
import { EditProfileDialog } from "@/components/edit-profile-dialog";

export default async function ProfilePage() {
  // Secure authentication - validates with server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = session.user;

  // Format dates
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ fontFamily: "LOT, sans-serif" }}
            >
              MI PERFIL
            </h1>
            <p className="text-[#404040] mt-1 text-sm sm:text-base">
              Información de tu cuenta y sesiones activas
            </p>
          </div>
          <div className="hidden sm:flex gap-2">
            <EditProfileDialog user={user} />
          </div>
        </div>
        {/* Mobile buttons */}
        <div className="flex sm:hidden flex-col gap-2">
          <EditProfileDialog user={user} />
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Profile Header Card */}
        <Card className="lg:col-span-3 bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-6">
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl sm:text-2xl font-bold break-words">
                        {user.name || "Usuario sin nombre"}
                      </h2>
                      <p className="text-muted-foreground text-sm sm:text-base break-all">
                        {user.email || "Sin correo"}
                      </p>
                    </div>
                    {user.role === "admin" && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        <Badge variant="default" className="text-xs sm:text-sm">
                          Administrador
                        </Badge>
                      </div>
                    )}
                  </div>
                  {user.role === "admin" && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                      Tienes permisos completos de administrador del sistema
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Card */}
        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>Datos personales del perfil</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Mail className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Correo electrónico</p>
                <p className="text-sm text-muted-foreground">
                  {user.email || "No disponible"}
                </p>
                {user.emailVerified && (
                  <Badge variant="outline" className="mt-1">
                    Verificado
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Teléfono</p>
                <p className="text-sm text-muted-foreground">
                  {user.phoneNumber || "No disponible"}
                </p>
                {user.phoneNumberVerified && (
                  <Badge variant="outline" className="mt-1">
                    Verificado
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Document Information Card */}
        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              Identificación
            </CardTitle>
            <CardDescription>Información de cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Key className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">ID de Usuario</p>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {user.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Activity Card */}
        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Actividad de la Cuenta
            </CardTitle>
            <CardDescription>
              Historial de acceso y actualizaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Cuenta creada</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(user.createdAt?.toString())}
                </p>
              </div>
            </div>

            {user.lastSignInAt && (
              <div className="flex items-start gap-3">
                <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Último acceso</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.lastSignInAt.toString())}
                  </p>
                </div>
              </div>
            )}

            {user.updatedAt && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Cuenta actualizada</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.updatedAt.toString())}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Metadata Cards - Admin Only */}
      {user.role === "admin" && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* App Metadata */}
          {user.appMetadata && Object.keys(user.appMetadata).length > 0 && (
            <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-[#303030]">
              <CardHeader>
                <CardTitle>Metadata de la Aplicación</CardTitle>
                <CardDescription>
                  Información gestionada por el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono p-3 rounded-md bg-muted overflow-x-auto max-h-64">
                  {JSON.stringify(user.appMetadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* User Metadata */}
          {user.userMetadata && Object.keys(user.userMetadata).length > 0 && (
            <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-[#303030]">
              <CardHeader>
                <CardTitle>Metadata del Usuario</CardTitle>
                <CardDescription>
                  Información personalizada (editable)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono p-3 rounded-md bg-muted overflow-x-auto max-h-64">
                  {JSON.stringify(user.userMetadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
