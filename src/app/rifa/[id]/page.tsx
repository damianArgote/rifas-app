import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPublicRaffle } from "@/lib/actions/raffles";
import { getSettings } from "@/lib/actions/settings";
import { RaffleClient } from "./RaffleClient";

export const dynamic = "force-dynamic";

export default async function PublicRafflePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [result, settings] = await Promise.all([
    getPublicRaffle(id),
    getSettings(),
  ]);

  if (!result) notFound();

  // Convert server data types to client-compatible types
  const raffle = {
    ...result,
    tickets: result.tickets.map((t) => ({
      ...t,
      status: t.status as "available" | "reserved" | "paid",
    })),
  };

  return (
    <Suspense fallback={<div className="p-8 text-center">Cargando...</div>}>
      <RaffleClient raffle={raffle} settings={settings} />
    </Suspense>
  );
}
