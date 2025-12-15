"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, CreditCard, Mail, BarChart3, MessageSquare, Zap } from "lucide-react";

// Category types
type IntegrationCategory =
  | "payment"      // Pasarelas de Pago
  | "marketing"    // Marketing
  | "analytics"    // Analytics
  | "communication" // Comunicación
  | "automation";   // Automatización

interface Integration {
  id: string;
  name: string;
  description: string;
  logo: string;
  status: "available" | "coming-soon";
  category: IntegrationCategory;
  website?: string;
}

// Category configuration
const categoryConfig: Record<IntegrationCategory, { name: string; icon: typeof CreditCard; color: string }> = {
  payment: {
    name: "Pasarelas de Pago",
    icon: CreditCard,
    color: "text-green-600 dark:text-green-400"
  },
  marketing: {
    name: "Marketing",
    icon: Mail,
    color: "text-blue-600 dark:text-blue-400"
  },
  analytics: {
    name: "Analytics",
    icon: BarChart3,
    color: "text-purple-600 dark:text-purple-400"
  },
  communication: {
    name: "Comunicación",
    icon: MessageSquare,
    color: "text-orange-600 dark:text-orange-400"
  },
  automation: {
    name: "Automatización",
    icon: Zap,
    color: "text-yellow-600 dark:text-yellow-400"
  },
};

const integrations: Integration[] = [
  // PASARELAS DE PAGO
  {
    id: "stripe",
    name: "Stripe",
    description: "Procesa pagos con tarjeta de crédito, débito y métodos alternativos con las mejores tarifas.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    status: "coming-soon",
    category: "payment",
    website: "https://stripe.com",
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Acepta pagos en efectivo, transferencias y tarjetas con la pasarela líder en Latinoamérica.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Mercado_Pago_logo.svg/2560px-Mercado_Pago_logo.svg.png",
    status: "coming-soon",
    category: "payment",
    website: "https://mercadopago.com",
  },
  {
    id: "paypal",
    name: "PayPal",
    description: "Permite a tus clientes pagar de forma segura con sus cuentas PayPal.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg",
    status: "coming-soon",
    category: "payment",
    website: "https://paypal.com",
  },
  {
    id: "wompi",
    name: "Wompi",
    description: "Pasarela de pagos colombiana con soporte para PSE, Nequi, Daviplata y más.",
    logo: "https://pbs.twimg.com/profile_images/1339272186802065408/vA-MVR_A_400x400.png",
    status: "coming-soon",
    category: "payment",
    website: "https://wompi.co",
  },

  // MARKETING
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Sincroniza tus compradores y envía campañas de email marketing personalizadas.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Mailchimp_Logo.svg/2560px-Mailchimp_Logo.svg.png",
    status: "coming-soon",
    category: "marketing",
    website: "https://mailchimp.com",
  },
  {
    id: "meta-pixel",
    name: "Meta Pixel",
    description: "Optimiza tus campañas publicitarias en Facebook e Instagram con tracking avanzado.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    status: "coming-soon",
    category: "marketing",
    website: "https://business.facebook.com",
  },
  {
    id: "google-ads",
    name: "Google Ads",
    description: "Crea campañas publicitarias en Google y mide conversiones de tus eventos.",
    logo: "https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg",
    status: "coming-soon",
    category: "marketing",
    website: "https://ads.google.com",
  },
  {
    id: "klaviyo",
    name: "Klaviyo",
    description: "Automatiza email marketing con segmentación avanzada y flujos personalizados.",
    logo: "https://cdn.worldvectorlogo.com/logos/klaviyo-2.svg",
    status: "coming-soon",
    category: "marketing",
    website: "https://klaviyo.com",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "CRM y automatización de marketing todo-en-uno para gestionar tus clientes.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3f/HubSpot_Logo.svg",
    status: "coming-soon",
    category: "marketing",
    website: "https://hubspot.com",
  },

  // ANALYTICS
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Rastrea el comportamiento de usuarios y mide el rendimiento de tus eventos.",
    logo: "https://www.gstatic.com/analytics-suite/header/suite/v2/ic_analytics.svg",
    status: "coming-soon",
    category: "analytics",
    website: "https://analytics.google.com",
  },
  {
    id: "mixpanel",
    name: "Mixpanel",
    description: "Analytics de producto avanzado para entender el comportamiento de tus usuarios.",
    logo: "https://cdn.worldvectorlogo.com/logos/mixpanel.svg",
    status: "coming-soon",
    category: "analytics",
    website: "https://mixpanel.com",
  },
  {
    id: "amplitude",
    name: "Amplitude",
    description: "Plataforma de product analytics para optimizar la experiencia del usuario.",
    logo: "https://cdn.worldvectorlogo.com/logos/amplitude-1.svg",
    status: "coming-soon",
    category: "analytics",
    website: "https://amplitude.com",
  },
  {
    id: "hotjar",
    name: "Hotjar",
    description: "Mapas de calor, grabaciones de sesión y feedback para mejorar tu sitio.",
    logo: "https://cdn.worldvectorlogo.com/logos/hotjar.svg",
    status: "coming-soon",
    category: "analytics",
    website: "https://hotjar.com",
  },

  // COMUNICACIÓN
  {
    id: "whatsapp-business",
    name: "WhatsApp Business",
    description: "Envía confirmaciones de compra y notificaciones de eventos directamente por WhatsApp.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg",
    status: "coming-soon",
    category: "communication",
    website: "https://business.whatsapp.com",
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "Envía notificaciones por SMS para confirmaciones y recordatorios de eventos.",
    logo: "https://upload.wikimedia.org/wikipedia/commons/7/7e/Twilio-logo-red.svg",
    status: "coming-soon",
    category: "communication",
    website: "https://twilio.com",
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Infraestructura de email transaccional para enviar confirmaciones y tickets.",
    logo: "https://cdn.worldvectorlogo.com/logos/sendgrid-1.svg",
    status: "coming-soon",
    category: "communication",
    website: "https://sendgrid.com",
  },
  {
    id: "intercom",
    name: "Intercom",
    description: "Chat en vivo y soporte para atender a tus clientes en tiempo real.",
    logo: "https://cdn.worldvectorlogo.com/logos/intercom-1.svg",
    status: "coming-soon",
    category: "communication",
    website: "https://intercom.com",
  },

  // AUTOMATIZACIÓN
  {
    id: "zapier",
    name: "Zapier",
    description: "Conecta HUNT con más de 5,000 aplicaciones para automatizar flujos de trabajo.",
    logo: "https://cdn.worldvectorlogo.com/logos/zapier.svg",
    status: "coming-soon",
    category: "automation",
    website: "https://zapier.com",
  },
  {
    id: "make",
    name: "Make",
    description: "Automatización visual avanzada con flujos complejos y múltiples condiciones.",
    logo: "https://cdn.worldvectorlogo.com/logos/make-1.svg",
    status: "coming-soon",
    category: "automation",
    website: "https://make.com",
  },
  {
    id: "n8n",
    name: "n8n",
    description: "Automatización workflow open-source con control total de tus datos.",
    logo: "https://n8n.io/favicon.svg",
    status: "coming-soon",
    category: "automation",
    website: "https://n8n.io",
  },
];

export default function IntegrationsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Group integrations by category and filter by search
  const groupedIntegrations = useMemo(() => {
    const filtered = integrations.filter((integration) =>
      integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const grouped: Record<IntegrationCategory, Integration[]> = {
      payment: [],
      marketing: [],
      analytics: [],
      communication: [],
      automation: [],
    };

    filtered.forEach((integration) => {
      grouped[integration.category].push(integration);
    });

    return grouped;
  }, [searchQuery]);

  const hasResults = Object.values(groupedIntegrations).some(group => group.length > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Integraciones
        </h1>
        <p className="text-gray-600 dark:text-white/60 mt-2">
          Conecta tu organización con servicios externos para mejorar tu flujo de trabajo
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-white/50" />
        <Input
          type="text"
          placeholder="Buscar integraciones..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 pl-12 pr-4 rounded-xl border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 focus:bg-gray-200 dark:focus:bg-white/10 transition-colors text-base placeholder:text-gray-600 dark:placeholder:text-white/50"
          aria-label="Buscar integraciones"
        />
      </div>

      {/* Categories Sections */}
      {hasResults ? (
        <div className="space-y-10">
          {(Object.keys(categoryConfig) as IntegrationCategory[]).map((categoryKey) => {
            const category = categoryConfig[categoryKey];
            const categoryIntegrations = groupedIntegrations[categoryKey];

            if (categoryIntegrations.length === 0) return null;

            const Icon = category.icon;

            return (
              <div key={categoryKey} className="space-y-4">
                {/* Category Header */}
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {category.name}
                </h2>

                {/* Integrations Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {categoryIntegrations.map((integration) => {
                    const isComingSoon = integration.status === "coming-soon";

                    return (
                      <Card
                        key={integration.id}
                        className="bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 hover:bg-gray-100 dark:hover:bg-white/[0.04] transition-all group"
                      >
                        <CardContent className="p-6 flex flex-col h-full">
                          <div className="flex flex-col items-center text-center space-y-4 flex-1">
                            {/* Logo */}
                            <div className="relative w-16 h-16 rounded-2xl bg-white dark:bg-white/[0.08] ring-1 ring-gray-200 dark:ring-white/10 group-hover:scale-105 transition-transform flex items-center justify-center p-3">
                              <Image
                                src={integration.logo}
                                alt={`${integration.name} logo`}
                                width={64}
                                height={64}
                                className="object-contain"
                                unoptimized
                              />
                            </div>

                            {/* Name and Status */}
                            <div className="space-y-2 flex-1 flex flex-col">
                              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                                {integration.name}
                              </h3>
                              {isComingSoon && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20 text-xs w-fit mx-auto"
                                >
                                  Próximamente
                                </Badge>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-sm text-gray-600 dark:text-white/60 leading-relaxed line-clamp-3">
                              {integration.description}
                            </p>

                            {/* Actions */}
                            <div className="flex gap-2 w-full pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/[0.06] text-xs"
                                disabled={isComingSoon}
                              >
                                Detalles
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-gray-200 dark:border-white/10 hover:bg-white dark:hover:bg-white/[0.06] text-xs"
                                disabled={isComingSoon}
                              >
                                Instalar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-white/20" />
          <p className="text-gray-500 dark:text-white/50 text-lg font-medium mb-2">
            No se encontraron integraciones
          </p>
          <p className="text-sm text-gray-400 dark:text-white/40">
            Intenta con otro término de búsqueda
          </p>
        </div>
      )}
    </div>
  );
}
