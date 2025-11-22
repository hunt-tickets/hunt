import React, { ReactNode } from "react";
import { EventLayoutWrapper } from "@/components/event-layout-wrapper";
<<<<<<< HEAD
import { createClient } from "@/lib/supabase/server";
=======
>>>>>>> a903bf6 (temp: admin config tabs implementation)

interface EventLayoutProps {
  children: ReactNode;
  params: Promise<{
    userId: string;
    eventId: string;
  }>;
}

const EventLayout = async ({ children, params }: EventLayoutProps) => {
  const { userId, eventId } = await params;
<<<<<<< HEAD
  const supabase = await createClient();

  // Get event name for sidebar
  const { data: event } = await supabase
    .from("events")
    .select("name")
    .eq("id", eventId)
    .single();

  const eventName = event?.name || "Evento";
=======

  // Mock: Get event name - In production, fetch from database
  const eventName = "Concierto de Rock"; // Mock data
>>>>>>> a903bf6 (temp: admin config tabs implementation)

  return (
    <EventLayoutWrapper userId={userId} eventId={eventId} eventName={eventName}>
      {children}
    </EventLayoutWrapper>
  );
};

export default EventLayout;
