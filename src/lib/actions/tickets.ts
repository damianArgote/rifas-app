"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tickets, raffles } from "@/lib/db/schema";
import { eq, and, inArray, sql } from "drizzle-orm";
import { getSession } from "@/lib/auth";

// ─── Reserve Tickets (Public - with concurrency control) ────────────────────
export async function reserveTickets(
  raffleId: string,
  ticketIds: string[],
  buyerName: string,
  buyerPhone: string,
  _expirationMinutes = 30,
) {
  // Validate that all tickets are available using a single atomic update
  // Only updates tickets that are still "available" (prevents race conditions)
  const now = new Date();
  const expiresAt = new Date(now.getTime() + _expirationMinutes * 60 * 1000);

  const result = await db
    .update(tickets)
    .set({
      status: "reserved",
      buyerName,
      buyerPhone,
      reservedAt: now,
      expiresAt,
    })
    .where(
      and(
        eq(tickets.raffleId, raffleId),
        inArray(tickets.id, ticketIds),
        eq(tickets.status, "available"),
      ),
    )
    .returning();

  // Check if all requested tickets were actually updated
  const updatedCount = result.length;
  const expectedCount = ticketIds.length;

  if (updatedCount < expectedCount) {
    // Some tickets were already taken - rollback the partial update
    if (updatedCount > 0) {
      const updatedIds = result.map((t) => t.id);
      await db
        .update(tickets)
        .set({
          status: "available",
          buyerName: null,
          buyerPhone: null,
          reservedAt: null,
          expiresAt: null,
        })
        .where(inArray(tickets.id, updatedIds));
    }

    return {
      success: false,
      error: `Algunos números ya fueron reservados por otra persona. Intentá de nuevo.`,
      conflict: true,
    };
  }

  revalidatePath(`/rifa/${raffleId}`);

  // Get the raffle details for the WhatsApp message
  const raffle = await db.query.raffles.findFirst({
    where: (r, { eq }) => eq(r.id, raffleId),
  });

  const reservedNumbers = result.map((t) => t.number).sort((a, b) => a - b);
  const totalAmount =
    result.length * parseFloat(raffle?.pricePerNumber ?? "0");

  return {
    success: true,
    data: {
      ticketIds: result.map((t) => t.id),
      numbers: reservedNumbers,
      totalAmount,
      raffleTitle: raffle?.title ?? "",
      buyerName,
      buyerPhone,
    },
  };
}

// ─── Release Expired Reservations (Admin or Cron) ───────────────────────────
export async function releaseExpiredReservations() {
  const now = new Date();
  await db
    .update(tickets)
    .set({
      status: "available",
      buyerName: null,
      buyerPhone: null,
      reservedAt: null,
      expiresAt: null,
    })
    .where(
      and(
        eq(tickets.status, "reserved"),
        sql`${tickets.expiresAt} < ${now}`,
      ),
    );
}

// ─── Admin: Update Ticket Status ────────────────────────────────────────────
export async function updateTicketStatus(
  ticketId: string,
  newStatus: "available" | "reserved" | "paid",
) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  const updateData: Record<string, unknown> = { status: newStatus };

  if (newStatus === "paid") {
    updateData.purchasedAt = new Date();
  }
  if (newStatus === "available") {
    updateData.buyerName = null;
    updateData.buyerPhone = null;
    updateData.purchasedAt = null;
    updateData.reservedAt = null;
    updateData.expiresAt = null;
    updateData.paymentProofUrl = null;
  }

  const [ticket] = await db
    .update(tickets)
    .set(updateData)
    .where(eq(tickets.id, ticketId))
    .returning();

  revalidatePath("/admin");
  revalidatePath(`/rifa/${ticket.raffleId}`);

  return ticket;
}

// ─── Admin: Batch Update Ticket Status ──────────────────────────────────────
export async function batchUpdateTickets(
  ticketIds: string[],
  newStatus: "available" | "reserved" | "paid",
) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  const updateData: Record<string, unknown> = { status: newStatus };

  if (newStatus === "paid") {
    updateData.purchasedAt = new Date();
  }
  if (newStatus === "available") {
    updateData.buyerName = null;
    updateData.buyerPhone = null;
    updateData.purchasedAt = null;
    updateData.reservedAt = null;
    updateData.expiresAt = null;
    updateData.paymentProofUrl = null;
  }

  const result = await db
    .update(tickets)
    .set(updateData)
    .where(inArray(tickets.id, ticketIds))
    .returning();

  if (result.length > 0) {
    revalidatePath("/admin");
    revalidatePath(`/rifa/${result[0].raffleId}`);
  }

  return { updated: result.length };
}
