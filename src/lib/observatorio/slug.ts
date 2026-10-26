import type { PrismaClient } from "@prisma/client";

const MAX_LENGTH = 80;

/** Título → "titulo-sin-acentos-en-minusculas", cortado en una palabra completa. */
export function slugify(title: string) {
  const base = title
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (base.length <= MAX_LENGTH) return base;
  const cut = base.slice(0, MAX_LENGTH);
  const lastDash = cut.lastIndexOf("-");
  return (lastDash > 40 ? cut.slice(0, lastDash) : cut).replace(/-+$/, "");
}

/** Slug libre para una noticia nueva: si ya existe, agrega -2, -3… */
export async function uniqueNewsSlug(prisma: PrismaClient, title: string) {
  const base = slugify(title) || "noticia";
  const taken = new Set(
    (
      await prisma.newsArticle.findMany({
        where: { slug: { startsWith: base } },
        select: { slug: true },
      })
    ).map((row) => row.slug),
  );
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidate = `${base}-${n}`;
    if (!taken.has(candidate)) return candidate;
  }
}
