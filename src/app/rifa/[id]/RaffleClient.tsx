"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { NumberGrid } from "@/components/rifa/NumberGrid";
import { CountdownTimer } from "@/components/rifa/CountdownTimer";
import { ReservationForm } from "@/components/rifa/ReservationForm";
import { PaymentInfo } from "@/components/rifa/PaymentInfo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatARS } from "@/lib/utils";
import { Trophy, Ticket, Calendar, Info, CheckCircle, XCircle, Clock } from "lucide-react";

interface TicketData {
  id: string;
  number: number;
  status: "available" | "reserved" | "paid";
}

interface RaffleData {
  id: string;
  title: string;
  description: string | null;
  numberCount: number;
  pricePerNumber: string;
  prize1: string;
  prize2: string | null;
  prize3: string | null;
  drawDate: Date;
  status: string;
  tickets: TicketData[];
}

interface SettingsData {
  mp_alias: string;
  mp_cbu: string;
  mp_titular: string;
  admin_whatsapp: string;
}

interface RaffleClientProps {
  raffle: RaffleData;
  settings: SettingsData;
}

type ViewState = "grid" | "form" | "payment";

function MpStatusBanner() {
  const searchParams = useSearchParams();
  const mpStatus = searchParams.get("mp");

  if (!mpStatus) return null;

  const banners: Record<string, { icon: React.ReactNode; text: string; variant: "success" | "error" | "warning" }> = {
    success: {
      icon: <CheckCircle className="h-5 w-5" />,
      text: "¡Pago confirmado! Tus números ya están reservados.",
      variant: "success",
    },
    failure: {
      icon: <XCircle className="h-5 w-5" />,
      text: "El pago no se completó. Podés intentar de nuevo o usar transferencia bancaria.",
      variant: "error",
    },
    pending: {
      icon: <Clock className="h-5 w-5" />,
      text: "El pago está pendiente. Te avisaremos cuando se confirme.",
      variant: "warning",
    },
  };

  const banner = banners[mpStatus];
  if (!banner) return null;

  const styles: Record<string, string> = {
    success: "bg-green-50 dark:bg-green-950 border-green-200 text-green-700 dark:text-green-300",
    error: "bg-red-50 dark:bg-red-950 border-red-200 text-red-700 dark:text-red-300",
    warning: "bg-amber-50 dark:bg-amber-950 border-amber-200 text-amber-700 dark:text-amber-300",
  };

  return (
    <div className={`rounded-lg border p-4 flex items-center gap-3 ${styles[banner.variant]}`}>
      {banner.icon}
      <p className="text-sm font-medium">{banner.text}</p>
    </div>
  );
}

export function RaffleClient({ raffle, settings }: RaffleClientProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [view, setView] = useState<ViewState>("grid");
  const [reservationData, setReservationData] = useState<{
    ticketIds: string[];
    numbers: number[];
    totalAmount: number;
    buyerName: string;
    buyerPhone: string;
  } | null>(null);

  const selectedTickets = useMemo(
    () =>
      (raffle.tickets as TicketData[]).filter(
        (t) => selectedIds.includes(t.id) && t.status === "available",
      ),
    [raffle.tickets, selectedIds],
  );

  function handleToggle(ticket: TicketData) {
    if (ticket.status !== "available") return;

    setSelectedIds((prev) =>
      prev.includes(ticket.id)
        ? prev.filter((id) => id !== ticket.id)
        : [...prev, ticket.id],
    );
  }

  function handleReserveSuccess(data: {
    ticketIds: string[];
    numbers: number[];
    totalAmount: number;
    buyerName: string;
    buyerPhone: string;
  }) {
    setReservationData(data);
    setView("payment");
  }

  function handleBackToGrid() {
    setSelectedIds([]);
    setReservationData(null);
    setView("grid");
  }

  const pricePerNumber = parseFloat(raffle.pricePerNumber);
  const isExpired = new Date(raffle.drawDate) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Nav */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight">
            🎯 Rifas
          </Link>
          <Badge variant="outline" className="text-xs">
            {formatARS(pricePerNumber)} c/u
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* MP return banners */}
        <MpStatusBanner />

        {view === "payment" && reservationData ? (
          <div className="mt-4">
            <PaymentInfo
              raffleId={raffle.id}
              raffleTitle={raffle.title}
              ticketIds={reservationData.ticketIds}
              numbers={reservationData.numbers}
              totalAmount={reservationData.totalAmount}
              buyerName={reservationData.buyerName}
              buyerPhone={reservationData.buyerPhone}
              alias={settings.mp_alias}
              cbu={settings.mp_cbu}
              titular={settings.mp_titular}
              adminWhatsapp={settings.admin_whatsapp}
              onBack={handleBackToGrid}
            />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Raffle Info */}
            <section>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                {raffle.title}
              </h1>
              {raffle.description && (
                <p className="text-muted-foreground mb-4">
                  {raffle.description}
                </p>
              )}

              {isExpired || raffle.status === "finished" ? (
                <div className="rounded-lg bg-red-50 dark:bg-red-950 p-4 text-center">
                  <p className="text-lg font-bold text-red-600 dark:text-red-400">
                    🎉 Sorteo finalizado
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <CountdownTimer targetDate={new Date(raffle.drawDate)} />
                </div>
              )}
            </section>

            <Separator />

            {/* Prizes */}
            <section>
              <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-amber-500" />
                Premios
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border bg-card p-4 text-center">
                  <Badge className="mb-2">1°</Badge>
                  <p className="font-medium">{raffle.prize1}</p>
                </div>
                {raffle.prize2 && (
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <Badge variant="secondary" className="mb-2">
                      2°
                    </Badge>
                    <p className="font-medium">{raffle.prize2}</p>
                  </div>
                )}
                {raffle.prize3 && (
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <Badge variant="outline" className="mb-2">
                      3°
                    </Badge>
                    <p className="font-medium">{raffle.prize3}</p>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Stats Bar */}
            <section className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-1.5">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                <span>
                  {raffle.tickets.filter((t) => t.status === "paid" || t.status === "reserved").length}/{raffle.numberCount} vendidos
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Sorteo:{" "}
                  {new Date(raffle.drawDate).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span>Valor: {formatARS(pricePerNumber)}</span>
              </div>
            </section>

            <Separator />

            {/* Number Grid & Selection */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Elegí tus números</h2>
                <div className="flex gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded bg-green-500" />{" "}
                    Disponible
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded bg-amber-400" />{" "}
                    Reservado
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-3 w-3 rounded bg-red-500" />{" "}
                    Pagado
                  </span>
                </div>
              </div>

              <NumberGrid
                tickets={raffle.tickets as TicketData[]}
                selectedIds={selectedIds}
                onToggle={handleToggle}
                interactive={!isExpired && raffle.status !== "finished"}
                disabled={isExpired || raffle.status === "finished"}
              />
            </section>

            {/* Selection Summary & Reservation */}
            {selectedTickets.length > 0 && view === "grid" && (
              <section>
                <Separator className="mb-6" />
                <div className="rounded-lg border bg-card p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">
                        {selectedTickets.length} número(s) seleccionado(s)
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Total: {formatARS(selectedTickets.length * pricePerNumber)}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIds([])}
                    >
                      Limpiar
                    </Button>
                  </div>

                  <ReservationForm
                    raffleId={raffle.id}
                    raffleTitle={raffle.title}
                    selectedTickets={selectedTickets}
                    onSuccess={handleReserveSuccess}
                    onCancel={() => setSelectedIds([])}
                  />
                </div>
              </section>
            )}

            {/* Info text when no selection */}
            {selectedTickets.length === 0 && view === "grid" && (
              <section className="text-center py-8">
                <Ticket className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">
                  Hacé clic en los números disponibles para seleccionarlos
                </p>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Rifas App
        </div>
      </footer>
    </div>
  );
}
