"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth";

export type SettingKey = "mp_alias" | "mp_cvu" | "mp_titular" | "admin_whatsapp" | "cash_address" | "cash_info";

const SETTING_KEYS: SettingKey[] = [
  "mp_alias",
  "mp_cvu",
  "mp_titular",
  "admin_whatsapp",
  "cash_address",
  "cash_info",
];

export async function getSettings(): Promise<Record<SettingKey, string>> {
  const allSettings = await db.query.settings.findMany();

  const result = Object.fromEntries(
    SETTING_KEYS.map((key) => [key, ""]),
  ) as Record<SettingKey, string>;

  for (const s of allSettings) {
    if (s.key in result) {
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

  for (const key of SETTING_KEYS) {
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
