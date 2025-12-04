"use client";

import { useState } from "react";
import { Users, Percent } from "lucide-react";
import { ReferralAdminContent } from "@/components/referral-admin-content";

interface ReferralTabsProps {
  userId: string;
}

type TabType = "referidos" | "rebate";

export function ReferralTabs({ userId }: ReferralTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("referidos");

  const tabs = [
    { value: "referidos", icon: Users, label: "Referidos" },
    { value: "rebate", icon: Percent, label: "Rebate" },
  ] as const;

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gray-100 dark:bg-white/10 text-foreground border border-gray-200 dark:border-white/20"
                    : "text-gray-600 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "referidos" && (
            <ReferralAdminContent userId={userId} />
          )}

          {activeTab === "rebate" && (
            <div className="space-y-4">
              {/* Rebate content will go here */}
              <div className="p-8 text-center border border-dashed border-gray-300 dark:border-white/10 rounded-2xl">
                <Percent className="h-12 w-12 text-gray-400 dark:text-white/40 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Programa de Rebate
                </h3>
                <p className="text-sm text-gray-600 dark:text-white/60">
                  El contenido del programa de rebate se agregará próximamente
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
