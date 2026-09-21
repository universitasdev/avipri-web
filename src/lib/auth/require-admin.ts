import { NextResponse } from "next/server";
import { getCurrentAdmin, rotateRefreshSession } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/request";

export async function requireAdmin(request: Request) {
  if (!isSameOrigin(request)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Origen no permitido." }, { status: 403 }),
    };
  }

  const admin = (await getCurrentAdmin()) ?? (await rotateRefreshSession());
  if (!admin) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "Sesión no válida." }, { status: 401 }),
    };
  }

  return { ok: true as const, admin };
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
