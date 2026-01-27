import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { extractSupabasePath } from "@/supabase-image-loader";
import { db } from "@/lib/drizzle";
import { orders, member, events, tickets, user } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ticket, DollarSign, Calendar, User, Banknote, ChevronRight } from "lucide-react";
import { AdminHeader } from "@/components/admin-header";

interface MisVentasPageProps {
  params: Promise<{
    userId: string;
    organizationId: string;
  }>;
}

export default async function MisVentasPage({ params }: MisVentasPageProps) {
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

  // Fetch active events for this organization (for sellers to sell)
  const supabase = await createClient();
  const now = new Date().toISOString();

  const { data: activeEvents } = await supabase
    .from("events")
    .select("id, name, date, flyer")
    .eq("organization_id", organizationId)
    .eq("status", true)
    .or(`end_date.gte.${now},end_date.is.null`)
    .order("date", { ascending: false });

  // Fetch cash sales made by this seller
  const mySales = await db
    .select({
      order: orders,
      event: {
        id: events.id,
        name: events.name,
      },
      buyer: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
    .from(orders)
    .innerJoin(events, eq(orders.eventId, events.id))
    .innerJoin(user, eq(orders.userId, user.id))
    .where(
      and(
        eq(orders.soldBy, userId),
        eq(orders.platform, "cash"),
        eq(events.organizationId, organizationId)
      )
    )
    .orderBy(desc(orders.createdAt))
    .limit(100);

  // Get ticket counts for each order
  const orderIds = mySales.map((s) => s.order.id);
  const ticketCounts = orderIds.length > 0
    ? await db
        .select({
          orderId: tickets.orderId,
        })
        .from(tickets)
        .where(
          and(
            eq(tickets.platform, "cash")
          )
        )
    : [];

  const ticketCountMap = ticketCounts.reduce((acc, t) => {
    acc[t.orderId] = (acc[t.orderId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate totals
  const totalSales = mySales.length;
  const totalAmount = mySales.reduce(
    (sum, sale) => sum + parseFloat(sale.order.totalAmount),
    0
  );
  const totalTickets = mySales.reduce(
    (sum, sale) => sum + (ticketCountMap[sale.order.id] || 0),
    0
  );

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
      <AdminHeader
        title="Mis Ventas"
        subtitle="Ventas en efectivo realizadas por ti"
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Vendido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${totalAmount.toLocaleString()} COP
            </p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Tickets Vendidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalTickets}</p>
          </CardContent>
        </Card>

        <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ventas Realizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalSales}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Events for Selling */}
      <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Vender Entradas
          </CardTitle>
          <CardDescription>
            Selecciona un evento para realizar una venta en efectivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!activeEvents || activeEvents.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 mx-auto mb-3 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                No hay eventos activos para vender
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/profile/${userId}/organizaciones/${organizationId}/administrador/event/${event.id}/vender`}
                  className="group"
                >
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-[#303030] bg-background/30 hover:border-primary/50 hover:bg-background/50 transition-all">
                    {event.flyer ? (
                      <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={extractSupabasePath(event.flyer)}
                          alt={event.name || "Evento"}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{event.name || "Sin nombre"}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.date
                          ? new Date(event.date).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            })
                          : "Sin fecha"}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales List */}
      <Card className="bg-background/50 backdrop-blur-sm border-[#303030]">
        <CardHeader>
          <CardTitle>Historial de Ventas</CardTitle>
          <CardDescription>
            Todas las ventas en efectivo que has realizado
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mySales.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">
                Aún no has realizado ventas en efectivo
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Las ventas que realices aparecerán aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {mySales.map((sale) => (
                <div
                  key={sale.order.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-[#303030] bg-background/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{sale.buyer.name || sale.buyer.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {sale.buyer.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {sale.event.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sale.order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${parseFloat(sale.order.totalAmount).toLocaleString()} COP
                    </p>
                    <Badge variant="outline" className="mt-1">
                      {ticketCountMap[sale.order.id] || 0} ticket(s)
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
