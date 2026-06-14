"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { createRaffle } from "@/lib/actions/raffles";
import { formatARS } from "@/lib/utils";
import { ArrowLeft, Plus } from "lucide-react";
import { LinkButton } from "@/components/shared/LinkButton";

export default function NuevaRifaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [numberCount, setNumberCount] = useState(200);
  const [price, setPrice] = useState("1000");
  const [totalPreview, setTotalPreview] = useState("0");

  function updatePreview(count: number, priceVal: string) {
    const p = parseFloat(priceVal) || 0;
    setTotalPreview(formatARS(count * p));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const result = await createRaffle(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }
      // Redirect happens server-side on success
    } catch {
      toast.error("Error al crear la rifa");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <LinkButton href="/admin" variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </LinkButton>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nueva Rifa
          </h1>
          <p className="text-muted-foreground">
            Completá los datos para crear una nueva rifa
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información de la Rifa</CardTitle>
            <CardDescription>
              Datos principales que verán los compradores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la rifa *</Label>
              <Input
                id="title"
                name="title"
                placeholder="Ej: Rifa pro-electrodomésticos"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Contale a los compradores de qué se trata..."
                rows={3}
              />
            </div>

            <Separator />

            <CardTitle className="text-lg">Premios</CardTitle>

            <div className="space-y-2">
              <Label htmlFor="prize1">Premio 1 (1er puesto) *</Label>
              <Input
                id="prize1"
                name="prize1"
                placeholder="Ej: Heladera Samsung 320L"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prize2">Premio 2 (2do puesto)</Label>
              <Input
                id="prize2"
                name="prize2"
                placeholder="Ej: TV LED 32"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="prize3">Premio 3 (3er puesto)</Label>
              <Input
                id="prize3"
                name="prize3"
                placeholder="Ej: Parlante Bluetooth"
              />
            </div>

            <Separator />

            <CardTitle className="text-lg">Configuración</CardTitle>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="numberCount">
                  Cantidad de números *
                </Label>
                <Input
                  id="numberCount"
                  name="numberCount"
                  type="number"
                  min={10}
                  max={10000}
                  value={numberCount}
                  onChange={(e) => {
                    const v = parseInt(e.target.value) || 0;
                    setNumberCount(v);
                    updatePreview(v, price);
                  }}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricePerNumber">
                  Valor por número ($) *
                </Label>
                <Input
                  id="pricePerNumber"
                  name="pricePerNumber"
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    updatePreview(numberCount, e.target.value);
                  }}
                  required
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span>Total posible recaudación:</span>
                <span className="font-bold text-lg">{totalPreview}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {numberCount} números x{" "}
                {price ? formatARS(price) : "$0"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="drawDate">
                Fecha del sorteo *
              </Label>
              <Input
                id="drawDate"
                name="drawDate"
                type="date"
                required
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 mt-6">
          <LinkButton href="/admin" variant="outline">Cancelar</LinkButton>
          <Button type="submit" disabled={loading}>
            <Plus className="h-4 w-4 mr-1" />
            {loading ? "Creando..." : "Crear Rifa"}
          </Button>
        </div>
      </form>
    </div>
  );
}
