"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatARS } from "@/lib/utils";
import { createPaymentPreference } from "@/lib/actions/payments";
import { Copy, ExternalLink, Check, Smartphone } from "lucide-react";

interface PaymentInfoProps {
  raffleId: string;
  raffleTitle: string;
  ticketIds: string[];
  numbers: number[];
  totalAmount: number;
  buyerName: string;
  buyerPhone: string;
  alias: string;
  cbu: string;
  titular: string;
  adminWhatsapp: string;
  onBack: () => void;
}

export function PaymentInfo({
  raffleId,
  raffleTitle,
  ticketIds,
  numbers,
  totalAmount,
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
  const [mpLoading, setMpLoading] = useState(false);
  const [mpError, setMpError] = useState("");
  const [payMethod, setPayMethod] = useState<"mp" | "transfer" | null>(null);

  const numberList = numbers
    .sort((a, b) => a - b)
    .map((n) => String(n).padStart(3, "0"))
    .join(", ");

  const waMessage = encodeURIComponent(
    `¡Hola! Acabo de reservar los números ${numberList} para la rifa '${raffleTitle}'. El total es ${formatARS(totalAmount)}. Te adjunto el comprobante de la transferencia a nombre de ${buyerName}.`,
  );

  const waUrl = `https://wa.me/${adminWhatsapp}?text=${waMessage}`;

  async function handleMpPayment() {
    setMpLoading(true);
    setMpError("");

    try {
      const result = await createPaymentPreference({
        raffleId,
        raffleTitle,
        ticketIds,
        numbers,
        totalAmount,
        buyerName,
        buyerPhone,
      });

      if (result.error) {
        setMpError(result.error);
        return;
      }

      if (result.initPoint) {
        window.location.href = result.initPoint;
      }
    } catch {
      setMpError("Error de conexión. Usá transferencia manual.");
    } finally {
      setMpLoading(false);
    }
  }

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
      // fallback
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

        {/* Payment method selection */}
        {!payMethod && (
          <div className="space-y-3">
            <h3 className="font-semibold text-center">Elegí cómo pagar</h3>

            <Button
              className="w-full gap-2 h-12 text-base"
              onClick={() => setPayMethod("mp")}
            >
              <Smartphone className="h-5 w-5" />
              Pagar con Mercado Pago
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2 h-12 text-base"
              onClick={() => setPayMethod("transfer")}
            >
              <Copy className="h-5 w-5" />
              Transferencia bancaria
            </Button>
          </div>
        )}

        {/* Mercado Pago checkout */}
        {payMethod === "mp" && (
          <div className="space-y-3">
            <h3 className="font-semibold text-center">Mercado Pago</h3>
            <p className="text-sm text-muted-foreground text-center">
              Vas a ser redirigido al checkout de Mercado Pago para pagar de
              forma segura.
            </p>

            {mpError && (
              <p className="text-sm font-medium text-destructive text-center">
                {mpError}
              </p>
            )}

            <Button
              className="w-full gap-2 h-12 text-base"
              disabled={mpLoading}
              onClick={handleMpPayment}
            >
              <Smartphone className="h-5 w-5" />
              {mpLoading
                ? "Conectando con Mercado Pago..."
                : "Ir a pagar"}
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setPayMethod("transfer")}
            >
              O usar transferencia bancaria
            </Button>
          </div>
        )}

        {/* Manual transfer */}
        {payMethod === "transfer" && (
          <div className="space-y-3">
            <h3 className="font-semibold text-center">
              Datos de la cuenta
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

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setPayMethod("mp")}
            >
              O pagar con Mercado Pago
            </Button>
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={onBack}>
          Volver a la rifa
        </Button>
      </CardContent>
    </Card>
  );
}
