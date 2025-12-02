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
  Shield,
  Calendar,
  Key,
  Fingerprint,
  Link2,
} from "lucide-react";
import { SiFacebook, SiGithub, SiApple } from "react-icons/si";
import { EditProfileDialog } from "@/components/edit-profile-dialog";
import { UnlinkAccountButton } from "@/components/unlink-account-button";
import { LinkAccountButton } from "@/components/link-account-button";
import { PasswordManager } from "@/components/password-manager";
import { ActiveSessionsCard } from "@/components/active-sessions-card";
import { PhoneVerificationManager } from "@/components/phone-verification-manager";
import { BirthDateManager } from "@/components/birth-date-manager";

export default async function ProfilePage() {
  // Secure authentication - validates with server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const user = session.user;

  // Fetch user's connected accounts using Better Auth API
  const oauthAccounts = await auth.api.listUserAccounts({
    headers: await headers(),
  });

  // Log to see what data is available
  console.log('OAuth Accounts:', JSON.stringify(oauthAccounts, null, 2));

  // Helper to decode JWT and extract user info
  const decodeIdToken = (idToken: string | null) => {
    if (!idToken) return null;
    try {
      // JWT has 3 parts separated by dots: header.payload.signature
      const payload = idToken.split(".")[1];
      if (!payload) return null;

      // Decode base64url
      const decoded = Buffer.from(payload, "base64").toString("utf-8");
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  };

  // Format dates
  // const formatDate = (dateString: string | undefined) => {
  //   if (!dateString) return "No disponible";
  //   return new Date(dateString).toLocaleDateString("es-ES", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  // Get provider icon component
  const getProviderIcon = (providerId: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      google: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      ),
      github: <SiGithub className="h-5 w-5" />,
      facebook: <SiFacebook className="h-5 w-5" />,
      apple: <SiApple className="h-5 w-5" />,
    };
    return iconMap[providerId] || <Link2 className="h-5 w-5" />;
  };

  // Format provider name for display
  const formatProviderName = (providerId: string) => {
    const providerNames: { [key: string]: string } = {
      google: "Google",
      facebook: "Facebook",
      github: "GitHub",
      twitter: "Twitter",
      apple: "Apple",
    };
    return (
      providerNames[providerId] ||
      providerId.charAt(0).toUpperCase() + providerId.slice(1)
    );
  };

  // Define available social providers
  const availableProviders = [
    { id: "google", name: "Google" },
    { id: "apple", name: "Apple" },
    // Add more providers here as needed
  ];

  // Find providers that are not yet connected
  const connectedProviderIds = oauthAccounts.map((acc) => acc.providerId);
  const availableToLink = availableProviders.filter(
    (provider) => !connectedProviderIds.includes(provider.id)
  );

  return (
    <div className="space-y-10 overflow-x-hidden py-8">
      {/* Profile Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name || "Usuario"}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-primary/20"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
              </div>
            )}
          </div>

          {/* Name and Email */}
          <div>
            <h1 className="text-3xl font-bold leading-tight">
              {user.name || "Usuario sin nombre"}
            </h1>
            {user.role === "admin" && (
              <Badge
                variant="default"
                className="mt-2 px-2 py-0.5 bg-purple-500/10 text-purple-400 border-purple-500/20"
              >
                <Shield className="h-3 w-3 mr-1" />
                Administrador
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* User Data Section */}
      <div className="space-y-5">
        <h2 className="text-xl font-semibold leading-tight">
          Datos de usuario
        </h2>
        <div className="space-y-3">
          {/* Name and Last Name - Two columns */}
          <div className="grid grid-cols-2 gap-3">
            {/* First Name */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 flex-1">
                <User className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  defaultValue={user.name?.split(" ")[0] || ""}
                  placeholder="Nombre/s Completo"
                  className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 flex-1">
                <User className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  defaultValue={user.name?.split(" ").slice(1).join(" ") || ""}
                  placeholder="Apellidos Completos"
                  className="text-sm font-medium bg-transparent border-none outline-none focus:ring-0 w-full placeholder:text-gray-500"
                />
              </div>
            </div>
          </div>
          {/* Email */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{user.email}</span>
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 bg-primary/10 text-primary border-primary/20"
                  >
                    Principal
                  </Badge>
                </div>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-300 invisible group-hover:visible transition-all">
              <span className="text-xl">⋯</span>
            </button>
          </div>

          {/* Phone Number */}
          <PhoneVerificationManager
            phoneNumber={user.phoneNumber}
            phoneNumberVerified={user.phoneNumberVerified ?? false}
          />

          {/* Birth Date */}
          <BirthDateManager birthDate={null} />
        </div>
      </div>

      {/* Connected Accounts Section */}
      <div className="space-y-5">
        <h2 className="text-xl font-semibold leading-tight">
          Cuentas conectadas
        </h2>
        <div className="space-y-3">
          {oauthAccounts.map(
            (account: {
              id: string;
              providerId: string;
              accountId: string;
              createdAt: Date;
              idToken?: string | null;
            }) => {
              const tokenData = decodeIdToken(account.idToken || null);
              const accountEmail = tokenData?.email || account.accountId;

              return (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getProviderIcon(account.providerId)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {formatProviderName(account.providerId)}
                        </span>
                        <span className="flex items-center gap-2">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                          </span>
                          {accountEmail && (
                            <span className="text-sm text-gray-500">
                              {accountEmail}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {account.providerId !== "credential" && (
                      <UnlinkAccountButton
                        accountId={account.id}
                        providerName={formatProviderName(account.providerId)}
                      />
                    )}
                  </div>
                </div>
              );
            }
          )}

          {/* Available Providers to Link */}
          {availableToLink.map((provider) => (
            <div
              key={provider.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getProviderIcon(provider.id)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{provider.name}</span>
                  {(provider.id === "apple" || provider.id === "google") && (
                    <span className="inline-flex h-1.5 w-1.5 rounded-full bg-orange-500"></span>
                  )}
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <LinkAccountButton
                  providerId={provider.id}
                  providerName={provider.name}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Section */}
      <div className="space-y-5">
        <h2 className="text-xl font-semibold leading-tight">Seguridad</h2>

        <div className="space-y-3">
          {/* Password */}
          <PasswordManager />

          {/* Two-step verification */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Verificación en dos pasos</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Google Authenticator, Outlook, etc.
                </p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-300 invisible group-hover:visible transition-all">
              <span className="text-xl">⋯</span>
            </button>
          </div>

          {/* Passkey */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <Fingerprint className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium">Passkey</p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Inicio de sesión sin contraseña
                </p>
              </div>
            </div>
            <button className="text-gray-400 hover:text-gray-300 invisible group-hover:visible transition-all">
              <span className="text-xl">⋯</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Devices */}
      <div className="space-y-5">
        <h2 className="text-xl font-semibold leading-tight">
          Dispositivos activos
        </h2>
        <ActiveSessionsCard />
      </div>

      {/* Danger Zone */}
      <div className="space-y-5">
        <h2 className="text-xl font-semibold leading-tight text-red-500">
          Danger Zone
        </h2>

        <div className="space-y-3">
          {/* Logout all sessions */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium">
                  Cerrar sesión en todos los dispositivos
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Cierra tu sesión en todos los dispositivos excepto este
                </p>
              </div>
            </div>
            <button className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors">
              Cerrar sesiones
            </button>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-gray-50 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] min-h-[72px] hover:border-gray-300 hover:bg-gray-100 dark:hover:border-[#3a3a3a] dark:hover:bg-[#202020] transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-sm font-medium">
                  Eliminar cuenta permanentemente
                </p>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  Una vez eliminada, no podrás recuperar tu cuenta
                </p>
              </div>
            </div>
            <button className="text-red-500 hover:text-red-400 text-sm font-medium transition-colors">
              Eliminar cuenta
            </button>
          </div>
        </div>
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
