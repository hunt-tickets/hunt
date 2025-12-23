"use client"

import { HoverButton } from "@/components/ui/hover-glow-button";
import { Users, BarChart3, Shield, Zap, Ticket, QrCode, Megaphone, CreditCard } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

const features = [
  {
    icon: Users,
    title: "Alcance Masivo",
    description: "Conecta con miles de usuarios interesados en tus eventos.",
  },
  {
    icon: BarChart3,
    title: "Métricas en Tiempo Real",
    description: "Dashboard completo con estadísticas de ventas.",
  },
  {
    icon: Shield,
    title: "Pagos Seguros",
    description: "Transacciones protegidas y liquidaciones rápidas.",
  },
  {
    icon: Zap,
    title: "Gestión Simple",
    description: "Herramientas intuitivas para tus eventos.",
  },
  {
    icon: Ticket,
    title: "Gestión de Tickets",
    description: "Control total sobre precios y disponibilidad.",
  },
  {
    icon: QrCode,
    title: "Escaneo QR",
    description: "Validación instantánea de entradas.",
  },
  {
    icon: Megaphone,
    title: "Promoción",
    description: "Marketing integrado para maximizar ventas.",
  },
  {
    icon: CreditCard,
    title: "Cobros Fáciles",
    description: "Recibe pagos directamente en tu cuenta.",
  },
];

const ProductorHero = () => {
  useEffect(() => {
    /* eslint-disable */
    // @ts-nocheck
    // Cal.com embed script
    (function (C: any, A: any, L: any) {
      const p = function (a: any, ar: any) {
        a.q.push(ar);
      };
      const d = C.document;
      C.Cal =
        C.Cal ||
        function () {
          const cal = C.Cal;
          const ar = arguments;
          if (!cal.loaded) {
            cal.ns = {};
            cal.q = cal.q || [];
            d.head.appendChild(d.createElement("script")).src = A;
            cal.loaded = true;
          }
          if (ar[0] === L) {
            const api: any = function () {
              p(api, arguments);
            };
            const namespace = ar[1];
            api.q = api.q || [];
            if (typeof namespace === "string") {
              cal.ns[namespace] = cal.ns[namespace] || api;
              p(cal.ns[namespace], ar);
              p(cal, ["initNamespace", namespace]);
            } else p(cal, ar);
            return;
          }
          p(cal, ar);
        };
    })(window as any, "https://app.cal.com/embed/embed.js", "init");

    (window as any).Cal("init", "15min", { origin: "https://cal.com" });

    (window as any).Cal.ns["15min"]("ui", {
      styles: { branding: { brandColor: "#000000" } },
      hideEventTypeDetails: false,
      layout: "month_view",
    });
    /* eslint-enable */
  }, []);

  return (
    <div className="relative z-10 min-h-svh w-screen flex flex-col items-center justify-center pt-24 md:pt-32 pb-8 px-8">
      <div className="w-full max-w-6xl space-y-12">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-md bg-gradient-to-r from-white/10 via-white/5 to-white/10 border border-white/20 hover:border-white/30 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
            <span className="text-xl">✨</span>
            <span className="text-sm font-medium tracking-wide text-white">Plataforma para Productores</span>
          </div>

          <div className="space-y-6 flex items-center justify-center flex-col">
            <h1 className="text-3xl md:text-6xl font-semibold tracking-tight max-w-3xl text-white">
              Impulsa tus eventos
            </h1>
            <p className="text-lg text-white/70 max-w-2xl">
              Gestiona, promociona y maximiza el éxito de tus eventos con nuestras herramientas especializadas.
            </p>
            <div className="flex flex-row gap-2 sm:gap-3 items-center">
              <HoverButton
                data-cal-namespace="15min"
                data-cal-link="hunt-tickets/15min"
                data-cal-config='{"layout":"month_view"}'
                className="h-[52px] sm:h-[56px] px-6 sm:px-8 rounded-full whitespace-nowrap text-sm sm:text-base font-medium bg-white text-black flex items-center justify-center"
                glowColor="#ffffff"
                backgroundColor="transparent"
                textColor="inherit"
                hoverTextColor="inherit"
              >
                Agendar Demo
              </HoverButton>
              <Link href="/eventos">
                <HoverButton
                  className="h-[52px] sm:h-[56px] px-6 sm:px-8 rounded-full whitespace-nowrap text-sm sm:text-base font-medium bg-white/10 text-white border border-white/20 backdrop-blur-sm flex items-center justify-center"
                  glowColor="#ffffff"
                  backgroundColor="transparent"
                  textColor="inherit"
                  hoverTextColor="inherit"
                >
                  Ver Eventos
                </HoverButton>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 h-40 md:h-48 flex flex-col justify-start items-start space-y-2 md:space-y-3"
            >
              <feature.icon size={18} className="text-white/80 md:w-5 md:h-5" />
              <h3 className="text-sm md:text-base font-medium text-white">{feature.title}</h3>
              <p className="text-xs md:text-sm text-white/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export { ProductorHero };
