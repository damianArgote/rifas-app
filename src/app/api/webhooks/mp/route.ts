import { NextRequest, NextResponse } from "next/server";
import { getPaymentClient, isMpConfigured } from "@/lib/mp";
import { db } from "@/lib/db";
import { tickets } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Mercado Pago webhook: receives payment notifications
export async function POST(request: NextRequest) {
  try {
    if (!isMpConfigured()) {
      return NextResponse.json(
        { error: "MP not configured" },
        { status: 500 },
      );
    }

    const body = await request.json();
    const { type, data, action } = body;

    console.log("MP webhook received:", { type, action, data });

    // Only process payment events
    if (type !== "payment" && action !== "payment.created") {
      return NextResponse.json({ received: true });
    }

    const paymentId = data?.id;
    if (!paymentId) {
      return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
    }

    // Fetch payment details from MP API
    const payment = await getPaymentClient().get({ id: String(paymentId) });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Only process approved payments
    if (payment.status !== "approved") {
      console.log(`Payment ${paymentId} status: ${payment.status} — skipping`);
      return NextResponse.json({ received: true });
    }

    const externalRef = payment.external_reference;
    if (!externalRef || typeof externalRef !== "string") {
      console.error(`Payment ${paymentId} has no external_reference`);
      return NextResponse.json({ error: "Missing external_reference" }, { status: 400 });
    }

    // Format: `${raffleId}:${ticketId1},${ticketId2},...`
    const colonIndex = externalRef.indexOf(":");
    if (colonIndex === -1) {
      console.error(`Invalid external_reference format: ${externalRef}`);
      return NextResponse.json({ error: "Invalid reference" }, { status: 400 });
    }

    const raffleId = externalRef.slice(0, colonIndex);
    const ticketIds = externalRef.slice(colonIndex + 1).split(",").filter(Boolean);

    if (ticketIds.length === 0) {
      return NextResponse.json({ error: "No tickets in reference" }, { status: 400 });
    }

    // Mark all tickets as paid
    const result = await db
      .update(tickets)
      .set({
        status: "paid",
        purchasedAt: new Date(),
      })
      .where(
        inArray(tickets.id, ticketIds),
      )
      .returning();

    console.log(
      `Marked ${result.length} tickets as paid (payment ${paymentId})`,
    );

    // Revalidate
    revalidatePath(`/rifa/${raffleId}`);
    revalidatePath("/admin");
    revalidatePath(`/admin/rifas/${raffleId}`);

    return NextResponse.json({ received: true, updated: result.length });
  } catch (err) {
    console.error("MP webhook error:", err);
    // Always return 200 to MP so they don't resend endlessly
    return NextResponse.json({ received: true });
  }
}
