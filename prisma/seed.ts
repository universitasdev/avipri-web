import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";
import { LEAD_ARTICLE, SECONDARY_ARTICLES, type NewsArticle } from "../src/lib/observatorio/content";
import { VIDEOS } from "../src/lib/aula-ciudad/content";
import { DEFAULT_THERMOMETER } from "../src/lib/thermometer/steps";

const prisma = new PrismaClient();

const NEWS_DATES: Record<string, string> = {
  "decreto-inicio-pdul": "2026-09-14T12:00:00.000Z",
  "sentencia-928-tsj": "2026-09-08T12:00:00.000Z",
  "microzonificacion-sismica": "2026-09-04T12:00:00.000Z",
  "antifragilidad-aula-ciudad": "2026-09-12T12:00:00.000Z",
};

function serializeArticle(article: NewsArticle, featured: boolean) {
  return {
    id: article.id,
    slug: article.slug,
    // Las categorías las crea la migración; aquí se enlazan por su slug.
    category: { connect: { slug: article.category.slug } },
    publishedAt: new Date(NEWS_DATES[article.id] ?? "2026-09-01T12:00:00.000Z"),
    title: article.title,
    subtitle: article.subtitle,
    lead: article.lead ?? null,
    pointsLabel: article.pointsLabel ?? null,
    pointsJson: JSON.stringify(article.points),
    eventDetailsLabel: article.eventDetailsLabel ?? null,
    eventDetailsJson: article.eventDetails ? JSON.stringify(article.eventDetails) : null,
    cta: article.cta ?? null,
    href: article.href ?? null,
    imageAlt: article.image?.alt ?? null,
    featured,
    published: true,
  };
}

const STATIC_IMAGES = new Map(
  [LEAD_ARTICLE, ...SECONDARY_ARTICLES].map((article) => [article.id, article.image]),
);

function imagesOf(id: string) {
  const image = STATIC_IMAGES.get(id);
  return image ? [{ src: image.src, alt: image.alt, position: 0 }] : [];
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrador";

  if (!email || !password || password.length < 8) {
    throw new Error("Define ADMIN_EMAIL y ADMIN_PASSWORD (mínimo 8 caracteres) en .env");
  }

  const passwordHash = await hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    update: { name, passwordHash, role: "ADMIN", active: true },
    create: { email, name, passwordHash, role: "ADMIN" },
  });

  const articles = [serializeArticle(LEAD_ARTICLE, true), ...SECONDARY_ARTICLES.map((item) => serializeArticle(item, false))];
  for (const article of articles) {
    await prisma.newsArticle.upsert({
      where: { id: article.id },
      // Las fotos se recrean para que el seed deje siempre la misma galería.
      update: { ...article, images: { deleteMany: {}, create: imagesOf(article.id) } },
      create: { ...article, images: { create: imagesOf(article.id) } },
    });
  }

  for (const video of VIDEOS) {
    await prisma.video.upsert({
      where: { id: video.id },
      update: {
        youtubeId: video.id,
        badge: video.badge,
        title: video.title,
        body: video.body,
        href: video.href,
        thumbnail: video.thumbnail ?? null,
        published: true,
      },
      create: {
        id: video.id,
        youtubeId: video.id,
        badge: video.badge,
        title: video.title,
        body: video.body,
        href: video.href,
        thumbnail: video.thumbnail ?? null,
        published: true,
      },
    });
  }

  await prisma.thermometer.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      activeIndex: DEFAULT_THERMOMETER.activeIndex,
      activeTitle: DEFAULT_THERMOMETER.activeTitle,
      activeDescription: DEFAULT_THERMOMETER.activeDescription,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
