"use server";

import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth";

export async function uploadPrizeImage(formData: FormData) {
  const session = await getSession();
  if (!session) throw new Error("No autorizado");

  const file = formData.get("file") as File;
  if (!file) return { error: "No se recibió el archivo" };

  if (!file.type.startsWith("image/")) {
    return { error: "Solo se permiten imágenes" };
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: "La imagen no puede superar los 5MB" };
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `prizes/${crypto.randomUUID()}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return { url: blob.url };
}
