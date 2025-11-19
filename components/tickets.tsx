import { Ticket } from "@/lib/supabase/types";
import { TicketsContainer } from "./tickets-container";

interface TicketsProps {
  tickets: Ticket[];
  eventId: string;
  variableFee?: number;
}

/**
 * Server Component: Tickets Section Wrapper
 *
 * OPTIMIZATION STRATEGY (based on RSC payload best practices):
 *
 * 1. This component is a SERVER component (no "use client")
 *    - Renders static wrapper/layout on the server
 *    - Reduces JavaScript sent to client
 *
 * 2. Client interactivity is isolated to child components:
 *    - TicketsContainer: Manages cart state
 *    - TicketQuantitySelector: Individual +/- buttons
 *    - BuyTicketsButton: Purchase action
 *
 * 3. RSC Payload Impact:
 *    - The full Ticket[] array IS sent in RSC payload (needed for client rendering)
 *    - BUT: Static wrapper HTML is rendered on server (lighter than client-side)
 *    - Alternative: Could pass minimal data {id, name, price} and fetch details on demand
 *
 * 4. Why this pattern?
 *    - Server: Static content (section wrapper, heading)
 *    - Client: Interactive content (quantity selection, cart state)
 *    - Result: Balanced payload size vs. UX performance
 */
const Tickets = ({ tickets, eventId, variableFee }: TicketsProps) => {
  // Early return if no tickets - rendered on server
  if (!tickets || tickets.length === 0) {
    return null;
  }

  return (
    <section className="mt-6" id="tickets">
      <div className="container mx-auto max-w-4xl px-4">
        <div className="bg-background border border-border rounded-2xl p-6 sm:p-8">
          {/* Static heading - rendered on server */}
          <h2 className="text-xl sm:text-2xl font-bold mb-6">Tickets</h2>

          {/*
            Client island: All interactive logic contained here
            This is where the RSC boundary occurs - tickets data
            is serialized and sent to the client component
          */}
          <TicketsContainer
            tickets={tickets}
            eventId={eventId}
            variableFee={variableFee}
          />
        </div>
      </div>
    </section>
  );
};

export default Tickets;
