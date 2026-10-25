import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { newsInputSchema, parsePublishedAt } from "@/lib/admin/schemas";
import { parseJsonBody } from "@/lib/admin/safe";
import { buildNewsData } from "@/lib/admin/news-input";
import { NEWS_INCLUDE, getAdminNews } from "@/lib/observatorio/getNews";
import { canFeatureArticle } from "@/lib/auth/permissions";
import { uniqueNewsSlug } from "@/lib/observatorio/slug";
import { resolveTagIds } from "@/lib/observatorio/taxonomy";

function revalidateNews() {
  revalidatePath("/");
  revalidatePath("/observatorio");
  revalidatePath("/observatorio/[slug]", "page");
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const articles = await getAdminNews();
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

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

  const prisma = await getPrisma();
  if (!(await prisma.category.findUnique({ where: { id: built.data.categoryId }, select: { id: true } }))) {
    return NextResponse.json({ error: "Elige una categoría de la lista." }, { status: 400 });
  }
  const tagIds = await resolveTagIds(prisma, built.tags);

  const featured = canFeatureArticle(auth.admin) ? parsed.data.featured : false;
  if (featured) {
    await prisma.newsArticle.updateMany({ data: { featured: false } });
  }

  const article = await prisma.newsArticle.create({
    data: {
      ...built.data,
      slug: await uniqueNewsSlug(prisma, built.data.title),
      featured,
      createdById: auth.admin.id,
      updatedById: auth.admin.id,
      images: { create: built.images },
      tags: { create: tagIds.map((tagId) => ({ tagId })) },
    },
    include: NEWS_INCLUDE,
  });

  revalidateNews();
  return NextResponse.json({ article }, { status: 201 });
}
