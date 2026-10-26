import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { categoryCreateSchema } from "@/lib/admin/schemas";
import { parseJsonBody } from "@/lib/admin/safe";
import { findOrCreateCategory } from "@/lib/observatorio/taxonomy";

const CATEGORY_SELECT = { id: true, slug: true, name: true, color: true, icon: true } as const;

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const prisma = await getPrisma();
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: CATEGORY_SELECT,
  });
  return NextResponse.json({ categories });
}

/** Cualquier usuario del panel puede crear una categoría desde el formulario de noticia. */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  let body: unknown;
  try {
    body = await parseJsonBody(request);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Escribe un nombre de entre 2 y 60 letras para la categoría." },
      { status: 400 },
    );
  }

  const prisma = await getPrisma();
  const result = await findOrCreateCategory(prisma, parsed.data.name);
  if (!result) {
    return NextResponse.json({ error: "Ese nombre no sirve para una categoría." }, { status: 400 });
  }

  revalidatePath("/observatorio");
  const { id, slug, name, color, icon } = result.category;
  return NextResponse.json(
    { category: { id, slug, name, color, icon }, created: result.created },
    { status: result.created ? 201 : 200 },
  );
}
