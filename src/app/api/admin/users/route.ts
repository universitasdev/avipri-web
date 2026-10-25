import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { requireRole } from "@/lib/auth/require-admin";
import { hashPassword } from "@/lib/auth/password";
import { userCreateSchema } from "@/lib/admin/schemas";
import { parseJsonBody } from "@/lib/admin/safe";
import { ADMIN_USER_SELECT, getAdminUsers } from "@/lib/admin/users";

export async function GET(request: Request) {
  const auth = await requireRole(request, "ADMIN");
  if (!auth.ok) return auth.response;
  const users = await getAdminUsers();
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, "ADMIN");
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await parseJsonBody(request);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const parsed = userCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Revisa nombre, correo y contraseña (mínimo 8 caracteres)." },
      { status: 400 },
    );
  }

  const prisma = await getPrisma();
  try {
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        passwordHash: await hashPassword(parsed.data.password),
        mustChangePassword: true,
      },
      select: ADMIN_USER_SELECT,
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Ya existe un usuario con ese correo." }, { status: 409 });
    }
    throw error;
  }
}
