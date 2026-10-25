import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { newsInputSchema, parsePublishedAt } from "@/lib/admin/schemas";
import { parseJsonBody } from "@/lib/admin/safe";
import { buildNewsData } from "@/lib/admin/news-input";
import { canEditArticle, canFeatureArticle } from "@/lib/auth/permissions";

type RouteContext = { params: Promise<{ id: string }> };

function revalidateNews() {
  revalidatePath("/");
  revalidatePath("/observatorio");
  revalidatePath("/observatorio/[slug]", "page");
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const prisma = await getPrisma();
  const existing = await prisma.newsArticle.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Noticia no encontrada." }, { status: 404 });
  }
  if (!canEditArticle(auth.admin, existing)) {
    return NextResponse.json(
      { error: "Solo puedes editar las noticias que creaste." },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await parseJsonBody(request);
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
  }

  const parsed = newsInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Revisa los campos de la noticia." }, { status: 400 });
  }

  let publishedAt: Date;
  try {
    publishedAt = parsePublishedAt(parsed.data.publishedAt);
  } catch {
    return NextResponse.json({ error: "Fecha inválida." }, { status: 400 });
  }

  const built = buildNewsData(parsed.data, publishedAt);
  if (!built.ok) {
    return NextResponse.json({ error: built.error }, { status: 400 });
  }

  // Un editor no puede cambiar la destacada: se conserva el valor actual.
  const featured = canFeatureArticle(auth.admin) ? parsed.data.featured : existing.featured;
  if (featured) {
    await prisma.newsArticle.updateMany({
      where: { NOT: { id } },
      data: { featured: false },
    });
  }

  // Las fotos se reemplazan completas: Prisma hace el borrado y la creación en una transacción.
  const article = await prisma.newsArticle.update({
    where: { id },
    data: {
      ...built.data,
      featured,
      updatedById: auth.admin.id,
      images: { deleteMany: {}, create: built.images },
    },
    include: { images: { orderBy: { position: "asc" } } },
  });

  revalidateNews();
  return NextResponse.json({ article });
}

export async function DELETE(request: Request, context: RouteContext) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const prisma = await getPrisma();
  const existing = await prisma.newsArticle.findUnique({
    where: { id },
    select: { createdById: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Noticia no encontrada." }, { status: 404 });
  }
  if (!canEditArticle(auth.admin, existing)) {
    return NextResponse.json(
      { error: "Solo puedes eliminar las noticias que creaste." },
      { status: 403 },
    );
  }

  try {
    await prisma.newsArticle.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Noticia no encontrada." }, { status: 404 });
  }

  revalidateNews();
  return NextResponse.json({ ok: true });
}
