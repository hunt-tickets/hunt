"use client";

import { ReactNode } from "react";
import { EventTabsProvider } from "@/contexts/event-tabs-context";
import { EventSidebar } from "@/components/event-sidebar";

interface UserData {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
}

type EventType = "single" | "multi_day" | "recurring" | "slots";

interface EventLayoutWrapperProps {
  children: ReactNode;
  userId: string;
  organizationId: string;
  eventId: string;
  eventName: string;
  eventType?: EventType;
  role?: "owner" | "administrator" | "seller";
  user: UserData | null;
}

export function EventLayoutWrapper({ children, userId, organizationId, eventId, eventName, eventType = "single", role = "seller", user }: EventLayoutWrapperProps) {
  return (
    <EventTabsProvider>
      <div className="min-h-screen bg-background">
        <EventSidebar
          userId={userId}
          organizationId={organizationId}
          eventId={eventId}
          eventName={eventName}
          eventType={eventType}
          role={role}
          user={user}
        />
        <main className="lg:ml-64 min-h-screen">{children}</main>
      </div>
    </EventTabsProvider>
  );
}
