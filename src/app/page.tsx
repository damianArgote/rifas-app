import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/shared/LinkButton";
import { getPublicRaffles } from "@/lib/actions/raffles";
import { formatARS, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const raffles = await getPublicRaffles();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">🎯 Rifas</h1>
          <LinkButton href="/admin" variant="outline">Admin</LinkButton>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <section className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            Encontrá tu número de la suerte
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Elegí tus números, reservalos y pagá por transferencia. Fácil,
            rápido y seguro.
          </p>
        </section>

        {/* Raffle Grid */}
        <section>
          {raffles.length === 0 ? (
            <div className="text-center py-20">
              <Ticket className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No hay rifas activas
              </h3>
              <p className="text-muted-foreground">
                Volvé pronto para ver las próximas rifas disponibles.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {raffles.map((raffle) => (
                  <Link key={raffle.id} href={`/rifa/${raffle.id}`}>
                    <Card className="h-full transition-shadow hover:shadow-lg hover:border-primary/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-xl">
                            {raffle.title}
                          </CardTitle>
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
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {raffle.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {raffle.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {raffle.stats.totalSold}/{raffle.numberCount}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Trophy className="h-4 w-4 text-amber-500" />
                            <span className="truncate">{raffle.prize1}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(raffle.drawDate).toLocaleDateString(
                                "es-AR",
                              )}
                            </span>
                          </div>
                          <div className="font-semibold text-right">
                            {formatARS(raffle.pricePerNumber)} c/u
                          </div>
                        </div>

                        {/* Progress bar */}
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{
                              width: `${raffle.stats.percentageSold}%`,
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Rifas App
        </div>
      </footer>
    </div>
  );
}
