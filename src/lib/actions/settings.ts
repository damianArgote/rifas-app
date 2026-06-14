"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

type SettingKey = "mp_alias" | "mp_cvu" | "mp_titular" | "admin_whatsapp";

export async function getSettings() {
  const allSettings = await db.query.settings.findMany();

  const defaults: Record<SettingKey, string> = {
    mp_alias: process.env.MP_ALIAS ?? "",
    mp_cvu: process.env.MP_CVU ?? "",
    mp_titular: process.env.MP_TITULAR ?? "",
    admin_whatsapp: process.env.ADMIN_WHATSAPP ?? "",
  };

  const result = { ...defaults };

  for (const s of allSettings) {
    if (s.key in defaults) {
      result[s.key as SettingKey] = s.value;
    }
  }

  return result;
}

export async function updateSetting(key: string, value: string) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  const existing = await db.query.settings.findFirst({
    where: (s, { eq }) => eq(s.key, key),
  });

  if (existing) {
    await db
      .update(settings)
      .set({ value, updatedAt: new Date() })
      .where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }

  revalidatePath("/admin/configuracion");
}

export async function updateSettings(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  const keys: SettingKey[] = [
    "mp_alias",
    "mp_cvu",
    "mp_titular",
    "admin_whatsapp",
  ];

  for (const key of keys) {
    const value = formData.get(key) as string;
    if (value) {
      const existing = await db.query.settings.findFirst({
        where: (s, { eq }) => eq(s.key, key),
      });

      if (existing) {
        await db
          .update(settings)
          .set({ value, updatedAt: new Date() })
          .where(eq(settings.key, key));
      } else {
        await db.insert(settings).values({ key, value });
      }
    }
  }

  revalidatePath("/admin/configuracion");
}
