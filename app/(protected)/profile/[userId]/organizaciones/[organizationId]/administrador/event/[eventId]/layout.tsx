import React, { ReactNode } from "react";
import { EventLayoutWrapper } from "@/components/event-layout-wrapper";

interface EventLayoutProps {
  children: ReactNode;
  params: Promise<{
    userId: string;
    eventId: string;
  }>;
}

const EventLayout = async ({ children, params }: EventLayoutProps) => {
  const { userId, eventId } = await params;

  // Mock: Get event name - In production, fetch from database
  const eventName = "Concierto de Rock"; // Mock data

  return (
    <EventLayoutWrapper userId={userId} eventId={eventId} eventName={eventName}>
      {children}
    </EventLayoutWrapper>
  );
};

export default EventLayout;
