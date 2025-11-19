import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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
  UserCircle,
  Fingerprint,
} from "lucide-react";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import Image from "next/image";

export default async function ProfilePage() {
  const supabase = await createClient();

  // Secure authentication - validates with server
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  // Get session only for display purposes
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Single database query - gets profile + producer access
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
      *,
      producers_admin (
        producer_id,
        producers (
          id,
          name,
          logo
        )
      )
    `
    )
    .eq("id", user.id)
    .single();

  const isProducer = (profile?.producers_admin?.length ?? 0) > 0;
  const producerData = profile?.producers_admin?.[0]?.producers;

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
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: 'LOT, sans-serif' }}>
              MI PERFIL
            </h1>
            <p className="text-[#404040] mt-1 text-sm sm:text-base">
              Información de tu cuenta y sesiones activas
            </p>
          </div>
          <div className="hidden sm:flex gap-2">
            <EditProfileDialog profile={profile} />
          </div>
        </div>
        {/* Mobile buttons */}
        <div className="flex sm:hidden flex-col gap-2">
          <EditProfileDialog profile={profile} />
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
                        {profile?.name && profile?.lastName
                          ? `${profile.name} ${profile.lastName}`
                          : "Usuario sin nombre"}
                      </h2>
                      <p className="text-muted-foreground text-sm sm:text-base break-all">
                        {profile?.email || user.email || "Sin correo"}
                      </p>
                    </div>
                    {profile?.admin && (
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        <Badge variant="default" className="text-xs sm:text-sm">
                          Administrador
                        </Badge>
                      </div>
                    )}
                  </div>
                  {profile?.admin && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                      Tienes permisos completos de administrador del sistema
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  {profile?.scanner && (
                    <Badge variant="secondary">Escáner</Badge>
                  )}
                  {isProducer && <Badge variant="outline">Productor</Badge>}
                  {profile?.new && (
                    <Badge variant="outline">Cuenta Nueva</Badge>
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
                  {profile?.email || user.email || "No disponible"}
                </p>
                {user.email_confirmed_at && (
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
                  {profile?.phone || user.phone || "No disponible"}
                </p>
                {user.phone_confirmed_at && (
                  <Badge variant="outline" className="mt-1">
                    Verificado
                  </Badge>
                )}
              </div>
            </div>

            {profile?.birthdate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Fecha de Nacimiento</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(profile.birthdate)}
                  </p>
                </div>
              </div>
            )}

            {profile?.gender && (
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Género</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {profile.gender}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Document Information Card */}
        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              Identificación
            </CardTitle>
            <CardDescription>Documentos y verificación</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile?.document_id && (
              <div className="flex items-start gap-3">
                <Fingerprint className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Documento</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.document_id}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Key className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">ID de Usuario</p>
                <p className="text-xs text-muted-foreground font-mono break-all">
                  {user.id}
                </p>
              </div>
            </div>

            {profile?.alegra_id && (
              <div className="flex items-start gap-3">
                <Key className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">ID Alegra</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.alegra_id}
                  </p>
                </div>
              </div>
            )}

            {profile?.tyc !== undefined && (
              <div className="flex items-start gap-3">
                <Shield className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Términos y Condiciones</p>
                  <Badge variant={profile.tyc ? "default" : "secondary"}>
                    {profile.tyc ? "Aceptado" : "No aceptado"}
                  </Badge>
                </div>
              </div>
            )}
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
                  {formatDate(profile?.created_at || user.created_at)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Último acceso</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(user.last_sign_in_at)}
                </p>
              </div>
            </div>

            {profile?.updated_at && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Perfil actualizado</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(profile.updated_at)}
                  </p>
                </div>
              </div>
            )}

            {user.confirmed_at && (
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Cuenta confirmada</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(user.confirmed_at)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Information Grid */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Identities Card */}
        {user.identities && user.identities.length > 0 && (
          <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Métodos de Acceso
              </CardTitle>
              <CardDescription>
                Formas en las que puedes iniciar sesión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {user.identities.map((identity) => (
                  <div key={identity.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium capitalize">
                          {identity.provider}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {identity.identity_data?.email ||
                            identity.identity_data?.phone ||
                            "Sin información"}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {formatDate(identity.created_at)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Producer Information Card */}
        {isProducer && producerData && (
          <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Información del Productor
              </CardTitle>
              <CardDescription>Productor asociado a tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                {producerData.logo && (
                  <Image
                    src={producerData.logo}
                    alt={producerData.name}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-lg">{producerData.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ID: {producerData.id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Session Information Card */}
        {session && (
          <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sesión Actual
              </CardTitle>
              <CardDescription>Información de tu sesión activa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Key className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">Token de acceso</p>
                    <p className="text-xs text-muted-foreground font-mono break-all overflow-wrap-anywhere">
                      {session.access_token.substring(0, 40)}...
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Expira en</p>
                    <p className="text-sm text-muted-foreground">
                      {session.expires_in
                        ? `${Math.floor(session.expires_in / 60)} minutos`
                        : "No disponible"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Expira el</p>
                    <p className="text-sm text-muted-foreground">
                      {session.expires_at
                        ? formatDate(
                            new Date(session.expires_at * 1000).toISOString()
                          )
                        : "No disponible"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Metadata Cards - Admin Only */}
      {profile?.admin && (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* App Metadata */}
          {user.app_metadata && Object.keys(user.app_metadata).length > 0 && (
            <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-[#303030]">
              <CardHeader>
                <CardTitle>Metadata de la Aplicación</CardTitle>
                <CardDescription>
                  Información gestionada por el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono p-3 rounded-md bg-muted overflow-x-auto max-h-64">
                  {JSON.stringify(user.app_metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* User Metadata */}
          {user.user_metadata && Object.keys(user.user_metadata).length > 0 && (
            <Card className="overflow-hidden bg-background/50 backdrop-blur-sm border-[#303030]">
              <CardHeader>
                <CardTitle>Metadata del Usuario</CardTitle>
                <CardDescription>
                  Información personalizada (editable)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono p-3 rounded-md bg-muted overflow-x-auto max-h-64">
                  {JSON.stringify(user.user_metadata, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
