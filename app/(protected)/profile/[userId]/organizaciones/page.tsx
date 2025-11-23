import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Building2, Calendar } from "lucide-react";
import { CreateOrganizationDialog } from "@/components/create-organization-dialog";

export default async function OrganizacionesPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  // Fetch user's organizations using Better Auth API
  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });

  // Format dates
  const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return "No disponible";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
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
              MIS ORGANIZACIONES
            </h1>
            <p className="text-[#404040] mt-1 text-sm sm:text-base">
              Gestiona tus organizaciones y sus miembros
            </p>
          </div>
          <div className="hidden sm:flex gap-2">
            <CreateOrganizationDialog />
          </div>
        </div>
        {/* Mobile button */}
        <div className="flex sm:hidden flex-col gap-2">
          <CreateOrganizationDialog />
        </div>
      </div>

      {/* Organizations List */}
      {organizations && organizations.length > 0 ? (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {organizations.map((org) => (
            <Link
              key={org.id}
              href={`/profile/${userId}/organizaciones/${org.id}`}
              className="block"
            >
              <Card className="bg-background/50 backdrop-blur-sm border-[#303030] hover:border-primary/50 transition-colors cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {org.logo ? (
                        <img
                          src={org.logo}
                          alt={org.name}
                          className="h-12 w-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-xl">{org.name}</CardTitle>
                        <CardDescription className="text-sm">
                          @{org.slug}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Creada el {formatDate(org.createdAt)}</span>
                  </div>
                  {org.metadata && (
                    <div className="text-xs text-muted-foreground">
                      <pre className="overflow-auto max-h-20">
                        {JSON.stringify(org.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">
                No tienes organizaciones
              </h3>
              <p className="text-muted-foreground max-w-md">
                Crea tu primera organización para comenzar a gestionar equipos y
                proyectos.
              </p>
            </div>
            <CreateOrganizationDialog />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
