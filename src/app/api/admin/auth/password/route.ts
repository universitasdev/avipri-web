import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { issueSession, revokeAllSessions } from "@/lib/auth/session";
import { passwordChangeSchema } from "@/lib/admin/schemas";
import { PASSWORD_POLICY_TEXT } from "@/lib/auth/password-policy";
import { parseJsonBody } from "@/lib/admin/safe";

export async function POST(request: Request) {
  const auth = await requireAdmin(request, { allowPendingPassword: true });
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await parseJsonBody(request);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const parsed = passwordChangeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: PASSWORD_POLICY_TEXT },
      { status: 400 },
    );
  }
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    return NextResponse.json(
      { error: "La nueva contraseña debe ser distinta de la actual." },
      { status: 400 },
    );
  }

  const prisma = await getPrisma();
  const user = await prisma.user.findUnique({ where: { id: auth.admin.id } });
  if (!user || !(await verifyPassword(parsed.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "La contraseña actual no es correcta." }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: await hashPassword(parsed.data.newPassword),
      mustChangePassword: false,
    },
  });

  // Cierra las demás sesiones y deja abierta solo la actual.
  await revokeAllSessions(user.id);
  await issueSession({ id: user.id, email: user.email });
  return NextResponse.json({ ok: true });
}
