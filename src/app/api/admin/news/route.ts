import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { newsInputSchema, parsePublishedAt } from "@/lib/admin/schemas";
import { parseJsonBody } from "@/lib/admin/safe";
import { buildNewsData } from "@/lib/admin/news-input";
import { getAdminNews } from "@/lib/observatorio/getNews";
import { canFeatureArticle } from "@/lib/auth/permissions";
import { uniqueNewsSlug } from "@/lib/observatorio/slug";

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

  const featured = canFeatureArticle(auth.admin) ? parsed.data.featured : false;
  const prisma = await getPrisma();
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
    },
    include: { images: { orderBy: { position: "asc" } } },
  });

  revalidateNews();
  return NextResponse.json({ article }, { status: 201 });
}
