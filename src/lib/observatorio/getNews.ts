import type { NewsArticle, NewsCategoryId, NewsPoint, NewsVideo } from "@/lib/observatorio/content";
import { LEAD_ARTICLE, SECONDARY_ARTICLES } from "@/lib/observatorio/content";
import { getPrisma } from "@/lib/db";

const CATEGORIES: NewsCategoryId[] = ["institucional", "doctrina", "vuf", "aula"];

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

function asCategory(value: string): NewsCategoryId {
  return CATEGORIES.includes(value as NewsCategoryId) ? (value as NewsCategoryId) : "institucional";
}

export type NewsRecord = {
  id: string;
  slug: string;
  category: string;
  categoryLabel: string;
  publishedAt: Date;
  title: string;
  subtitle: string;
  lead: string | null;
  pointsLabel: string | null;
  pointsJson: string;
  eventDetailsLabel: string | null;
  eventDetailsJson: string | null;
  cta: string | null;
  href: string | null;
  imageSrc: string | null;
  imageAlt: string | null;
  mediaType: "IMAGE" | "VIDEO";
  videoYoutubeId: string | null;
  videoFileSrc: string | null;
  featured: boolean;
  published: boolean;
};

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

export function mapNewsArticle(row: NewsRecord): NewsArticle {
  const eventDetails = parsePoints(row.eventDetailsJson);
  return {
    id: row.id,
    slug: row.slug,
    featured: row.featured,
    category: asCategory(row.category),
    categoryLabel: row.categoryLabel,
    isoDate: row.publishedAt.toISOString(),
    date: formatDate(row.publishedAt),
    dateShort: formatDateShort(row.publishedAt),
    title: row.title,
    subtitle: row.subtitle,
    lead: row.lead ?? undefined,
    pointsLabel: row.pointsLabel ?? undefined,
    points: parsePoints(row.pointsJson),
    eventDetailsLabel: row.eventDetailsLabel ?? undefined,
    eventDetails: eventDetails.length > 0 ? eventDetails : undefined,
    cta: row.cta ?? undefined,
    href: row.href ?? undefined,
    image:
      row.mediaType === "IMAGE" && row.imageSrc
        ? { src: row.imageSrc, alt: row.imageAlt || row.title }
        : undefined,
    video: mapVideo(row),
  };
}

// Respaldo si la base no responde o aún no tiene noticias.
const STATIC_NEWS: NewsArticle[] = [{ ...LEAD_ARTICLE, featured: true }, ...SECONDARY_ARTICLES];

/** Noticias publicadas: la destacada primero y luego de la más reciente a la más antigua. */
export async function getNews(): Promise<NewsArticle[]> {
  try {
    const prisma = await getPrisma();
    const rows = await prisma.newsArticle.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    });
    return rows.length > 0 ? rows.map(mapNewsArticle) : STATIC_NEWS;
  } catch {
    return STATIC_NEWS;
  }
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  try {
    const prisma = await getPrisma();
    const row = await prisma.newsArticle.findUnique({ where: { slug } });
    if (row) return row.published ? mapNewsArticle(row) : null;
    // Solo se usa el respaldo estático cuando la base todavía no tiene noticias.
    if ((await prisma.newsArticle.count()) > 0) return null;
  } catch {
    // Sin base: se intenta con el respaldo estático.
  }
  return STATIC_NEWS.find((article) => article.slug === slug) ?? null;
}

/** "Más noticias": prioriza la misma categoría y completa con las más recientes. */
export async function getRelatedNews(article: NewsArticle, limit = 3) {
  const others = (await getNews()).filter((item) => item.slug !== article.slug);
  const sameCategory = others.filter((item) => item.category === article.category);
  const rest = others.filter((item) => item.category !== article.category);
  return [...sameCategory, ...rest].slice(0, limit);
}

export async function getAdminNews() {
  const prisma = await getPrisma();
  return prisma.newsArticle.findMany({
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    include: { createdBy: { select: { name: true } } },
  });
}
