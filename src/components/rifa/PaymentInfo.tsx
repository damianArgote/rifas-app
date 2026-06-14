"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatARS } from "@/lib/utils";
import { Copy, ExternalLink, Check } from "lucide-react";
import { useState } from "react";

interface PaymentInfoProps {
  numbers: number[];
  totalAmount: number;
  raffleTitle: string;
  buyerName: string;
  buyerPhone: string;
  alias: string;
  cbu: string;
  titular: string;
  adminWhatsapp: string;
  onBack: () => void;
}

export function PaymentInfo({
  numbers,
  totalAmount,
  raffleTitle,
  buyerName,
  buyerPhone,
  alias,
  cbu,
  titular,
  adminWhatsapp,
  onBack,
}: PaymentInfoProps) {
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedCbu, setCopiedCbu] = useState(false);

  const numberList = numbers
    .sort((a, b) => a - b)
    .map((n) => String(n).padStart(3, "0"))
    .join(", ");

  const waMessage = encodeURIComponent(
    `¡Hola! Acabo de reservar los números ${numberList} para la rifa '${raffleTitle}'. El total es ${formatARS(totalAmount)}. Te adjunto el comprobante de la transferencia de Mercado Pago a nombre de ${buyerName}.`,
  );

  const waUrl = `https://wa.me/${adminWhatsapp}?text=${waMessage}`;

  async function copyToClipboard(text: string, type: "alias" | "cbu") {
    try {
      await navigator.clipboard.writeText(text);
      if (type === "alias") {
        setCopiedAlias(true);
        setTimeout(() => setCopiedAlias(false), 2000);
      } else {
        setCopiedCbu(true);
        setTimeout(() => setCopiedCbu(false), 2000);
      }
    } catch {
      // fallback: select text
    }
  }

  return (
    <Card className="mx-auto max-w-lg">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">¡Reserva confirmada!</CardTitle>
        <p className="text-muted-foreground">
          Tus números están reservados por 30 minutos
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="rounded-lg bg-muted p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rifa:</span>
            <span className="font-medium">{raffleTitle}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Números:</span>
            <span className="font-medium">{numberList}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total a pagar:</span>
            <span className="text-xl font-bold text-primary">
              {formatARS(totalAmount)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Mercado Pago Data */}
        <div className="space-y-3">
          <h3 className="font-semibold text-center">
            Datos de Mercado Pago
          </h3>
          <p className="text-sm text-muted-foreground text-center">
            Transferí el monto exacto a esta cuenta:
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-xs text-muted-foreground">Alias</p>
                <p className="font-mono font-medium">{alias}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(alias, "alias")}
              >
                {copiedAlias ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-xs text-muted-foreground">CBU</p>
                <p className="font-mono text-sm font-medium break-all">
                  {cbu}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(cbu, "cbu")}
              >
                {copiedCbu ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-xs text-muted-foreground">Titular</p>
              <p className="font-medium">{titular}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* WhatsApp Button */}
        <div className="space-y-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 w-full rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 h-9 px-2.5 text-sm font-medium whitespace-nowrap transition-all"
          >
            <ExternalLink className="h-4 w-4" />
            Enviar comprobante por WhatsApp
          </a>
          <p className="text-xs text-muted-foreground text-center">
            Te abrimos WhatsApp con el mensaje listo. Solo adjuntá el
            comprobante y enviá.
          </p>
        </div>

        <Button variant="outline" className="w-full" onClick={onBack}>
          Volver a la rifa
        </Button>
      </CardContent>
    </Card>
  );
}
