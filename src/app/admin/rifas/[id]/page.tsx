import { notFound } from "next/navigation";
import { getRaffle } from "@/lib/actions/raffles";
import { LinkButton } from "@/components/shared/LinkButton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminNumberGrid } from "@/components/admin/AdminNumberGrid";
import { AdminRaffleActions } from "@/components/admin/AdminRaffleActions";
import {
  formatARS,
} from "@/lib/utils";
import { ArrowLeft, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RaffleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getRaffle(id);

  if (!data) notFound();

  const { tickets: raffleTickets, ...raffle } = data;

  const paid = raffleTickets.filter((t) => t.status === "paid").length;
  const reserved = raffleTickets.filter((t) => t.status === "reserved").length;
  const available = raffleTickets.filter(
    (t) => t.status === "available",
  ).length;
  const totalSold = paid + reserved;
  const totalRevenue = paid * parseFloat(raffle.pricePerNumber);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <LinkButton href="/admin" variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </LinkButton>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight">
              {raffle.title}
            </h1>
            <Badge
              variant={
                raffle.status === "active"
                  ? "default"
                  : raffle.status === "cancelled"
                    ? "destructive"
                    : "secondary"
              }
            >
              {raffle.status === "active"
                ? "Activa"
                : raffle.status === "cancelled"
                  ? "Cancelada"
                  : "Finalizada"}
            </Badge>
          </div>
          {raffle.description && (
            <p className="text-muted-foreground mt-1">
              {raffle.description}
            </p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Números
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{raffle.numberCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              💚 Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{available}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              🟡 Reservados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">{reserved}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              🔴 Pagados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-500">{paid}</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue */}
      <Card>
        <CardContent className="flex items-center justify-between py-4">
          <div>
            <p className="text-sm text-muted-foreground">Recaudación</p>
            <p className="text-3xl font-bold">{formatARS(totalRevenue)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Precio por número</p>
            <p className="text-xl font-semibold">
              {formatARS(raffle.pricePerNumber)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Prizes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Premios
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Badge variant="default">1°</Badge>
              <span>{raffle.prize1}</span>
            </li>
            {raffle.prize2 && (
              <li className="flex items-center gap-2">
                <Badge variant="secondary">2°</Badge>
                <span>{raffle.prize2}</span>
              </li>
            )}
            {raffle.prize3 && (
              <li className="flex items-center gap-2">
                <Badge variant="outline">3°</Badge>
                <span>{raffle.prize3}</span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Acciones</h2>
        <AdminRaffleActions raffleId={raffle.id} status={raffle.status} />
      </div>

      <Separator />

      {/* Number Grid (Admin) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Gestión de Números
          </h2>
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

        <AdminNumberGrid
          raffleId={raffle.id}
          tickets={raffleTickets.map((t) => ({
            id: t.id,
            number: t.number,
            status: t.status as "available" | "reserved" | "paid",
            buyerName: t.buyerName,
            buyerPhone: t.buyerPhone,
          }))}
        />
      </div>

      {/* Public Link */}
      <Separator />
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-sm font-medium">Link público de la rifa</p>
          <p className="text-sm text-muted-foreground">
            Compartí este link para que la gente reserve números
          </p>
        </div>
        <LinkButton href={`/rifa/${raffle.id}`} variant="outline" target="_blank">
          Abrir vista pública
        </LinkButton>
      </div>
    </div>
  );
}
