"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cancelRaffle, reactivateRaffle } from "@/lib/actions/raffles";
import { useRouter } from "next/navigation";

interface AdminRaffleActionsProps {
  raffleId: string;
  status: string;
}

export function AdminRaffleActions({ raffleId, status }: AdminRaffleActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("¿Cancelar esta rifa? Los números reservados quedarán disponibles.")) return;
    setLoading(true);
    try {
      const result = await cancelRaffle(raffleId);
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    } catch {
      toast.error("Error al cancelar la rifa");
    } finally {
      setLoading(false);
    }
  }

  async function handleReactivate() {
    if (!confirm("¿Reactivar esta rifa?")) return;
    setLoading(true);
    try {
      await reactivateRaffle(raffleId);
      router.refresh();
    } catch {
      toast.error("Error al reactivar la rifa");
    } finally {
      setLoading(false);
    }
  }

  if (status === "finished") return null;

  return (
    <div className="flex gap-2">
      {status === "active" && (
        <Button variant="destructive" onClick={handleCancel} disabled={loading}>
          {loading ? "Procesando..." : "Cancelar rifa"}
        </Button>
      )}
      {status === "cancelled" && (
        <Button variant="default" onClick={handleReactivate} disabled={loading}>
          {loading ? "Procesando..." : "Reactivar rifa"}
        </Button>
      )}
    </div>
  );
}
