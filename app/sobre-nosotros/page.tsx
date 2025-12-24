"use client";

import Link from "next/link";
import { ChevronDown, Heart, Zap, Eye, Users, Calendar, MapPin, Star } from "lucide-react";
import { GradientMeshBackground } from "@/components/ui/gradient-mesh-background";

export default function SobreNosotrosPage() {
  const stats = [
    { value: "2.4K+", label: "Usuarios", icon: Users },
    { value: "500+", label: "Eventos", icon: Calendar },
    { value: "50+", label: "Ciudades", icon: MapPin },
    { value: "99%", label: "Satisfacción", icon: Star },
  ];

  const values = [
    {
      icon: Heart,
      title: "Usuario Primero",
      description: "Cada decisión prioriza tu experiencia y satisfacción.",
    },
    {
      icon: Zap,
      title: "Innovación",
      description: "Buscamos nuevas formas de mejorar la experiencia de eventos.",
    },
    {
      icon: Eye,
      title: "Transparencia",
      description: "Claridad total en precios y procesos. Sin sorpresas.",
    },
  ];

  return (
    <div className="flex flex-col bg-background">
      {/* ============ HERO SECTION ============ */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Gradient Mesh Background */}
        <div className="absolute inset-0 z-0">
          <GradientMeshBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight tracking-tight mb-6">
            CREANDO{" "}
            <span className="text-primary">EXPERIENCIAS</span>
            <br />
            INOLVIDABLES
          </h1>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Conectamos personas con los mejores eventos. Descubre, compara y vive momentos únicos.
          </p>

          {/* Scroll Indicator */}
          <div className="animate-bounce">
            <ChevronDown className="h-8 w-8 text-white/40 mx-auto" />
          </div>
        </div>
      </section>

      {/* ============ MAIN CONTENT - Parallax Overlay ============ */}
      <section className="relative z-10 bg-background rounded-t-[32px] sm:rounded-t-[48px] -mt-16 sm:-mt-24">
        {/* Nuestra Historia */}
        <div className="container mx-auto max-w-6xl px-6 py-16 sm:py-24">
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
            <div>
              <p className="text-primary font-medium mb-3 text-sm uppercase tracking-wider">
                Nuestra Historia
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
                El Ecosistema Hunt
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Hunt está evolucionando para ser más que una plataforma de tickets.
                Conectamos eventos, productores y asistentes en un ecosistema donde
                descubrir y vivir experiencias únicas es tan emocionante como el evento mismo.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Somos un equipo apasionado dedicado a revolucionar la forma en que
                las personas descubren y disfrutan eventos en Latinoamérica.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 flex items-center justify-center">
                <span className="text-8xl sm:text-9xl font-bold text-muted-foreground/20">
                  H
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ============ BENTO GRID ============ */}
        <div className="container mx-auto max-w-6xl px-6 pb-16 sm:pb-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {/* Misión - Large Card */}
            <div className="col-span-2 row-span-2 rounded-3xl bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 p-6 sm:p-8 flex flex-col justify-between min-h-[280px] sm:min-h-[320px]">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">
                  Nuestra Misión
                </p>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                  Democratizar el acceso a eventos
                </h3>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                Facilitar la conexión entre personas y experiencias que crean
                recuerdos inolvidables, sin importar dónde estés.
              </p>
            </div>

            {/* Stats Cards */}
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="rounded-3xl bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 p-5 sm:p-6 flex flex-col justify-between min-h-[140px]"
                >
                  <Icon className="h-5 w-5 text-muted-foreground mb-3" />
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-muted-foreground text-sm">{stat.label}</p>
                  </div>
                </div>
              );
            })}

            {/* Visión - Large Card */}
            <div className="col-span-2 rounded-3xl bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 p-6 sm:p-8 flex flex-col justify-between min-h-[180px]">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-2 uppercase tracking-wider">
                  Nuestra Visión
                </p>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-3">
                  Líderes en Latinoamérica
                </h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Ser la plataforma líder donde cada experiencia cuenta y cada
                evento es una oportunidad de crear momentos únicos.
              </p>
            </div>
          </div>
        </div>

        {/* ============ VALUES SECTION ============ */}
        <div className="container mx-auto max-w-6xl px-6 pb-16 sm:pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Nuestros Valores
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="group rounded-3xl bg-muted/30 dark:bg-white/[0.03] border border-border dark:border-white/10 p-6 sm:p-8 hover:bg-muted/50 dark:hover:bg-white/[0.06] transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-muted dark:bg-white/10 flex items-center justify-center mb-5 group-hover:bg-muted-foreground/10 transition-colors">
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {value.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============ CTA SECTION ============ */}
        <div className="container mx-auto max-w-4xl px-6 pb-20 sm:pb-32">
          <div className="rounded-3xl bg-muted/50 dark:bg-white/5 border border-border dark:border-white/10 p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              ¿Listo para la aventura?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Únete a miles de personas que ya están descubriendo los mejores eventos con Hunt.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/eventos"
                className="inline-flex items-center justify-center px-8 py-4 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                Explorar Eventos
              </Link>
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
