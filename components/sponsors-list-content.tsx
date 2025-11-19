"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Sponsor {
  id: string;
  name: string;
  logo: string | null;
  category: string;
  website: string;
}

export function SponsorsListContent() {
  // Fake sponsors data
  const sponsors: Sponsor[] = [
    {
      id: "1",
      name: "Coca-Cola",
      logo: null,
      category: "Bebidas",
      website: "www.coca-cola.com",
    },
    {
      id: "2",
      name: "Nike",
      logo: null,
      category: "Deportes",
      website: "www.nike.com",
    },
    {
      id: "3",
      name: "Samsung",
      logo: null,
      category: "Tecnología",
      website: "www.samsung.com",
    },
    {
      id: "4",
      name: "Adidas",
      logo: null,
      category: "Deportes",
      website: "www.adidas.com",
    },
    {
      id: "5",
      name: "Red Bull",
      logo: null,
      category: "Bebidas",
      website: "www.redbull.com",
    },
    {
      id: "6",
      name: "Mastercard",
      logo: null,
      category: "Finanzas",
      website: "www.mastercard.com",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Bebidas":
        return "bg-gradient-to-r from-red-500/10 to-orange-500/10 text-red-400 border border-red-500/20";
      case "Deportes":
        return "bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-400 border border-blue-500/20";
      case "Tecnología":
        return "bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 border border-purple-500/20";
      case "Finanzas":
        return "bg-gradient-to-r from-green-500/10 to-emerald-500/10 text-green-400 border border-green-500/20";
      default:
        return "border-white/10 text-white/50 bg-white/[0.02]";
    }
  };

  return (
    <div className="space-y-6">
      {/* Sponsors Section */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Patrocinadores</h3>
          <p className="text-sm text-muted-foreground">
            {sponsors.length} patrocinador{sponsors.length !== 1 ? "es" : ""} registrado
            {sponsors.length !== 1 ? "s" : ""}
          </p>
        </div>

        {sponsors.length === 0 ? (
          <Card className="bg-white/[0.02] border-white/5">
            <CardContent className="py-12 text-center">
              <Building2 className="h-10 w-10 text-white/40 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-1 text-white">
                No hay patrocinadores registrados
              </h3>
              <p className="text-sm text-white/40">
                Los patrocinadores aparecerán aquí cuando sean creados
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sponsors.map((sponsor) => {
              const initials = sponsor.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <Card
                  key={sponsor.id}
                  className="group relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-xl border-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer"
                >
                  <CardContent className="relative pt-8 pb-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div>
                        {sponsor.logo ? (
                          <img
                            src={sponsor.logo}
                            alt={sponsor.name}
                            className="w-20 h-20 rounded-xl object-cover ring-2 ring-white/10 group-hover:ring-white/15 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-xl bg-white/[0.08] flex items-center justify-center ring-2 ring-white/10 group-hover:ring-white/15 transition-all duration-300 font-semibold text-lg text-white/90">
                            {initials}
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 w-full">
                        <h4 className="font-bold text-lg group-hover:text-primary transition-colors duration-300">
                          {sponsor.name}
                        </h4>

                        <Badge
                          variant="default"
                          className={`${getCategoryColor(sponsor.category)} hover:opacity-90 transition-all duration-200 shadow-sm`}
                        >
                          {sponsor.category}
                        </Badge>

                        <a
                          href={`https://${sponsor.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-white/60 hover:text-primary transition-colors flex items-center justify-center gap-2 mt-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Building2 className="h-3.5 w-3.5" />
                          {sponsor.website}
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
