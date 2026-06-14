"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { getSettings, updateSettings } from "@/lib/actions/settings";
import { ArrowLeft, Save } from "lucide-react";
import { LinkButton } from "@/components/shared/LinkButton";

export default function ConfigPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    mp_alias: "",
    mp_cvu: "",
    mp_titular: "",
    admin_whatsapp: "",
  });

  useEffect(() => {
    getSettings().then((settings) => {
      setFormData(settings);
      setLoading(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      await updateSettings(formData);
      toast.success("Configuración guardada");
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <LinkButton href="/admin" variant="ghost" size="icon">
          <ArrowLeft className="h-5 w-5" />
        </LinkButton>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Configuración
          </h1>
          <p className="text-muted-foreground">
            Datos de pago y contacto
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Mercado Pago</CardTitle>
            <CardDescription>
              Datos de la cuenta donde los compradores harán la
              transferencia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mp_alias">Alias</Label>
              <Input
                id="mp_alias"
                name="mp_alias"
                value={formData.mp_alias}
                onChange={(e) =>
                  setFormData({ ...formData, mp_alias: e.target.value })
                }
                placeholder="ej: mercado.pago.alias"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mp_cvu">CVU</Label>
              <Input
                id="mp_cvu"
                name="mp_cvu"
                value={formData.mp_cvu}
                onChange={(e) =>
                  setFormData({ ...formData, mp_cvu: e.target.value })
                }
                placeholder="0000003100000000000001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mp_titular">
                Titular de la cuenta
              </Label>
              <Input
                id="mp_titular"
                name="mp_titular"
                value={formData.mp_titular}
                onChange={(e) =>
                  setFormData({ ...formData, mp_titular: e.target.value })
                }
                placeholder="Nombre del titular"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>
              Número de teléfono del administrador para recibir
              comprobantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="admin_whatsapp">
                Número de WhatsApp (con código de país)
              </Label>
              <Input
                id="admin_whatsapp"
                name="admin_whatsapp"
                value={formData.admin_whatsapp}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    admin_whatsapp: e.target.value,
                  })
                }
                placeholder="5491123456789"
              />
              <p className="text-xs text-muted-foreground">
                Sin el símbolo +. Ej: 5491123456789
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end mt-6">
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Guardando..." : "Guardar configuración"}
          </Button>
        </div>
      </form>
    </div>
  );
}
