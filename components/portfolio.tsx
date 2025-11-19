"use client"

import Image from "next/image"
import { ExternalLink, Globe } from "lucide-react"

interface WebsitePortfolioItem {
  id: string
  title: string
  description: string
  url: string
  screenshot: string
  tags: string[]
}

// Páginas web desarrolladas - Actualiza estos datos con tus proyectos reales
const websiteProjects: WebsitePortfolioItem[] = [
  {
    id: "1",
    title: "Perro Negro",
    description: "Plataforma de venta de tickets para eventos",
    url: "https://perronegro.biotickets.com/",
    screenshot: "/placeholder.svg", // Reemplaza con screenshot real
    tags: ["E-commerce", "Eventos"],
  },
  {
    id: "2",
    title: "Proyecto Web 2",
    description: "Descripción del segundo proyecto",
    url: "https://ejemplo2.com",
    screenshot: "/placeholder.svg", // Reemplaza con screenshot real
    tags: ["Corporativo", "Web App"],
  },
  {
    id: "3",
    title: "Proyecto Web 3",
    description: "Descripción del tercer proyecto",
    url: "https://ejemplo3.com",
    screenshot: "/placeholder.svg", // Reemplaza con screenshot real
    tags: ["Landing Page", "Marketing"],
  },
]

export function Portfolio() {
  return (
    <div className="space-y-8">
      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {websiteProjects.map((project) => (
          <a
            key={project.id}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-[4/3] rounded-[20px] overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 backdrop-blur-sm transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 block"
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
              {project.tags.map((tag, index) => (
                <div
                  key={index}
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
    </div>
  )
}
