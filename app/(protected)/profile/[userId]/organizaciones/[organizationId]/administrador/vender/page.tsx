import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { extractSupabasePath } from "@/supabase-image-loader";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, Banknote, ChevronRight } from "lucide-react";
import { AdminHeader } from "@/components/admin-header";

interface VenderPageProps {
  params: Promise<{
    userId: string;
    organizationId: string;
  }>;
}

export default async function VenderPage({ params }: VenderPageProps) {
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

  // Fetch active events for this organization
  // Only show events that are active (not cancelled or pending cancellation)
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: activeEvents } = await supabase
    .from("events")
    .select("id, name, date, flyer")
    .eq("organization_id", organizationId)
    .eq("status", true)
    .eq("lifecycle_status", "active") // Only active events (not cancelled)
    .or(`end_date.gte.${now},end_date.is.null`)
    .order("date", { ascending: false });

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      <AdminHeader
        title="Vender Entradas"
        subtitle="Selecciona un evento para realizar una venta en efectivo"
      />

      <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Eventos Activos
          </CardTitle>
          <CardDescription>
            Haz clic en un evento para vender entradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!activeEvents || activeEvents.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                No hay eventos activos para vender
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Contacta a un administrador para activar eventos
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/profile/${userId}/organizaciones/${organizationId}/administrador/event/${event.id}/vender`}
                  className="group"
                >
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-[#303030] bg-background/30 hover:border-primary/50 hover:bg-background/50 transition-all">
                    {event.flyer ? (
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={extractSupabasePath(event.flyer)}
                          alt={event.name || "Evento"}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base truncate">
                        {event.name || "Sin nombre"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.date
                          ? new Date(event.date).toLocaleDateString("es-ES", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })
                          : "Sin fecha"}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
