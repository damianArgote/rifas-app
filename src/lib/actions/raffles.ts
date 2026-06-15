"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { raffles, tickets, type NewRaffle } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// ─── Create Raffle ─────────────────────────────────────────────────────────
export async function createRaffle(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const numberCount = parseInt(formData.get("numberCount") as string);
  const pricePerNumber = formData.get("pricePerNumber") as string;
  const prize1 = formData.get("prize1") as string;
  const prize2 = formData.get("prize2") as string | null;
  const prize3 = formData.get("prize3") as string | null;
  const drawDate = formData.get("drawDate") as string;
  const prize1Image = formData.get("prize1Image") as string | null;
  const prize2Image = formData.get("prize2Image") as string | null;
  const prize3Image = formData.get("prize3Image") as string | null;

  if (!title || !numberCount || !pricePerNumber || !prize1 || !drawDate) {
    return { error: "Completá todos los campos obligatorios" };
  }

  const newRaffle: NewRaffle = {
    title,
    description: description || null,
    numberCount,
    pricePerNumber,
    prize1,
    prize2: prize2 || null,
    prize3: prize3 || null,
    prize1Image: prize1Image || null,
    prize2Image: prize2Image || null,
    prize3Image: prize3Image || null,
    drawDate: new Date(drawDate),
    status: "active",
  };

  const [raffle] = await db.insert(raffles).values(newRaffle).returning();

  // Generate tickets (001 to numberCount)
  const ticketValues = Array.from({ length: numberCount }, (_, i) => ({
    raffleId: raffle.id,
    number: i + 1,
    status: "available" as const,
  }));

  // Batch insert in chunks of 100 to avoid payload size issues
  const chunkSize = 100;
  for (let i = 0; i < ticketValues.length; i += chunkSize) {
    const chunk = ticketValues.slice(i, i + chunkSize);
    await db.insert(tickets).values(chunk);
  }

  revalidatePath("/admin");
  redirect("/admin/rifas/" + raffle.id);
}

// ─── List Raffles (Admin) ───────────────────────────────────────────────────
export async function getRaffles() {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  const allRaffles = await db.query.raffles.findMany({
    orderBy: (raffles, { desc }) => [desc(raffles.createdAt)],
  });

  return getRafflesWithStats(allRaffles);
}

// ─── List Public Raffles (no auth required) ─────────────────────────────────
export async function getPublicRaffles() {
  const allRaffles = await db.query.raffles.findMany({
    where: (raffles, { eq }) => eq(raffles.status, "active"),
    orderBy: (raffles, { desc }) => [desc(raffles.createdAt)],
  });

  return getRafflesWithStats(allRaffles);
}

// ─── Helper: Add stats to raffles ───────────────────────────────────────────
async function getRafflesWithStats(
  raffleList: Awaited<ReturnType<typeof db.query.raffles.findMany>>,
) {
  return Promise.all(
    raffleList.map(async (raffle) => {
      const allTickets = await db.query.tickets.findMany({
        where: (tickets, { eq }) => eq(tickets.raffleId, raffle.id),
      });

      const totalSold = allTickets.filter(
        (t) => t.status === "paid" || t.status === "reserved",
      ).length;
      const paid = allTickets.filter((t) => t.status === "paid").length;
      const reserved = allTickets.filter((t) => t.status === "reserved").length;
      const totalRevenue = paid * parseFloat(raffle.pricePerNumber);

      return {
        ...raffle,
        stats: {
          totalSold,
          paid,
          reserved,
          totalRevenue,
          percentageSold: Math.round(
            (totalSold / raffle.numberCount) * 100,
          ),
        },
      };
    }),
  );
}

// ─── Get Single Raffle ──────────────────────────────────────────────────────
export async function getRaffle(id: string) {
  const raffle = await db.query.raffles.findFirst({
    where: (raffles, { eq }) => eq(raffles.id, id),
  });

  if (!raffle) return null;

  const raffleTickets = await db.query.tickets.findMany({
    where: (tickets, { eq }) => eq(tickets.raffleId, id),
    orderBy: (tickets, { asc }) => [asc(tickets.number)],
  });

  return { ...raffle, tickets: raffleTickets };
}

// ─── Get Public Raffle (no auth required) ───────────────────────────────────
export async function getPublicRaffle(id: string) {
  const data = await getRaffle(id);
  if (!data) return null;

  return {
    ...data,
    tickets: data.tickets.map((t) => ({
      id: t.id,
      number: t.number,
      status: t.status,
    })),
  };
}

// ─── Finish Raffle ──────────────────────────────────────────────────────────
export async function finishRaffle(id: string) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  await db
    .update(raffles)
    .set({ status: "finished", updatedAt: new Date() })
    .where(eq(raffles.id, id));

  revalidatePath("/admin");
  revalidatePath(`/rifa/${id}`);
}

// ─── Cancel Raffle ──────────────────────────────────────────────────────────
export async function cancelRaffle(id: string) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };

  // Check if there are paid tickets
  const paidTickets = await db.query.tickets.findMany({
    where: and(
      eq(tickets.raffleId, id),
      eq(tickets.status, "paid"),
    ),
  });

  if (paidTickets.length > 0) {
    return { error: "No se puede cancelar: hay números pagados" };
  }

  // Release all reserved tickets
  await db
    .update(tickets)
    .set({
      status: "available",
      buyerName: null,
      buyerPhone: null,
      reservedAt: null,
      expiresAt: null,
      paymentProofUrl: null,
    })
    .where(
      and(
        eq(tickets.raffleId, id),
        eq(tickets.status, "reserved"),
      ),
    );

  // Update raffle status
  await db
    .update(raffles)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(raffles.id, id));

  revalidatePath("/admin");
  revalidatePath(`/rifa/${id}`);

  return { success: true };
}

// ─── Reactivate Raffle ──────────────────────────────────────────────────────
export async function reactivateRaffle(id: string) {
  const session = await getSession();
  if (!session) return { error: "No autorizado" };

  await db
    .update(raffles)
    .set({ status: "active", updatedAt: new Date() })
    .where(eq(raffles.id, id));

  revalidatePath("/admin");
  revalidatePath(`/rifa/${id}`);

  return { success: true };
}

// ─── Delete Raffle ──────────────────────────────────────────────────────────
export async function deleteRaffle(id: string) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  await db.delete(raffles).where(eq(raffles.id, id));
  revalidatePath("/admin");
  redirect("/admin");
}
