import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { EventStickyHeader } from "@/components/event-sticky-header";
import { ProductsManager } from "@/components/products-manager";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

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
  const products = [
    {
      id: "prod-1",
      name: "Cupón Barra - 2x1 Cerveza",
      description: "Cupón válido para 2 cervezas nacionales al precio de 1",
      price: 15000,
      stock: 100,
      sold: 23,
      active: true,
      category: "Bebidas",
      image: null,
      createdAt: "2025-01-15T10:30:00Z",
    },
    {
      id: "prod-2",
      name: "Combo Burger + Cerveza",
      description: "Hamburguesa premium con papas y cerveza artesanal",
      price: 35000,
      stock: 50,
      sold: 12,
      active: true,
      category: "Comida",
      image: null,
      createdAt: "2025-01-10T08:20:00Z",
    },
    {
      id: "prod-3",
      name: "Shot Especial",
      description: "Shot de la casa con descuento",
      price: 8000,
      stock: 200,
      sold: 87,
      active: false,
      category: "Bebidas",
      image: null,
      createdAt: "2025-01-05T14:15:00Z",
    },
  ];

  return (
    <>
      <EventStickyHeader eventName={event.name} />

      <div className="px-3 py-3 sm:px-6 sm:py-6 space-y-6">
        <ProductsManager initialProducts={products} />
      </div>
    </>
  );
}
