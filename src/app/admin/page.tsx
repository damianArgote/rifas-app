import { getRaffles } from "@/lib/actions/raffles";
import { formatARS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/shared/LinkButton";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, TrendingUp, DollarSign, Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const raffles = await getRaffles();

  const totalRevenue = raffles.reduce(
    (sum, r) => sum + r.stats.totalRevenue,
    0,
  );
  const totalTicketsSold = raffles.reduce(
    (sum, r) => sum + r.stats.totalSold,
    0,
  );
  const totalTickets = raffles.reduce((sum, r) => sum + r.numberCount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Gestioná tus rifas desde acá
          </p>
        </div>
        <LinkButton href="/admin/rifas/nueva" className="inline-flex items-center">
          <Plus className="h-4 w-4 mr-1" />
          Nueva Rifa
        </LinkButton>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Números Vendidos
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTicketsSold} / {totalTickets}
            </div>
            <p className="text-xs text-muted-foreground">
              en {raffles.length} rifa(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Recaudación Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatARS(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              suma de todas las rifas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Promedio Ventas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {raffles.length > 0
                ? `${Math.round((totalTicketsSold / totalTickets) * 100)}%`
                : "—"}
            </div>
            <p className="text-xs text-muted-foreground">
              del total de números
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Raffles Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rifas</CardTitle>
        </CardHeader>
        <CardContent>
          {raffles.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground mb-4">
                No creaste ninguna rifa todavía
              </p>
              <LinkButton href="/admin/rifas/nueva" className="inline-flex items-center">
                <Plus className="h-4 w-4 mr-1" />
                Crear primera rifa
              </LinkButton>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rifa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Vendidos</TableHead>
                  <TableHead>Recaudado</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {raffles.map((raffle) => (
                  <TableRow key={raffle.id}>
                    <TableCell className="font-medium">
                      {raffle.title}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          raffle.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {raffle.status === "active"
                          ? "Activa"
                          : "Finalizada"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {raffle.stats.totalSold}/{raffle.numberCount} (
                      {raffle.stats.percentageSold}%)
                    </TableCell>
                    <TableCell>
                      {formatARS(raffle.stats.totalRevenue)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(raffle.drawDate).toLocaleDateString("es-AR")}
                    </TableCell>
                    <TableCell>
                      <LinkButton
                        href={`/admin/rifas/${raffle.id}`}
                        variant="outline"
                        size="sm"
                      >
                        Ver números
                      </LinkButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
