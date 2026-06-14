"use server";

import { createSession, destroySession, verifyCredentials } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Completá todos los campos" };
  }

  if (!verifyCredentials(email, password)) {
    return { error: "Email o contraseña incorrectos" };
  }

  await createSession("1", email, "Admin");
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}
