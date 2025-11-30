import React, { ReactNode } from "react";
import { EventLayoutWrapper } from "@/components/event-layout-wrapper";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/drizzle";
import { member } from "@/lib/schema";
import { eq, and } from "drizzle-orm";

interface EventLayoutProps {
  children: ReactNode;
  params: Promise<{
    userId: string;
    organizationId: string;
    eventId: string;
  }>;
}

const EventLayout = async ({ children, params }: EventLayoutProps) => {
  const { userId, organizationId, eventId } = await params;
  const supabase = await createClient();

  // Fetch event name
  const { data: event } = await supabase
    .from("events")
    .select("name")
    .eq("id", eventId)
    .single();

  const eventName = event?.name || "Evento";

  // Fetch user's role in the organization
  const memberRecord = await db.query.member.findFirst({
    where: and(
      eq(member.userId, userId),
      eq(member.organizationId, organizationId)
    ),
  });

  const role = (memberRecord?.role as "owner" | "administrator" | "seller") || "seller";

  return (
    <EventLayoutWrapper
      userId={userId}
      organizationId={organizationId}
      eventId={eventId}
      eventName={eventName}
      role={role}
    >
      {children}
    </EventLayoutWrapper>
  );
};

export default EventLayout;
