export const TICKET_STATUS = {
  available: {
    label: "Disponible",
    color: "bg-green-500 hover:bg-green-600",
    textColor: "text-white",
  },
  reserved: {
    label: "Reservado",
    color: "bg-amber-400 hover:bg-amber-500",
    textColor: "text-white",
  },
  paid: {
    label: "Pagado",
    color: "bg-red-500 hover:bg-red-600",
    textColor: "text-white",
  },
} as const;
