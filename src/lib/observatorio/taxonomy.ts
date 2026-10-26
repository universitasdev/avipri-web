import type { PrismaClient } from "@prisma/client";
import { CATEGORY_COLORS } from "@/components/observatorio/categoryStyles";
import { getPrisma } from "@/lib/db";
import { slugify } from "@/lib/observatorio/slug";

export const MAX_TAGS = 10;

/** Lo que necesita el formulario de noticia: categorías para elegir y etiquetas para sugerir. */
export async function getFormTaxonomy() {
  const prisma = await getPrisma();
  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, slug: true, name: true, color: true, icon: true },
    }),
    prisma.tag.findMany({
      orderBy: [{ news: { _count: "desc" } }, { name: "asc" }],
      select: { name: true },
    }),
  ]);
  return { categories, tagSuggestions: tags.map((tag) => tag.name) };
}

/** Nombre limpio: sin espacios dobles ni en los bordes. */
export function cleanName(name: string) {
  return name.replace(/\s+/g, " ").trim();
}

/**
 * Busca la categoría por su nombre (sin distinguir mayúsculas ni acentos) y, si no existe,
 * la crea con el siguiente color libre de la paleta. Así dos editores que escriben
 * "Mesas técnicas" y "mesas tecnicas" usan la misma.
 */
export async function findOrCreateCategory(prisma: PrismaClient, rawName: string) {
  const name = cleanName(rawName);
  const slug = slugify(name);
  if (!slug) return null;

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return { category: existing, created: false };

  const count = await prisma.category.count();
  try {
    const category = await prisma.category.create({
      data: { name, slug, color: CATEGORY_COLORS[count % CATEGORY_COLORS.length]! },
    });
    return { category, created: true };
  } catch {
    // Otro usuario la creó al mismo tiempo: se usa esa.
    const category = await prisma.category.findUnique({ where: { slug } });
    return category ? { category, created: false } : null;
  }
}

/** Ids de las etiquetas indicadas por nombre: reutiliza las existentes y crea las nuevas. */
export async function resolveTagIds(prisma: PrismaClient, names: string[]) {
  const wanted = new Map<string, string>();
  for (const raw of names) {
    const name = cleanName(raw);
    const slug = slugify(name);
    if (slug && !wanted.has(slug)) wanted.set(slug, name);
  }

  const ids: string[] = [];
  for (const [slug, name] of [...wanted].slice(0, MAX_TAGS)) {
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { slug, name },
    });
    ids.push(tag.id);
  }
  return ids;
}
