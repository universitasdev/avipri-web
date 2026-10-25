import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

/** Etiquetas existentes, las más usadas primero, para sugerirlas al escribir. */
export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;
  const prisma = await getPrisma();
  const tags = await prisma.tag.findMany({
    orderBy: [{ news: { _count: "desc" } }, { name: "asc" }],
    select: { name: true, slug: true, _count: { select: { news: true } } },
  });
  return NextResponse.json({
    tags: tags.map((tag) => ({ name: tag.name, slug: tag.slug, count: tag._count.news })),
  });
}
