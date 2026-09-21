import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { AUTH_COOKIES, getAuthSecret } from "@/lib/auth/config";

const ISSUER = "pdul.online";
const AUDIENCE = "pdul-admin";

async function hasValidAccess(token: string) {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    return payload.typ === "access";
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const access = request.cookies.get(AUTH_COOKIES.access)?.value;
  const refresh = request.cookies.get(AUTH_COOKIES.refresh)?.value;
  const hasAccess = Boolean(access && (await hasValidAccess(access)));
  const canEnterAdmin = hasAccess || Boolean(refresh);

  if (pathname === "/admin/login" || pathname === "/api/admin/auth/login") {
    if (pathname === "/admin/login" && hasAccess) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (canEnterAdmin) return NextResponse.next();

    if (pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
    }

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/api/admin/:path*"],
};
