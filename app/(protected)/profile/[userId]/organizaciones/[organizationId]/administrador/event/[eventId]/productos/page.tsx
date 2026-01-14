import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventStickyHeader } from "@/components/event-sticky-header";
// import { ProductsManager } from "@/components/products-manager";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Store, QrCode, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import type { Metadata } from "next";

// Generate metadata for SEO
export const metadata: Metadata = {
  title: "Productos - Próximamente | Hunt Tickets",
  description:
    "Sistema de productos de Hunt Tickets - Próximamente disponible.",
  robots: {
    index: false,
    follow: false,
  },
};

interface ProductosPageProps {
  params: Promise<{
    eventId: string;
    userId: string;
    organizationId: string;
  }>;
}

export default async function ProductosPage({ params }: ProductosPageProps) {
  const { userId, eventId, organizationId } = await params;
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

  // Check if user can manage events (sellers cannot)
  const canManageEvents = await auth.api.hasPermission({
    headers: reqHeaders,
    body: {
      permission: { event: ["update"] },
      organizationId,
    },
  });

  if (!canManageEvents?.success) {
    redirect(`/profile/${userId}/organizaciones/${organizationId}/administrador/event/${eventId}/vender`);
  }

  const supabase = await createClient();

  // Fetch event
  const { data: event } = await supabase
    .from("events")
    .select("id, name, status")
    .eq("id", eventId)
    .single();

  if (!event) {
    notFound();
  }

  // Mock products data - In production, fetch from database
  // const products = [
  //   {
  //     id: "prod-1",
  //     name: "Cupón Barra - 2x1 Cerveza",
  //     description: "Cupón válido para 2 cervezas nacionales al precio de 1",
  //     price: 15000,
  //     stock: 100,
  //     sold: 23,
  //     active: true,
  //     category: "Bebidas",
  //     image: null,
  //     createdAt: "2025-01-15T10:30:00Z",
  //   },
  //   {
  //     id: "prod-2",
  //     name: "Combo Burger + Cerveza",
  //     description: "Hamburguesa premium con papas y cerveza artesanal",
  //     price: 35000,
  //     stock: 50,
  //     sold: 12,
  //     active: true,
  //     category: "Comida",
  //     image: null,
  //     createdAt: "2025-01-10T08:20:00Z",
  //   },
  //   {
  //     id: "prod-3",
  //     name: "Shot Especial",
  //     description: "Shot de la casa con descuento",
  //     price: 8000,
  //     stock: 200,
  //     sold: 87,
  //     active: false,
  //     category: "Bebidas",
  //     image: null,
  //     createdAt: "2025-01-05T14:15:00Z",
  //   },
  // ];

  const features = [
    {
      icon: ShoppingBag,
      title: "Venta de Productos",
      description: "Vende cupones, comida, bebidas y merchandising en tu evento",
    },
    {
      icon: QrCode,
      title: "Códigos QR",
      description: "Genera códigos QR únicos para cada producto vendido",
    },
    {
      icon: CreditCard,
      title: "Pagos Integrados",
      description: "Acepta pagos en efectivo y con tarjeta para tus productos",
    },
  ];

  return (
    <>
      <EventStickyHeader eventName={event.name} />

      <div className="py-3 sm:py-6 space-y-6">
        {/* Coming Soon Card */}
        <Card className="bg-white dark:bg-[#202020] border-gray-200 dark:border-[#2a2a2a]">
          <CardContent className="p-8 sm:p-12">
            <div className="flex flex-col items-center text-center space-y-6 max-w-2xl mx-auto">
              {/* Icon */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Store className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400" />
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
                  Sistema de Productos
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-white/60">
                  Estamos trabajando en un sistema completo de gestión de productos para tus eventos
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

        {/* Original ProductsManager - Commented out for "Coming Soon" page */}
        {/* <ProductsManager initialProducts={products} /> */}
      </div>
    </>
  );
}
