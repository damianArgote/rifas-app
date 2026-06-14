"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateTicketStatus } from "@/lib/actions/tickets";
import { TICKET_STATUS } from "@/lib/constants";
import { cn, formatNumber } from "@/lib/utils";

interface AdminTicket {
  id: string;
  number: number;
  status: "available" | "reserved" | "paid";
  buyerName: string | null;
  buyerPhone: string | null;
}

interface AdminNumberGridProps {
  raffleId: string;
  tickets: AdminTicket[];
}

export function AdminNumberGrid({
  raffleId: _raffleId,
  tickets,
}: AdminNumberGridProps) {
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(
    null,
  );
  const [localTickets, setLocalTickets] = useState(tickets);

  async function handleStatusChange(
    ticketId: string,
    newStatus: "available" | "reserved" | "paid",
  ) {
    // Optimistic update
    setLocalTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId ? { ...t, status: newStatus } : t,
      ),
    );

    try {
      await updateTicketStatus(ticketId, newStatus);
      toast.success("Estado actualizado");
    } catch {
      // Revert on error
      setLocalTickets((prev) =>
        prev.map((t) =>
          t.id === ticketId
            ? { ...t, status: tickets.find((ot) => ot.id === ticketId)!.status }
            : t,
        ),
      );
      toast.error("Error al actualizar");
    }

    setSelectedTicket(null);
  }

  const paid = localTickets.filter((t) => t.status === "paid").length;
  const reserved = localTickets.filter(
    (t) => t.status === "reserved",
  ).length;

  return (
    <>
      {/* Quick summary */}
      <div className="flex gap-3 mb-4 text-sm">
        <span>
          Pagados: <strong>{paid}</strong>
        </span>
        <span>
          Reservados: <strong>{reserved}</strong>
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
        {localTickets.map((ticket) => {
          const statusConfig = TICKET_STATUS[ticket.status];
          return (
            <button
              key={ticket.id}
              type="button"
              onClick={() => setSelectedTicket(ticket)}
              className={cn(
                "relative flex aspect-square items-center justify-center rounded-lg text-sm font-bold transition-all",
                "hover:ring-2 hover:ring-primary hover:ring-offset-1",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                statusConfig.color,
                statusConfig.textColor,
              )}
              title={`N° ${formatNumber(ticket.number)} - ${statusConfig.label}${ticket.buyerName ? ` - ${ticket.buyerName}` : ""}`}
            >
              {formatNumber(ticket.number)}
            </button>
          );
        })}
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Número {selectedTicket && formatNumber(selectedTicket.number)}
            </DialogTitle>
            <DialogDescription>
              Gestioná el estado de este número
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estado actual:</span>
                  <Badge
                    variant={
                      selectedTicket.status === "paid"
                        ? "default"
                        : selectedTicket.status === "reserved"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {TICKET_STATUS[selectedTicket.status].label}
                  </Badge>
                </div>

                {selectedTicket.buyerName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Comprador:</span>
                    <span>{selectedTicket.buyerName}</span>
                  </div>
                )}

                {selectedTicket.buyerPhone && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Teléfono:
                    </span>
                    <span>{selectedTicket.buyerPhone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Cambiar estado a:
                </label>
                <div className="flex gap-2">
                  {(["available", "reserved", "paid"] as const).map(
                    (status) => (
                      <Button
                        key={status}
                        variant={
                          selectedTicket.status === status
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          handleStatusChange(selectedTicket.id, status)
                        }
                        disabled={selectedTicket.status === status}
                      >
                        {TICKET_STATUS[status].label}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
