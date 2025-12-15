"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Users, Percent, Wallet } from "lucide-react";
import { ReferralAdminContent } from "@/components/referral-admin-content";
import { PaymentsContent } from "@/components/payments-content";
import { RebateContent } from "@/components/rebate-content";

interface ReferralTabsProps {
  userId: string;
}

type TabType = "referidos" | "rebate" | "pagos";

export function ReferralTabs({ userId }: ReferralTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get initial tab from URL or default to "referidos"
  const tabFromUrl = (searchParams.get("tab") as TabType) || "referidos";
  const [activeTab, setActiveTab] = useState<TabType>(tabFromUrl);

  // Sync state with URL on mount and when URL changes
  useEffect(() => {
    const urlTab = searchParams.get("tab") as TabType;
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [searchParams, activeTab]);

  // Update URL when tab changes
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  const tabs = [
    { value: "referidos", icon: Users, label: "Referidos" },
    { value: "rebate", icon: Percent, label: "Rebate" },
    { value: "pagos", icon: Wallet, label: "Pagos" },
  ] as const;

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="space-y-6">
        {/* Tabs */}
        <div
          role="tablist"
          aria-label="Secciones de referidos"
          className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={isActive}
                aria-controls={`${tab.value}-panel`}
                id={`${tab.value}-tab`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleTabChange(tab.value)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-full transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gray-100 dark:bg-white/10 text-foreground border border-gray-200 dark:border-white/20"
                    : "text-gray-600 dark:text-white/60 hover:text-foreground dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10"
                }`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "referidos" && (
            <div
              role="tabpanel"
              id="referidos-panel"
              aria-labelledby="referidos-tab"
              tabIndex={0}
            >
              <ReferralAdminContent userId={userId} />
            </div>
          )}

          {activeTab === "rebate" && (
            <div
              role="tabpanel"
              id="rebate-panel"
              aria-labelledby="rebate-tab"
              tabIndex={0}
            >
              <RebateContent userId={userId} />
            </div>
          )}

          {activeTab === "pagos" && (
            <div
              role="tabpanel"
              id="pagos-panel"
              aria-labelledby="pagos-tab"
              tabIndex={0}
            >
              <PaymentsContent userId={userId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
