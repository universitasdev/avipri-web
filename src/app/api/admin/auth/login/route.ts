import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/admin/schemas";
import { getPrisma } from "@/lib/db";
import { isSameOrigin } from "@/lib/auth/request";
import {
  assertLoginAllowed,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/lib/auth/rate-limit";
import { verifyPassword } from "@/lib/auth/password";
import { issueSession } from "@/lib/auth/session";

const DUMMY_HASH = "$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";

function loginFailureMessage(error: unknown) {
  const message = error instanceof Error ? error.message : "Error interno";
  if (/PRIVATE KEY|BEGIN [A-Z ]+KEY/i.test(message)) {
    return "Error de configuración del servidor.";
  }
  return message.slice(0, 240);
}

export async function POST(request: Request) {
  try {
    return await handleLogin(request);
  } catch (error) {
    console.error("admin login failed", error);
    return NextResponse.json(
      { error: loginFailureMessage(error) },
      { status: 500 },
    );
  }
}

async function handleLogin(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Origen no permitido." }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return NextResponse.json({ error: "Formato no soportado." }, { status: 415 });
  }

  const gate = await assertLoginAllowed(request);
  if (!gate.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espera 15 minutos e inténtalo de nuevo." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    await recordLoginFailure(gate.ip);
    return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
  }

  const prisma = await getPrisma();
  const email = parsed.data.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  let ok = false;
  try {
    ok = await verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
  } catch {
    ok = false;
  }

  if (!user || !ok) {
    await recordLoginFailure(gate.ip);
    return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
  }

  await recordLoginSuccess(gate.ip);
  await prisma.refreshToken.updateMany({
    where: { userId: user.id, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  await issueSession({ id: user.id, email: user.email });
  return NextResponse.json({ ok: true, name: user.name, email: user.email });
}
