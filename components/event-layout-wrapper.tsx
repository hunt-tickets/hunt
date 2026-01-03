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
  user?: UserData | null;
}

export function EventLayoutWrapper({
  children,
  userId,
  organizationId,
  eventId,
  eventName,
  eventType = "single",
}: EventLayoutWrapperProps) {
  return (
    <EventTabsProvider>
      {/*
        Parent /administrador/layout.tsx provides lg:ml-64 and padding.
        We use negative margins to reset the parent's padding, then apply our own layout.
        AdminSidebar hides itself when pathname includes /event/, so only EventSidebar shows.
      */}
      <div className="min-h-screen bg-background -mx-4 sm:-mx-6 lg:-mx-8 -mt-4 sm:-mt-6 lg:-mt-8 lg:-ml-64">
        <EventSidebar
          userId={userId}
          organizationId={organizationId}
          eventId={eventId}
          eventName={eventName}
          eventType={eventType}
          // role={role}
          // user={user}
        />
        <main className="lg:ml-64 min-h-screen pt-4 px-4 sm:pt-6 sm:px-6 lg:pt-8 lg:px-8">
          {children}
        </main>
      </div>
    </EventTabsProvider>
  );
}
