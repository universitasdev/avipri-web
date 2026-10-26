import type { Prisma } from "@prisma/client";
import type { NewsArticle, NewsCategory, NewsPoint, NewsVideo } from "@/lib/observatorio/content";
import { LEAD_ARTICLE, SECONDARY_ARTICLES } from "@/lib/observatorio/content";
import { getPrisma } from "@/lib/db";
import { leadToHtml } from "@/lib/observatorio/rich-text";

function parsePoints(raw: string | null | undefined): NewsPoint[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is NewsPoint => {
      return (
        Boolean(item) &&
        typeof item === "object" &&
        typeof (item as NewsPoint).title === "string" &&
        typeof (item as NewsPoint).body === "string"
      );
    });
  } catch {
    return [];
  }
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatDateShort(date: Date) {
  return new Intl.DateTimeFormat("es-VE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

/** Lo que se lee junto a cada noticia: fotos en orden, su categoría y sus etiquetas. */
export const NEWS_INCLUDE = {
  images: { orderBy: { position: "asc" } },
  category: true,
  tags: { include: { tag: true }, orderBy: { tag: { name: "asc" } } },
} satisfies Prisma.NewsArticleInclude;

export type NewsRecord = Prisma.NewsArticleGetPayload<{ include: typeof NEWS_INCLUDE }>;

function mapCategory(category: NewsRecord["category"]): NewsCategory {
  return { slug: category.slug, name: category.name, color: category.color, icon: category.icon };
}

function mapVideo(row: NewsRecord): NewsVideo | undefined {
  if (row.mediaType !== "VIDEO") return undefined;
  const title = row.imageAlt || row.title;
  // La portada que sube el editor manda; si no hay, YouTube trae su miniatura.
  if (row.videoYoutubeId) {
    return {
      kind: "youtube",
      youtubeId: row.videoYoutubeId,
      title,
      poster: row.imageSrc ?? `https://i.ytimg.com/vi/${row.videoYoutubeId}/hqdefault.jpg`,
    };
  }
  if (row.videoFileSrc) {
    return { kind: "file", src: row.videoFileSrc, title, poster: row.imageSrc ?? undefined };
  }
  return undefined;
}

function mapImages(row: NewsRecord) {
  if (row.mediaType !== "IMAGE") return { images: [] };
  const images = row.images.map((image) => ({ src: image.src, alt: image.alt || row.title }));
  return { images, image: images[0] };
}

export function mapNewsArticle(row: NewsRecord): NewsArticle {
  const eventDetails = parsePoints(row.eventDetailsJson);
  return {
    id: row.id,
    slug: row.slug,
    featured: row.featured,
    category: mapCategory(row.category),
    categoryLabel: row.category.name,
    tags: row.tags.map(({ tag }) => ({ slug: tag.slug, name: tag.name })),
    isoDate: row.publishedAt.toISOString(),
    date: formatDate(row.publishedAt),
    dateShort: formatDateShort(row.publishedAt),
    title: row.title,
    subtitle: row.subtitle,
    lead: row.lead ?? undefined,
    bodyHtml: leadToHtml(row.lead),
    pointsLabel: row.pointsLabel ?? undefined,
    points: parsePoints(row.pointsJson),
    eventDetailsLabel: row.eventDetailsLabel ?? undefined,
    eventDetails: eventDetails.length > 0 ? eventDetails : undefined,
    cta: row.cta ?? undefined,
    href: row.href ?? undefined,
    ...mapImages(row),
    video: mapVideo(row),
    attachment: row.attachmentSrc
      ? {
          src: row.attachmentSrc,
          name: row.attachmentName || row.title,
          bytes: row.attachmentBytes ?? 0,
        }
      : undefined,
    stats: { views: row.viewCount, likes: row.likeCount, dislikes: row.dislikeCount },
    external:
      row.externalUrl && row.externalSource
        ? { source: row.externalSource, url: row.externalUrl }
        : undefined,
  };
}

// Respaldo si la base no responde o aún no tiene noticias.
const STATIC_NEWS: NewsArticle[] = [{ ...LEAD_ARTICLE, featured: true }, ...SECONDARY_ARTICLES].map(
  (article) => ({ ...article, images: article.image ? [article.image] : [], tags: [] }),
);

/** Filtro del Observatorio: por categoría (?categoria=) o por etiqueta (?etiqueta=). */
export type NewsFilter = { category?: string; tag?: string };

function matchesFilter(article: NewsArticle, filter: NewsFilter) {
  if (filter.category && article.category.slug !== filter.category) return false;
  if (filter.tag && !article.tags?.some((tag) => tag.slug === filter.tag)) return false;
  return true;
}

/** Noticias publicadas: la destacada primero y luego de la más reciente a la más antigua. */
export async function getNews(filter: NewsFilter = {}): Promise<NewsArticle[]> {
  try {
    const prisma = await getPrisma();
    const total = await prisma.newsArticle.count({ where: { published: true } });
    if (total === 0) return STATIC_NEWS.filter((article) => matchesFilter(article, filter));

    const rows = await prisma.newsArticle.findMany({
      where: {
        published: true,
        ...(filter.category ? { category: { slug: filter.category } } : {}),
        ...(filter.tag ? { tags: { some: { tag: { slug: filter.tag } } } } : {}),
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      include: NEWS_INCLUDE,
    });
    return rows.map(mapNewsArticle);
  } catch {
    return STATIC_NEWS.filter((article) => matchesFilter(article, filter));
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const prisma = await getPrisma();
    const row = await prisma.newsArticle.findUnique({ where: { slug }, include: NEWS_INCLUDE });
    if (row) return row.published ? mapNewsArticle(row) : null;
    // Solo se usa el respaldo estático cuando la base todavía no tiene noticias.
    if ((await prisma.newsArticle.count()) > 0) return null;
  } catch {
    // Sin base: se intenta con el respaldo estático.
  }
  return STATIC_NEWS.find((article) => article.slug === slug) ?? null;
}

/** Para la vista previa del panel: incluye borradores. Los permisos se revisan en la página. */
export async function getNewsForPreview(id: string) {
  const prisma = await getPrisma();
  const row = await prisma.newsArticle.findUnique({ where: { id }, include: NEWS_INCLUDE });
  return row ? { row, article: mapNewsArticle(row) } : null;
}

/** "Más noticias": prioriza la misma categoría y completa con las más recientes. */
export async function getRelatedNews(article: NewsArticle, limit = 3) {
  const others = (await getNews()).filter((item) => item.slug !== article.slug);
  const sameCategory = others.filter((item) => item.category.slug === article.category.slug);
  const rest = others.filter((item) => item.category.slug !== article.category.slug);
  return [...sameCategory, ...rest].slice(0, limit);
}

/** Categorías con noticias publicadas, para los filtros del Observatorio. */
export async function getPublicCategories(): Promise<(NewsCategory & { count: number })[]> {
  try {
    const prisma = await getPrisma();
    const categories = await prisma.category.findMany({
      where: { news: { some: { published: true } } },
      orderBy: { name: "asc" },
      include: { _count: { select: { news: { where: { published: true } } } } },
    });
    return categories.map((category) => ({ ...mapCategory(category), count: category._count.news }));
  } catch {
    return [];
  }
}

/** Nombre visible de una etiqueta a partir de su slug (para el aviso de filtro). */
export async function getTagName(slug: string) {
  try {
    const prisma = await getPrisma();
    return (await prisma.tag.findUnique({ where: { slug }, select: { name: true } }))?.name ?? null;
  } catch {
    return null;
  }
}

export async function getAdminNews() {
  const prisma = await getPrisma();
  return prisma.newsArticle.findMany({
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    include: {
      ...NEWS_INCLUDE,
      createdBy: { select: { name: true } },
    },
  });
}
