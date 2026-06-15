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
import { ArrowLeft, Plus, Upload, X, Loader2 } from "lucide-react";
import { LinkButton } from "@/components/shared/LinkButton";
import { uploadPrizeImage } from "@/lib/actions/uploads";
import Image from "next/image";

export default function NuevaRifaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [numberCount, setNumberCount] = useState(200);
  const [price, setPrice] = useState("1000");
  const [totalPreview, setTotalPreview] = useState("0");
  const [prize1Image, setPrize1Image] = useState("");
  const [prize2Image, setPrize2Image] = useState("");
  const [prize3Image, setPrize3Image] = useState("");
  const [uploading, setUploading] = useState<1 | 2 | 3 | null>(null);

  function updatePreview(count: number, priceVal: string) {
    const p = parseFloat(priceVal) || 0;
    setTotalPreview(formatARS(count * p));
  }

  async function handleImageUpload(
    file: File,
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void,
  ) {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 5MB");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadPrizeImage(fd);
    setUploading(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.url) {
      setUrl(result.url);
    }
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
    } catch (err) {
      // Server actions call redirect(), which rejects the promise with a
      // NEXT_REDIRECT error. This is expected — the framework handles
      // navigation. Don't show toast for that.
      if (
        err &&
        typeof err === "object" &&
        "digest" in err &&
        typeof err.digest === "string" &&
        err.digest.startsWith("NEXT_REDIRECT")
      ) {
        return;
      }
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

            <PrizeField
              label="Premio 1 (1er puesto) *"
              name="prize1"
              placeholder="Ej: Heladera Samsung 320L"
              required
              imageUrl={prize1Image}
              setImageUrl={setPrize1Image}
              uploading={uploading === 1}
              setUploading={(v) => setUploading(v ? 1 : null)}
              prizeIndex={1}
            />

            <PrizeField
              label="Premio 2 (2do puesto)"
              name="prize2"
              placeholder="Ej: TV LED 32"
              imageUrl={prize2Image}
              setImageUrl={setPrize2Image}
              uploading={uploading === 2}
              setUploading={(v) => setUploading(v ? 2 : null)}
              prizeIndex={2}
            />

            <PrizeField
              label="Premio 3 (3er puesto)"
              name="prize3"
              placeholder="Ej: Parlante Bluetooth"
              imageUrl={prize3Image}
              setImageUrl={setPrize3Image}
              uploading={uploading === 3}
              setUploading={(v) => setUploading(v ? 3 : null)}
              prizeIndex={3}
            />

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

// ─── PrizeField ─────────────────────────────────────────────────────────────
function PrizeField({
  label,
  name,
  placeholder,
  required,
  imageUrl,
  setImageUrl,
  uploading,
  setUploading,
  prizeIndex,
}: {
  label: string;
  name: string;
  placeholder: string;
  required?: boolean;
  imageUrl: string;
  setImageUrl: (url: string) => void;
  uploading: boolean;
  setUploading: (v: boolean) => void;
  prizeIndex: number;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          name={name}
          placeholder={placeholder}
          required={required}
          className="flex-1"
        />
        <label
          className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors cursor-pointer
            ${uploading ? "opacity-50 pointer-events-none" : "hover:bg-muted"}`}
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                // We need a reference to the parent's handleImageUpload
                // This is a bit tricky — let's use a custom event or ref
                // Instead, upload via FormData directly
                handleLocalUpload(file);
              }
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {imageUrl && (
        <div className="relative mt-2 w-24 h-24 rounded-lg overflow-hidden border">
          <Image
            src={imageUrl}
            alt="Preview"
            fill
            className="object-cover"
          />
          <button
            type="button"
            onClick={() => setImageUrl("")}
            className="absolute top-0.5 right-0.5 bg-background/80 rounded-full p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      {/* Hidden input to submit the URL */}
      <input type="hidden" name={`${name}Image`} value={imageUrl} />
    </div>
  );

  async function handleLocalUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error("Solo se permiten imágenes");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen no puede superar los 5MB");
      return;
    }

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadPrizeImage(fd);
    setUploading(false);

    if (result?.error) {
      toast.error(result.error);
    } else if (result?.url) {
      setImageUrl(result.url);
    }
  }
}
