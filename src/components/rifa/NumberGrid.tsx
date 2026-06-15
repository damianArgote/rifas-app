"use client";

import { cn } from "@/lib/utils";
import { TICKET_STATUS } from "@/lib/constants";

interface TicketData {
  id: string;
  number: number;
  status: "available" | "reserved" | "paid";
}

interface NumberGridProps {
  tickets: TicketData[];
  selectedIds: string[];
  onToggle: (ticket: TicketData) => void;
  disabled?: boolean;
  interactive?: boolean;
}

export function NumberGrid({
  tickets,
  selectedIds,
  onToggle,
  disabled = false,
  interactive = true,
}: NumberGridProps) {
  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
      {tickets.map((ticket) => {
        const status = TICKET_STATUS[ticket.status];
        const isSelected = selectedIds.includes(ticket.id);
        const isAvailable = ticket.status === "available";

        return (
          <button
            key={ticket.id}
            type="button"
            disabled={disabled || (!isAvailable && interactive)}
            onClick={() => interactive && onToggle(ticket)}
            className={cn(
              "relative flex aspect-square items-center justify-center rounded-lg text-sm font-bold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              !isAvailable && !interactive && status.color,
              isAvailable && interactive && "bg-green-500 text-white hover:bg-green-600",
              isAvailable && !interactive && "bg-green-500 text-white",
              isSelected && "ring-2 ring-violet-400 ring-offset-2 ring-offset-background scale-110",
              !isAvailable && !isSelected && status.color,
              disabled && "opacity-70 cursor-not-allowed",
            )}
            title={`N° ${ticket.number} - ${status.label}`}
          >
            <span className="text-[10px] sm:text-xs md:text-sm">
              {String(ticket.number).padStart(3, "0")}
            </span>
            {isSelected && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-[10px] text-white shadow">
                {selectedIds.indexOf(ticket.id) + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
