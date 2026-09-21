import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { newsInputSchema, parsePublishedAt } from "@/lib/admin/schemas";
import { parseJsonBody, safeNewsImagePath, safePublicUrl } from "@/lib/admin/safe";
import { getAdminNews } from "@/lib/observatorio/getNews";

function revalidateNews() {
  revalidatePath("/");
  revalidatePath("/observatorio");
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

  const prisma = await getPrisma();
  if (parsed.data.featured) {
    await prisma.newsArticle.updateMany({ data: { featured: false } });
  }

  const article = await prisma.newsArticle.create({
    data: {
      category: parsed.data.category,
      categoryLabel: parsed.data.categoryLabel,
      publishedAt,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      lead: parsed.data.lead || null,
      pointsLabel: parsed.data.pointsLabel || null,
      pointsJson: JSON.stringify(parsed.data.points),
      eventDetailsLabel: parsed.data.eventDetailsLabel || null,
      eventDetailsJson: parsed.data.eventDetails ? JSON.stringify(parsed.data.eventDetails) : null,
      cta: parsed.data.cta || null,
      href: safePublicUrl(parsed.data.href),
      imageSrc: safeNewsImagePath(parsed.data.imageSrc),
      imageAlt: parsed.data.imageAlt || null,
      featured: parsed.data.featured,
      published: parsed.data.published,
    },
  });

  revalidateNews();
  return NextResponse.json({ article }, { status: 201 });
}
