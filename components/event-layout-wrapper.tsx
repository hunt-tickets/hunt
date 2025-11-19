"use client";

import { ReactNode } from "react";
import { EventTabsProvider } from "@/contexts/event-tabs-context";
import { EventSidebar } from "@/components/event-sidebar";

interface EventLayoutWrapperProps {
  children: ReactNode;
  userId: string;
  eventId: string;
  eventName: string;
}

export function EventLayoutWrapper({ children, userId, eventId, eventName }: EventLayoutWrapperProps) {
  return (
    <EventTabsProvider>
      <div className="min-h-screen bg-background">
        <EventSidebar userId={userId} eventId={eventId} eventName={eventName} />
        <main className="lg:ml-64 min-h-screen">{children}</main>
      </div>
    </EventTabsProvider>
  );
}
