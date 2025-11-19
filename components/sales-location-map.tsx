"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useState } from "react";

interface LocationData {
  city: string;
  country: string;
  count: number;
  revenue: number;
  coordinates: { lat: number; lng: number };
}

interface SalesLocationMapProps {
  locationData?: LocationData[];
}

export function SalesLocationMap({ locationData }: SalesLocationMapProps) {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Datos simulados con coordenadas lat/lng reales
  const defaultLocationData: LocationData[] = [
    { city: "Bogotá", country: "Colombia", count: 142, revenue: 28400000, coordinates: { lat: 4.7, lng: -74.1 } },
    { city: "Medellín", country: "Colombia", count: 89, revenue: 17800000, coordinates: { lat: 6.2, lng: -75.6 } },
    { city: "Ciudad de México", country: "México", count: 76, revenue: 15200000, coordinates: { lat: 19.4, lng: -99.1 } },
    { city: "Buenos Aires", country: "Argentina", count: 67, revenue: 13400000, coordinates: { lat: -34.6, lng: -58.4 } },
    { city: "Madrid", country: "España", count: 54, revenue: 10800000, coordinates: { lat: 40.4, lng: -3.7 } },
    { city: "São Paulo", country: "Brasil", count: 41, revenue: 8200000, coordinates: { lat: -23.5, lng: -46.6 } },
    { city: "Lima", country: "Perú", count: 33, revenue: 6600000, coordinates: { lat: -12.0, lng: -77.0 } },
    { city: "Miami", country: "USA", count: 28, revenue: 5600000, coordinates: { lat: 25.8, lng: -80.2 } },
    { city: "Barcelona", country: "España", count: 19, revenue: 3800000, coordinates: { lat: 41.4, lng: 2.2 } },
    { city: "Santiago", country: "Chile", count: 15, revenue: 3000000, coordinates: { lat: -33.4, lng: -70.7 } },
  ];

  const locations = locationData || defaultLocationData;
  const maxCount = Math.max(...locations.map(l => l.count));

  // Convert lat/lng to 2D map coordinates (simple equirectangular projection)
  const latLngToXY = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    return { x, y };
  };

  return (
    <Card className="bg-white/[0.02] border-white/10 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Ventas por Ubicación
            </h3>
            <p className="text-xs text-white/40 mt-1">Distribución geográfica mundial de compradores</p>
          </div>
        </div>

        <div className="grid md:grid-cols-[1fr,320px] gap-6">
          {/* 2D Map */}
          <div className="relative">
            <div className="aspect-[2/1] bg-gradient-to-br from-blue-950/20 to-purple-950/20 rounded-xl border border-white/5 overflow-hidden relative">
              {/* World map SVG */}
              <svg viewBox="0 0 800 400" className="w-full h-full">
                {/* Simple world map outline */}
                <path
                  d="M120,100 L160,80 L200,85 L240,75 L280,90 L320,85 L360,95 L400,90 L440,100 L480,95 L520,105 L560,100 L600,110 L640,105 L680,115 L680,280 L640,285 L600,275 L560,280 L520,270 L480,275 L440,265 L400,270 L360,260 L320,265 L280,255 L240,260 L200,250 L160,255 L120,245 Z M200,150 L220,140 L240,145 L260,140 L280,150 L300,145 L300,220 L280,225 L260,220 L240,225 L220,220 L200,225 Z"
                  fill="rgba(59, 130, 246, 0.1)"
                  stroke="rgba(59, 130, 246, 0.3)"
                  strokeWidth="1"
                />

                {/* Location markers */}
                {locations.map((location) => {
                  const { x, y } = latLngToXY(location.coordinates.lat, location.coordinates.lng, 800, 400);
                  const isHovered = hoveredCity === location.city;
                  const size = 6 + (location.count / maxCount) * 12;

                  return (
                    <g key={location.city}>
                      {/* Glow effect */}
                      {isHovered && (
                        <circle
                          cx={x}
                          cy={y}
                          r={size * 2}
                          fill="rgba(59, 130, 246, 0.3)"
                          className="animate-pulse"
                        />
                      )}

                      {/* Main marker */}
                      <circle
                        cx={x}
                        cy={y}
                        r={size}
                        fill={isHovered ? "rgb(96, 165, 250)" : "rgb(59, 130, 246)"}
                        stroke="rgba(255, 255, 255, 0.8)"
                        strokeWidth="2"
                        className="cursor-pointer transition-all duration-300"
                        style={{
                          filter: isHovered
                            ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))'
                            : 'drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))',
                          transform: isHovered ? 'scale(1.2)' : 'scale(1)',
                          transformOrigin: `${x}px ${y}px`,
                        }}
                        onMouseEnter={() => setHoveredCity(location.city)}
                        onMouseLeave={() => setHoveredCity(null)}
                      />

                      {/* Connecting line */}
                      <line
                        x1={x}
                        y1={y}
                        x2={x}
                        y2={y + size * 1.5}
                        stroke={isHovered ? "rgba(59, 130, 246, 0.6)" : "rgba(59, 130, 246, 0.3)"}
                        strokeWidth="1"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Tooltip */}
              {hoveredCity && (
                <div className="absolute top-4 right-4 bg-black/90 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3 shadow-2xl z-50">
                  <div className="text-sm font-semibold text-white mb-0.5">
                    {hoveredCity}
                  </div>
                  <div className="text-xs text-white/50 mb-2">
                    {locations.find(l => l.city === hoveredCity)?.country}
                  </div>
                  <div className="text-xs text-white/70">
                    <span className="font-medium">{locations.find(l => l.city === hoveredCity)?.count}</span> ventas
                  </div>
                  <div className="text-xs font-medium text-blue-400 mt-1">
                    {formatCurrency(locations.find(l => l.city === hoveredCity)?.revenue || 0)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cities List */}
          <div className="space-y-2">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-3">Top Ciudades</div>
            {locations.slice(0, 8).map((location) => {
              const percentage = (location.count / locations.reduce((sum, l) => sum + l.count, 0)) * 100;
              const isHovered = hoveredCity === location.city;

              return (
                <div
                  key={location.city}
                  className={`p-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isHovered ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/[0.02] border border-white/5'
                  }`}
                  onMouseEnter={() => setHoveredCity(location.city)}
                  onMouseLeave={() => setHoveredCity(null)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isHovered ? 'bg-blue-400' : 'bg-white/40'
                      }`}></div>
                      <span className="text-sm font-medium">{location.city}</span>
                    </div>
                    <span className="text-xs text-white/60">{location.count}</span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHovered ? 'bg-blue-400' : 'bg-blue-500/60'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>

                  <div className="text-xs text-white/40 mt-1">
                    {formatCurrency(location.revenue)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/5">
          <div>
            <div className="text-xs text-white/40 mb-1">Total Ciudades</div>
            <div className="text-xl font-bold">{locations.length}</div>
          </div>
          <div>
            <div className="text-xs text-white/40 mb-1">Ciudad Principal</div>
            <div className="text-xl font-bold">{locations[0]?.city}</div>
          </div>
          <div>
            <div className="text-xs text-white/40 mb-1">Concentración</div>
            <div className="text-xl font-bold">
              {((locations[0]?.count / locations.reduce((sum, l) => sum + l.count, 0)) * 100).toFixed(0)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
