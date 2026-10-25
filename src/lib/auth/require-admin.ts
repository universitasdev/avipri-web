import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { getCurrentAdmin, rotateRefreshSession } from "@/lib/auth/session";
import { isSameOrigin } from "@/lib/auth/request";

type RequireOptions = {
  // Solo las rutas de cuenta pueden usarse mientras la contraseña temporal siga activa.
  allowPendingPassword?: boolean;
};

export async function requireAdmin(request: Request, options: RequireOptions = {}) {
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

  if (admin.mustChangePassword && !options.allowPendingPassword) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Debes cambiar tu contraseña temporal antes de continuar." },
        { status: 403 },
      ),
    };
  }

  return { ok: true as const, admin };
}

export async function requireRole(request: Request, role: Role) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth;

  if (auth.admin.role !== role) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "No tienes permiso para esta acción." },
        { status: 403 },
      ),
    };
  }

  return auth;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
