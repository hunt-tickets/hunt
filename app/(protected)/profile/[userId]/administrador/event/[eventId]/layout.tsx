import React, { ReactNode } from "react";
import { EventLayoutWrapper } from "@/components/event-layout-wrapper";
import { createClient } from "@/lib/supabase/server";

interface EventLayoutProps {
  children: ReactNode;
  params: Promise<{
    userId: string;
    eventId: string;
  }>;
}

const EventLayout = async ({ children, params }: EventLayoutProps) => {
  const { userId, eventId } = await params;
  const supabase = await createClient();

  // Get event name for sidebar
  const { data: event } = await supabase
    .from("events")
    .select("name")
    .eq("id", eventId)
    .single();

  const eventName = event?.name || "Evento";

  return (
    <EventLayoutWrapper userId={userId} eventId={eventId} eventName={eventName}>
      {children}
    </EventLayoutWrapper>
  );
};

export default EventLayout;
