import {
  CheckCircle,
  Ticket,
  Calendar,
  MapPin,
  Sparkles,
  PartyPopper,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/drizzle";
import { eq } from "drizzle-orm";
import { orders } from "@/lib/schema";
import { extractSupabasePath } from "@/supabase-image-loader";

interface SuccessPageProps {
  searchParams: Promise<{
    payment_id?: string;
    status?: string;
    external_reference?: string;
    preference_id?: string;
  }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { payment_id } = await searchParams;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userId = session?.user?.id;

  // Fetch order details using payment_id
  let orderData = null;
  if (payment_id) {
    try {
      orderData = await db.query.orders.findFirst({
        where: eq(orders.paymentSessionId, payment_id),
        columns: {
          id: true,
          totalAmount: true,
          createdAt: true,
        },
        with: {
          event: {
            columns: {
              id: true,
              name: true,
              date: true,
              flyer: true,
            },
            with: {
              venues: {
                columns: { name: true, city: true },
              },
            },
          },
          orderItems: {
            columns: {
              id: true,
              quantity: true,
              subtotal: true,
            },
            with: {
              ticketType: {
                columns: {
                  id: true,
                  name: true,
                  price: true,
                },
              },
            },
          },
        },
      });

      console.log('[Payment Success] Order data:', orderData ? 'found' : 'not found');
      console.log('[Payment Success] Payment ID:', payment_id);
      if (orderData) {
        console.log('[Payment Success] Order items count:', orderData.orderItems?.length || 0);
      }
    } catch (error) {
      console.error('[Payment Success] Error fetching order:', error);
    }
  }

  // Get the foreign-key ables
  const event = orderData?.event;
  const orderItems = orderData?.orderItems;
  const totalTickets = orderData?.orderItems.reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0,
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Confetti-like background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 text-green-500/20 animate-pulse">
          <Sparkles className="h-8 w-8" />
        </div>
        <div className="absolute top-40 right-20 text-green-500/20 animate-pulse delay-100">
          <PartyPopper className="h-10 w-10" />
        </div>
        <div className="absolute bottom-40 left-20 text-green-500/20 animate-pulse delay-200">
          <Sparkles className="h-6 w-6" />
        </div>
        <div className="absolute bottom-20 right-10 text-green-500/20 animate-pulse delay-300">
          <PartyPopper className="h-8 w-8" />
        </div>
      </div>

      <div className="max-w-lg w-full relative z-10">
        {/* Success Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 mb-4">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            ¡Compra Exitosa!
          </h1>
          <p className="text-white/60">Tus entradas están listas</p>
        </div>
        {/* Event Card */}
        {event && (
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden mb-4">
            {/* Event Flyer */}
            {event.flyer && (
              <div className="relative h-40 w-full">
                <Image
                  src={extractSupabasePath(event.flyer)}
                  alt={event.name || "Event"}
                  fill
                  sizes="672px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 z-10">
                  <h2 className="text-xl font-bold text-white truncate">
                    {event.name}
                  </h2>
                </div>
              </div>
            )}

            {/* Event Details */}
            <div className="p-4 space-y-3">
              {!event.flyer && (
                <h2 className="text-xl font-bold text-white mb-3">
                  {event.name}
                </h2>
              )}

              <div className="flex items-center gap-3 text-white/60 text-sm">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>
                  {event.date
                    ? new Date(event.date).toLocaleDateString("es-CO", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Fecha por confirmar"}
                </span>
              </div>

              {event.venues && (
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {event.venues.name}
                    {event.venues.city && `, ${event.venues.city}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Tickets Summary */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <Ticket className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-white">Tus Entradas</h3>
            <span className="ml-auto bg-green-500/20 text-green-400 text-xs font-medium px-2 py-1 rounded-full">
              {totalTickets} {totalTickets === 1 ? "entrada" : "entradas"}
            </span>
          </div>

          {orderItems && orderItems.length > 0 ? (
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {orderItems.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
                >
                  <div>
                    <p className="text-white font-medium">
                      {item.ticketType?.name || "Entrada"}
                    </p>
                    <p className="text-white/40 text-sm">
                      {item.quantity} × $
                      {Number(item.ticketType?.price || 0).toLocaleString(
                        "es-CO",
                      )}
                    </p>
                  </div>
                  <p className="text-white font-semibold">
                    ${Number(item.subtotal).toLocaleString("es-CO")}
                  </p>
                </div>
              ))}

              {/* Total */}
              <div className="flex items-center justify-between pt-3 border-t border-white/10">
                <span className="text-white/60">Total pagado</span>
                <span className="text-xl font-bold text-green-400">
                  ${Number(orderData?.totalAmount || 0).toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-white/40 text-sm text-center py-4">
              Procesando tu compra...
            </p>
          )}
        </div>
        {/* Info Message */}
        <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mb-6 text-center">
          <p className="text-white/60 text-sm">
            📧 Recibirás un correo con tus entradas y código QR.
          </p>
          <p className="text-white/40 text-xs mt-2">
            También puedes verlas en tu perfil en cualquier momento.
          </p>
          <p className="text-white/40 text-xs mt-2">
            Ante reclamos o solicitudes por facturación electrónica o
            reembolsos, comunicarse directamente con el Productor y/o Promotor
            del evento, cuyos canales de comunicación son: Correo: Cel:{" "}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href={userId ? `/profile/${userId}/entradas` : "/"}
            className="flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-xl transition-colors font-semibold text-lg"
          >
            <Ticket className="h-5 w-5" />
            Ver mis entradas
          </Link>

          {event && (
            <Link
              href={`/eventos/${event.id}`}
              className="block w-full text-center text-white/60 hover:text-white py-3 transition-colors text-sm"
            >
              Volver al evento
            </Link>
          )}
        </div>
        {/* Payment ID (subtle) */}
        {payment_id && (
          <p className="text-center text-white/20 text-xs mt-6">
            ID de transacción: {payment_id}
          </p>
        )}
      </div>
    </div>
  );
}
