"use client"

import Image from "next/image"
import { ExternalLink, Globe, Code, Palette, Rocket, Zap } from "lucide-react"

interface WebsitePortfolioItem {
  id: string
  title: string
  description: string
  url: string
  screenshot: string
  tags: string[]
}

interface Service {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  features: string[]
}

// Páginas web desarrolladas
const websiteProjects: WebsitePortfolioItem[] = [
  {
    id: "1",
    title: "Perro Negro",
    description: "Plataforma de venta de tickets para eventos",
    url: "https://perronegro.biotickets.com/",
    screenshot: "/placeholder.svg",
    tags: ["E-commerce", "Eventos"],
  },
  {
    id: "2",
    title: "Proyecto Web 2",
    description: "Descripción del segundo proyecto",
    url: "https://ejemplo2.com",
    screenshot: "/placeholder.svg",
    tags: ["Corporativo", "Web App"],
  },
  {
    id: "3",
    title: "Proyecto Web 3",
    description: "Descripción del tercer proyecto",
    url: "https://ejemplo3.com",
    screenshot: "/placeholder.svg",
    tags: ["Landing Page", "Marketing"],
  },
]

// Servicios ofrecidos
const services: Service[] = [
  {
    id: "1",
    title: "Desarrollo Web",
    description: "Creamos sitios y aplicaciones web que destacan por su velocidad, diseño y funcionalidad. Desde landing pages hasta aplicaciones empresariales complejas.",
    icon: <Code className="h-6 w-6" />,
    features: [
      "React & Next.js para rendimiento óptimo",
      "Responsive design que funciona en todos los dispositivos",
      "SEO optimizado para máxima visibilidad",
      "Integración con APIs y servicios externos"
    ],
  },
  {
    id: "2",
    title: "Diseño UI/UX",
    description: "Diseñamos experiencias digitales que no solo se ven bien, sino que convierten visitantes en clientes. Cada decisión de diseño tiene un propósito.",
    icon: <Palette className="h-6 w-6" />,
    features: [
      "Research de usuarios y análisis de competencia",
      "Wireframes y prototipos interactivos",
      "Design systems escalables y consistentes",
      "Testing de usabilidad y mejora continua"
    ],
  },
  {
    id: "3",
    title: "E-commerce",
    description: "Construimos tiendas online que venden 24/7. Desde el catálogo hasta el checkout, optimizamos cada paso para maximizar tus conversiones.",
    icon: <Rocket className="h-6 w-6" />,
    features: [
      "Integración con pasarelas de pago seguras",
      "Sistema de gestión de inventario en tiempo real",
      "Analytics avanzados y reportes de ventas",
      "Email marketing y automatización de ventas"
    ],
  },
  {
    id: "4",
    title: "Aplicaciones Web",
    description: "Desarrollamos soluciones personalizadas que automatizan procesos, reducen costos y escalan con tu negocio. Tu visión, nuestra tecnología.",
    icon: <Zap className="h-6 w-6" />,
    features: [
      "APIs RESTful y GraphQL robustas",
      "Dashboards interactivos con data en tiempo real",
      "Automatización de workflows y procesos",
      "Integraciones con herramientas empresariales"
    ],
  },
]

interface PortfolioWithServicesProps {
  activeTab: "portfolio" | "services"
  onTabChange: (tab: "portfolio" | "services") => void
}

export function PortfolioWithServices({ activeTab, onTabChange }: PortfolioWithServicesProps) {
  return (
    <div className="space-y-16">
      {/* Minimal Premium Tabs */}
      <div className="relative">
        <div className="flex items-center gap-12">
          {/* Portfolio Tab */}
          <button
            onClick={() => onTabChange("portfolio")}
            className="group relative transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold transition-all duration-300 ${
                activeTab === "portfolio"
                  ? "text-white"
                  : "text-white/40 group-hover:text-white/60"
              }`} style={{ fontFamily: 'LOT, sans-serif' }}>
                Portafolio
              </span>
              <span className={`text-sm font-medium transition-all duration-300 ${
                activeTab === "portfolio"
                  ? "text-white/60"
                  : "text-white/30 group-hover:text-white/40"
              }`}>
                03
              </span>
            </div>

            {/* Animated Underline */}
            <div className={`h-[2px] mt-2 rounded-full transition-all duration-500 ${
              activeTab === "portfolio"
                ? "w-full bg-white"
                : "w-0 group-hover:w-1/2 bg-white/40"
            }`} />
          </button>

          {/* Services Tab */}
          <button
            onClick={() => onTabChange("services")}
            className="group relative transition-all duration-300"
          >
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-bold transition-all duration-300 ${
                activeTab === "services"
                  ? "text-white"
                  : "text-white/40 group-hover:text-white/60"
              }`} style={{ fontFamily: 'LOT, sans-serif' }}>
                Servicios
              </span>
              <span className={`text-sm font-medium transition-all duration-300 ${
                activeTab === "services"
                  ? "text-white/60"
                  : "text-white/30 group-hover:text-white/40"
              }`}>
                04
              </span>
            </div>

            {/* Animated Underline */}
            <div className={`h-[2px] mt-2 rounded-full transition-all duration-500 ${
              activeTab === "services"
                ? "w-full bg-white"
                : "w-0 group-hover:w-1/2 bg-white/40"
            }`} />
          </button>
        </div>

        {/* Subtle background line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-white/10" />
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === "portfolio" ? (
          /* Portfolio Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
            {websiteProjects.map((project, index) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-[4/3] rounded-[20px] overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 block"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Screenshot */}
                <Image
                  src={project.screenshot}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                {/* Tags */}
                <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap gap-2">
                  {project.tags.map((tag, tagIndex) => (
                    <div
                      key={tagIndex}
                      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1"
                    >
                      <span className="text-xs font-medium text-white/90">{tag}</span>
                    </div>
                  ))}
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-4 w-4 text-white/60" />
                    <span className="text-xs text-white/60">
                      {project.url.replace(/^https?:\/\//, '').split('/')[0]}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'LOT, sans-serif' }}>
                    {project.title}
                  </h3>
                  <p className="text-sm text-white/80 mb-4">{project.description}</p>

                  <div className="inline-flex items-center gap-2 text-sm text-white/90 group-hover:text-white transition-colors">
                    Visitar sitio
                    <ExternalLink className="h-4 w-4" />
                  </div>
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 bg-primary/10" />
                </div>
              </a>
            ))}
          </div>
        ) : (
          /* Minimal Services Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fadeIn">
            {services.map((service, index) => (
              <div
                key={service.id}
                className="group relative rounded-[20px] bg-white/[0.03] border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-300 p-8"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Subtle hover background */}
                <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-[20px]" />

                {/* Content */}
                <div className="relative z-10">
                  {/* Icon - minimal style */}
                  <div className="mb-5 inline-flex">
                    <div className="text-white/80 group-hover:text-white transition-colors duration-300">
                      {service.icon}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'LOT, sans-serif' }}>
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-white/60 mb-6 leading-relaxed text-sm">
                    {service.description}
                  </p>

                  {/* Divider */}
                  <div className="h-px bg-white/10 mb-6" />

                  {/* Features - more informative */}
                  <div className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex items-start gap-3 text-sm text-white/70 group-hover:text-white/80 transition-colors duration-300"
                      >
                        <div className="mt-1.5 h-1 w-1 rounded-full bg-white/40 flex-shrink-0" />
                        <span className="leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Minimal corner indicator */}
                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
