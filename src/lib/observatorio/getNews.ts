import type { NewsArticle, NewsCategoryId, NewsPoint } from "@/lib/observatorio/content";
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
  featured: boolean;
  published: boolean;
};

export function mapNewsArticle(row: NewsRecord): NewsArticle {
  const eventDetails = parsePoints(row.eventDetailsJson);
  return {
    id: row.id,
    category: asCategory(row.category),
    categoryLabel: row.categoryLabel,
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
    image: row.imageSrc
      ? { src: row.imageSrc, alt: row.imageAlt || row.title }
      : undefined,
  };
}

const STATIC_NEWS = {
  lead: LEAD_ARTICLE,
  articles: SECONDARY_ARTICLES,
};

export async function getNews() {
  try {
    const prisma = await getPrisma();
    const rows = await prisma.newsArticle.findMany({
      where: { published: true },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
    });
    if (rows.length === 0) return STATIC_NEWS;

    const mapped = rows.map(mapNewsArticle);
    const lead = mapped[0];
    return {
      lead,
      articles: mapped.slice(1),
    };
  } catch {
    return STATIC_NEWS;
  }
}

export async function getAdminNews() {
  const prisma = await getPrisma();
  return prisma.newsArticle.findMany({
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
  });
}
