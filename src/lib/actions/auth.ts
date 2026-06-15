"use server";

import { createSession, destroySession, verifyPassword } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const password = formData.get("password") as string;

  if (!password) {
    return { error: "Ingresá la contraseña" };
  }

  if (!verifyPassword(password)) {
    return { error: "Contraseña incorrecta" };
  }

  await createSession("1", "Admin");
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
