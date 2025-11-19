"use client";

import { useState } from "react";
import { Users, Mic, MapPin, Gift } from "lucide-react";
import { ProducersListContent } from "@/components/producers-list-content";
import { ArtistsListContent } from "@/components/artists-list-content";
import { VenuesListContent } from "@/components/venues-list-content";
import { SponsorsListContent } from "@/components/sponsors-list-content";

interface Artist {
  id: string;
  name: string | null;
  description: string | null;
  category: string | null;
  logo: string | null;
}

interface Venue {
  id: string;
  name: string | null;
  logo: string | null;
  address: string | null;
  city: string | null;
}

interface Producer {
  id: string;
  name: string | null;
  logo: string | null;
}

interface MarcasTabsProps {
  producers: Producer[];
  artists: Artist[];
  venues: Venue[];
  userId: string;
}

type TabType = "producers" | "artists" | "venues" | "sponsors";

export function MarcasTabs({ producers, artists, venues, userId }: MarcasTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("producers");

  const tabs = [
    {
      id: "producers" as TabType,
      label: "Productores",
      icon: Users,
    },
    {
      id: "artists" as TabType,
      label: "Artistas",
      icon: Mic,
    },
    {
      id: "venues" as TabType,
      label: "Venues",
      icon: MapPin,
    },
    {
      id: "sponsors" as TabType,
      label: "Patrocinadores",
      icon: Gift,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-white/10 text-white border border-white/20"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "producers" && (
        <ProducersListContent producers={producers} userId={userId} />
      )}

      {activeTab === "artists" && (
        <ArtistsListContent artists={artists} />
      )}

      {activeTab === "venues" && (
        <VenuesListContent venues={venues} />
      )}

      {activeTab === "sponsors" && (
        <SponsorsListContent />
      )}
    </div>
  );
}
