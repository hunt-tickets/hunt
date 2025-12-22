import { ProductorHero } from "@/components/productor-hero";
import { BarChart3, Ticket, Megaphone, QrCode, CreditCard, Users, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: BarChart3,
    title: "Métricas en tiempo real",
    description: "Dashboard completo con estadísticas de ventas, comportamiento de usuarios y rendimiento de tus eventos.",
  },
  {
    icon: Ticket,
    title: "Gestión de tickets",
    description: "Crea y administra tus entradas de forma intuitiva. Control total sobre precios y disponibilidad.",
  },
  {
    icon: QrCode,
    title: "Escaneo QR",
    description: "Validación instantánea de entradas con escaneo QR integrado en la app.",
  },
  {
    icon: Megaphone,
    title: "Herramientas de promoción",
    description: "Marketing integrado para maximizar la visibilidad y las ventas de tus eventos.",
  },
  {
    icon: CreditCard,
    title: "Pagos seguros",
    description: "Transacciones protegidas con liquidaciones rápidas a tu cuenta.",
  },
  {
    icon: Users,
    title: "Alcance masivo",
    description: "Conecta con miles de usuarios interesados en eventos como los tuyos.",
  },
];

const stats = [
  { value: "500+", label: "Eventos creados" },
  { value: "50K+", label: "Tickets vendidos" },
  { value: "99%", label: "Satisfacción" },
  { value: "24h", label: "Soporte" },
];

export default function ProductorPage() {
  return (
    <div className="bg-background">
      <ProductorHero />

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-primary font-medium mb-3 text-sm uppercase tracking-wider">
              Funcionalidades
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Todo lo que necesitas
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Herramientas diseñadas para que gestionar tus eventos sea simple y efectivo.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isLarge = index === 0 || index === 3;
              return (
                <div
                  key={index}
                  className={`rounded-3xl bg-muted/30 dark:bg-white/[0.03] border border-border dark:border-white/10 p-6 sm:p-8 ${
                    isLarge ? "sm:col-span-2 lg:col-span-1" : ""
                  }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-muted dark:bg-white/10 flex items-center justify-center mb-5">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 bg-muted/30 dark:bg-white/[0.02]">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                  {stat.value}
                </p>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto max-w-6xl px-6">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-primary font-medium mb-3 text-sm uppercase tracking-wider">
              Proceso
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              ¿Cómo funciona?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                title: "Crea tu evento",
                description: "Configura los detalles, fechas, ubicación y tipos de entrada en minutos.",
              },
              {
                step: "02",
                title: "Vende tickets",
                description: "Comparte tu evento y empieza a vender. Nosotros manejamos los pagos.",
              },
              {
                step: "03",
                title: "Gestiona el día",
                description: "Escanea entradas con QR y accede a métricas en tiempo real.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative rounded-3xl bg-muted/30 dark:bg-white/[0.03] border border-border dark:border-white/10 p-6 sm:p-8"
              >
                <span className="text-6xl sm:text-7xl font-bold text-muted-foreground/20 absolute top-4 right-6">
                  {item.step}
                </span>
                <div className="relative z-10 pt-8 sm:pt-10">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="rounded-3xl bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted dark:bg-white/10 flex items-center justify-center mb-6 mx-auto">
              <TrendingUp className="h-8 w-8 text-foreground" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              ¿Listo para empezar?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Agenda una demo con nuestro equipo y descubre cómo Hunt puede impulsar tus eventos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                data-cal-namespace="15min"
                data-cal-link="hunt-tickets/15min"
                data-cal-config='{"layout":"month_view"}'
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Agendar Demo
              </button>
              <Link
                href="https://wa.me/573228597640"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-muted dark:bg-white/10 text-foreground font-medium border border-border dark:border-white/20 hover:bg-muted-foreground/10 dark:hover:bg-white/20 transition-colors"
              >
                Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
