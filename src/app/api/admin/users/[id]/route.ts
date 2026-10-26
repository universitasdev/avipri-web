import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-admin";
import { hashPassword } from "@/lib/auth/password";
import { revokeAllSessions } from "@/lib/auth/session";
import { userUpdateSchema } from "@/lib/admin/schemas";
import { parseJsonBody } from "@/lib/admin/safe";
import { ADMIN_USER_SELECT } from "@/lib/admin/users";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireRole(request, "ADMIN");
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const prisma = await getPrisma();
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Usuario no encontrado." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await parseJsonBody(request);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los campos del usuario." }, { status: 400 });
  }
  const changes = parsed.data;

  const losesAdmin =
    existing.role === "ADMIN" &&
    existing.active &&
    (changes.role === "EDITOR" || changes.active === false);

  if (losesAdmin && existing.id === auth.admin.id) {
    return NextResponse.json(
      { error: "No puedes quitarte el rol de admin ni desactivar tu propia cuenta." },
      { status: 400 },
    );
  }

  if (losesAdmin) {
    const activeAdmins = await prisma.user.count({ where: { role: "ADMIN", active: true } });
    if (activeAdmins <= 1) {
      return NextResponse.json(
        { error: "Debe quedar al menos un admin activo." },
        { status: 400 },
      );
    }
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      name: changes.name,
      role: changes.role,
      active: changes.active,
      ...(changes.password
        ? { passwordHash: await hashPassword(changes.password), mustChangePassword: true }
        : {}),
    },
    select: ADMIN_USER_SELECT,
  });

  // Al desactivar o resetear la contraseña, las sesiones abiertas dejan de servir.
  if (changes.active === false || changes.password) {
    await revokeAllSessions(id);
  }

  return NextResponse.json({ user });
}
