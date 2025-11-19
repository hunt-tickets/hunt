"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type DashboardTab = "dashboard" | "borderaux" | "web";
type SalesTab = "sellers" | "transactions" | "links";
type AccessControlTab = "analytics" | "list";
type ConfigTab = "information" | "images" | "payment" | "wallet" | "faqs";
type TeamTab = "productores" | "vendedores" | "artistas";

interface EventTabsContextValue {
  dashboardTab: DashboardTab;
  setDashboardTab: (tab: DashboardTab) => void;
  salesTab: SalesTab;
  setSalesTab: (tab: SalesTab) => void;
  chartColor: string;
  setChartColor: (color: string) => void;
  accessControlTab: AccessControlTab;
  setAccessControlTab: (tab: AccessControlTab) => void;
  configTab: ConfigTab;
  setConfigTab: (tab: ConfigTab) => void;
  teamTab: TeamTab;
  setTeamTab: (tab: TeamTab) => void;
}

const EventTabsContext = createContext<EventTabsContextValue | undefined>(undefined);

export function EventTabsProvider({ children }: { children: ReactNode }) {
  const [dashboardTab, setDashboardTab] = useState<DashboardTab>("dashboard");
  const [salesTab, setSalesTab] = useState<SalesTab>("sellers");
  const [chartColor, setChartColor] = useState<string>("gray");
  const [accessControlTab, setAccessControlTab] = useState<AccessControlTab>("analytics");
  const [configTab, setConfigTab] = useState<ConfigTab>("information");
  const [teamTab, setTeamTab] = useState<TeamTab>("productores");

  return (
    <EventTabsContext.Provider
      value={{
        dashboardTab,
        setDashboardTab,
        salesTab,
        setSalesTab,
        chartColor,
        setChartColor,
        accessControlTab,
        setAccessControlTab,
        configTab,
        setConfigTab,
        teamTab,
        setTeamTab,
      }}
    >
      {children}
    </EventTabsContext.Provider>
  );
}

export function useEventTabs() {
  const context = useContext(EventTabsContext);
  if (context === undefined) {
    throw new Error("useEventTabs must be used within an EventTabsProvider");
  }
  return context;
}
