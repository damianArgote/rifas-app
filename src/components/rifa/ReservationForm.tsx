"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { reserveTickets } from "@/lib/actions/tickets";

interface TicketData {
  id: string;
  number: number;
  status: string;
}

interface ReservationFormProps {
  raffleId: string;
  raffleTitle: string;
  selectedTickets: TicketData[];
  onSuccess: (data: {
    ticketIds: string[];
    numbers: number[];
    totalAmount: number;
    buyerName: string;
    buyerPhone: string;
  }) => void;
  onCancel: () => void;
}

export function ReservationForm({
  raffleId,
  raffleTitle,
  selectedTickets,
  onSuccess,
  onCancel,
}: ReservationFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalAmount =
    selectedTickets.length * 0; // will be set by server

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Ingresá tu nombre");
      return;
    }
    if (!phone.trim()) {
      setError("Ingresá tu teléfono");
      return;
    }

    setLoading(true);

    try {
      const result = await reserveTickets(
        raffleId,
        selectedTickets.map((t) => t.id),
        name.trim(),
        phone.trim(),
      );

      if (!result.success) {
        setError(result.error ?? "Error al reservar. Intentá de nuevo.");
        return;
      }

      onSuccess({
        ticketIds: result.data!.ticketIds,
        numbers: result.data!.numbers,
        totalAmount: result.data!.totalAmount,
        buyerName: result.data!.buyerName,
        buyerPhone: result.data!.buyerPhone,
      });
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-1">
          Vas a reservar{" "}
          <strong>{selectedTickets.length} número(s)</strong>
        </p>
        <p className="text-xs text-muted-foreground">
          Números:{" "}
          {selectedTickets
            .map((t) => String(t.number).padStart(3, "0"))
            .join(", ")}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre completo</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Juan Pérez"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ej: 541123456789"
          required
        />
        <p className="text-xs text-muted-foreground">
          Incluí código de país sin el + (ej: 5411...)
        </p>
      </div>

      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Reservando..." : "Reservar ahora"}
        </Button>
      </div>
    </form>
  );
}
