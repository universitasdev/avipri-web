import { NextResponse } from "next/server";
import { isSameOrigin } from "@/lib/auth/request";
import { rotateRefreshSession } from "@/lib/auth/session";

function safeAdminPath(value: string | null) {
  if (value && value.startsWith("/admin") && !value.startsWith("//")) {
    return value;
  }
  return "/admin";
}

export async function GET(request: Request) {
  const next = safeAdminPath(new URL(request.url).searchParams.get("next"));
  const user = await rotateRefreshSession();
  if (!user) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.redirect(new URL(next, request.url));
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  const user = await rotateRefreshSession();
  if (!user) {
    return NextResponse.json({ error: "Sesión no válida." }, { status: 401 });
  }

  return NextResponse.json({ ok: true, email: user.email, name: user.name });
}
