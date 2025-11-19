import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth/mock-auth";
import { createTransaction, getTicketById } from "@/lib/db/mock-db";
import crypto from "crypto";

interface CreateTransactionBody {
  eventId: string;
  ticketSelections: Record<string, number>;
  variableFee: number;
  sellerUid?: string;
}

interface BoldCheckoutData {
  orderId: string;
  amount: number;
  currency: string;
  description: string;
  integrityHash: string;
  customerData: {
    email: string;
    fullName: string;
    phone: string;
    dialCode: string;
    documentNumber: string;
    documentType: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    // 1. Verify user is authenticated (mock - always authenticated)
    const {
      data: { user },
    } = await getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Usuario no autenticado" },
        { status: 401 }
      );
    }

    // 2. Parse request body
    const body: CreateTransactionBody = await request.json();
    const { eventId, ticketSelections, variableFee, sellerUid } = body;

    // 3. Fetch tickets from mock database to get prices
    const ticketIds = Object.keys(ticketSelections);
    const tickets = [];

    for (const ticketId of ticketIds) {
      const { data: ticket } = await getTicketById(ticketId);
      if (ticket && ticket.event_id === eventId) {
        tickets.push(ticket);
      }
    }

    if (tickets.length === 0) {
      return NextResponse.json(
        { error: "Tickets no encontrados" },
        { status: 404 }
      );
    }

    // 4. Calculate totals server-side
    let subtotal = 0;
    let totalServiceFee = 0;
    let totalIva = 0;

    for (const ticket of tickets) {
      const quantity = ticketSelections[ticket.id] || 0;
      if (quantity <= 0) continue;

      const ticketSubtotal = ticket.price * quantity;
      const ticketServiceFee = ticket.price * variableFee * quantity;
      const ticketIva = ticketServiceFee * 0.19;

      subtotal += ticketSubtotal;
      totalServiceFee += ticketServiceFee;
      totalIva += ticketIva;
    }

    if (subtotal === 0) {
      return NextResponse.json(
        { error: "No hay tickets seleccionados" },
        { status: 400 }
      );
    }

    const finalTotal = Math.ceil(subtotal + totalServiceFee + totalIva);

    // 5. Generate secure order ID
    const orderId = `ORDER-${user.id}-${Date.now()}`;

    // 6. Create transactions for each ticket (MOCK VERSION)
    for (const ticket of tickets) {
      const quantity = ticketSelections[ticket.id] || 0;
      if (quantity <= 0) continue;

      // Calculate per-unit variable fee and tax (not multiplied by quantity)
      const perUnitVariableFee = ticket.price * variableFee;
      const perUnitTax = perUnitVariableFee * 0.19;

      // Create mock transaction
      await createTransaction({
        order: orderId,
        user_id: user.id,
        ticket_id: ticket.id,
        price: ticket.price,
        variable_fee: perUnitVariableFee,
        tax: perUnitTax,
        quantity: quantity,
        total: finalTotal,
        status: "pending",
      });
    }

    // 7. Generate Bold checkout data with integrity hash
    const currency = "COP";
    const secretKey = process.env.BOLD_SECRET_KEY;

    if (!secretKey) {
      console.error("BOLD_SECRET_KEY is not configured");
      return NextResponse.json(
        { error: "Configuración de pago no disponible" },
        { status: 500 }
      );
    }

    // Generate integrity hash for Bold
    // Must concatenate: OrderId + Amount + Currency + SecretKey
    const message = `${orderId}${finalTotal}${currency}${secretKey}`;
    const integrityHash = crypto
      .createHash("sha256")  // Use SHA256, not HMAC
      .update(message)
      .digest("hex");

    // Get first ticket name for description
    const firstTicket = tickets[0];
    const description =
      tickets.length > 1
        ? `Compra de ${tickets.length} tipos de tickets`
        : `Compra de ${firstTicket.name}`;

    // Prepare customer data
    const customerData = {
      email: user.email || "",
      fullName:
        `${user.user_metadata?.name || ""} ${
          user.user_metadata?.lastName || ""
        }`.trim() ||
        user.email ||
        "Usuario",
      phone: user.user_metadata?.phone || "",
      dialCode: "+57",
      documentNumber: user.user_metadata?.document_id || "",
      documentType: user.user_metadata?.document_type_id || "CC",
    };

    const boldCheckoutData: BoldCheckoutData = {
      orderId,
      amount: finalTotal,
      currency,
      description,
      integrityHash,
      customerData,
    };
    // console.log(boldCheckoutData)

    return NextResponse.json({
      success: true,
      orderId,
      total: finalTotal,
      boldCheckoutData,
    });
  } catch (error) {
    console.error("Transaction Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Error interno del servidor",
      },
      { status: 500 }
    );
  }
}
