"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Eye,
  ShoppingCart,
  TrendingUp,
  Users,
  Globe,
  ExternalLink,
  TrendingDown
} from "lucide-react";

interface Transaction {
  id: string;
  quantity: number;
  total: number;
  created_at: string;
  type: string;
}

interface EventWebAnalyticsProps {
  eventId: string;
  eventName: string;
  eventFlyer: string;
  transactions: Transaction[];
}

interface AnalyticsSectionProps {
  tabs: string[];
  defaultTab: string;
}

function AnalyticsSection({ tabs, defaultTab }: AnalyticsSectionProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <Card className="bg-white/[0.02] border-white/10">
      <CardContent className="p-0">
        {/* Header with tabs and visitors count */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {tabs.length > 1 ? (
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                      activeTab === tab
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            ) : (
              <h3 className="text-sm font-medium text-white">{tabs[0]}</h3>
            )}
            <span className="text-xs text-white/40 uppercase tracking-wider">VISITORS</span>
          </div>
        </div>

        {/* Empty state */}
        <div className="p-12 text-center">
          <TrendingDown className="h-12 w-12 text-white/20 mx-auto mb-4" />
          <p className="text-sm text-white/40">No data found for selected period.</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function EventWebAnalytics({
  eventId,
  eventName,
  eventFlyer,
  transactions,
}: EventWebAnalyticsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate web analytics
  const webTransactions = transactions.filter(t => t.type === 'web');

  const webRevenue = webTransactions.reduce((sum, t) => sum + t.total, 0);
  const webTicketsSold = webTransactions.reduce((sum, t) => sum + t.quantity, 0);

  // Calculate conversion metrics (simulated for now)
  const totalVisits = 1250; // This would come from actual analytics
  const uniqueVisitors = 856;
  const conversionRate = webTicketsSold > 0 ? (webTicketsSold / totalVisits * 100) : 0;

  const eventUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/eventos/${eventId}`;

  return (
    <div className="space-y-6">
      {/* Website Preview */}
      <Card className="bg-white/[0.02] border-white/10 overflow-hidden">
        <CardContent className="p-0">
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Vista Previa del Sitio Web
                </h3>
                <p className="text-xs text-white/40 mt-1">Así se ve tu evento en la web</p>
              </div>
              <a
                href={eventUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 text-xs font-medium rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all"
              >
                Abrir sitio →
              </a>
            </div>
          </div>

          {/* Browser mockup */}
          <div className="p-4 bg-gradient-to-b from-white/[0.01] to-transparent">
            <a
              href={eventUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-[#1a1a1a] rounded-lg border border-white/10 overflow-hidden shadow-2xl max-w-3xl mx-auto hover:border-white/20 transition-colors cursor-pointer group"
            >
              {/* Browser chrome */}
              <div className="bg-[#252525] px-3 py-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60"></div>
                  </div>
                  <div className="flex-1 mx-3">
                    <div className="bg-[#1a1a1a] rounded px-2 py-1 text-[10px] text-white/40 border border-white/10 truncate">
                      {eventUrl}
                    </div>
                  </div>
                </div>
              </div>

              {/* Website content preview */}
              <div className="aspect-[16/9] bg-black relative overflow-hidden">
                <img
                  src={eventFlyer || '/placeholder.svg'}
                  alt={eventName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                  <div>
                    <h2 className="text-lg font-bold text-white mb-1">{eventName}</h2>
                    <div className="flex gap-2">
                      <span className="px-2.5 py-0.5 bg-primary text-primary-foreground text-xs rounded-full font-medium">
                        Comprar tickets
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <ExternalLink className="h-8 w-8 text-white" />
                </div>
              </div>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {/* Total Visits */}
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Visitas Totales</span>
            </div>
            <div className="text-2xl font-bold mb-1">{totalVisits.toLocaleString('es-CO')}</div>
            <p className="text-xs text-white/30">Páginas vistas</p>
          </CardContent>
        </Card>

        {/* Unique Visitors */}
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Visitantes Únicos</span>
            </div>
            <div className="text-2xl font-bold mb-1">{uniqueVisitors.toLocaleString('es-CO')}</div>
            <p className="text-xs text-white/30">Usuarios únicos</p>
          </CardContent>
        </Card>

        {/* Conversion Rate */}
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Tasa de Conversión</span>
            </div>
            <div className="text-2xl font-bold mb-1">{conversionRate.toFixed(2)}%</div>
            <p className="text-xs text-white/30">Visitas a compras</p>
          </CardContent>
        </Card>

        {/* Web Revenue */}
        <Card className="bg-white/[0.02] border-white/10">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="h-3.5 w-3.5 text-white/40" />
              <span className="text-xs text-white/40 uppercase tracking-wider">Ventas Web</span>
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(webRevenue)}</div>
            <p className="text-xs text-white/30">{webTicketsSold} tickets vendidos</p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Sections Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Pages/Routes/Hostnames */}
        <AnalyticsSection
          tabs={["Pages", "Routes", "Hostnames"]}
          defaultTab="Pages"
        />

        {/* Referrers/UTM Parameters */}
        <AnalyticsSection
          tabs={["Referrers", "UTM Parameters"]}
          defaultTab="Referrers"
        />
      </div>

      {/* Second Row */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Countries */}
        <AnalyticsSection
          tabs={["Countries"]}
          defaultTab="Countries"
        />

        {/* Devices/Browsers */}
        <AnalyticsSection
          tabs={["Devices", "Browsers"]}
          defaultTab="Devices"
        />

        {/* Operating Systems */}
        <AnalyticsSection
          tabs={["Operating Systems"]}
          defaultTab="Operating Systems"
        />
      </div>
    </div>
  );
}
