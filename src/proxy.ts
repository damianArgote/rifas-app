import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "fallback-secret-key-change-in-production",
);

const COOKIE_NAME = "session";

export async function proxy(request: Request) {
  const { pathname } = new URL(request.url);
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return NextResponse.next();
  }

  if (isAdminRoute) {
    const cookie = request.headers
      .get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith(`${COOKIE_NAME}=`));

    if (!cookie) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const token = cookie.split("=")[1];
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
