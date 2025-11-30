"use client";

import { ReactNode } from "react";
import { EventTabsProvider } from "@/contexts/event-tabs-context";
import { EventSidebar } from "@/components/event-sidebar";

interface EventLayoutWrapperProps {
  children: ReactNode;
  userId: string;
  organizationId: string;
  eventId: string;
  eventName: string;
  role?: "owner" | "administrator" | "seller";
}

export function EventLayoutWrapper({ children, userId, organizationId, eventId, eventName, role = "seller" }: EventLayoutWrapperProps) {
  return (
    <EventTabsProvider>
      <div className="min-h-screen bg-background">
        <EventSidebar userId={userId} organizationId={organizationId} eventId={eventId} eventName={eventName} role={role} />
        <main className="min-h-screen pt-4 px-4 sm:pt-6 sm:px-6 lg:pt-8 lg:px-8">{children}</main>
      </div>
    </EventTabsProvider>
  );
}
