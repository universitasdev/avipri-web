import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import type { NewsReactionValue } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import type { NewsStats } from "@/lib/observatorio/content";

/** Cookie anónima que identifica al navegador del lector para que vote una sola vez por noticia. */
const VISITOR_COOKIE = "pdul_lector";
const VISITOR_MAX_AGE = 60 * 60 * 24 * 365 * 2;

export type NewsReaction = "like" | "dislike" | null;

export type NewsEngagement = NewsStats & { reaction: NewsReaction };

const TO_DB: Record<Exclude<NewsReaction, null>, NewsReactionValue> = {
  like: "LIKE",
  dislike: "DISLIKE",
};

/** Id del lector; si no tiene, se crea (solo en rutas que pueden escribir cookies). */
export async function getVisitorId({ create }: { create: boolean }) {
  const jar = await cookies();
  const current = jar.get(VISITOR_COOKIE)?.value;
  if (current && /^[0-9a-f-]{36}$/.test(current)) return current;
  if (!create) return null;

  const id = randomUUID();
  jar.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: VISITOR_MAX_AGE,
  });
  return id;
}

async function findPublished(slug: string) {
  const prisma = await getPrisma();
  return prisma.newsArticle.findFirst({
    where: { slug, published: true },
    select: { id: true, viewCount: true, likeCount: true, dislikeCount: true },
  });
}

async function readEngagement(
  article: { id: string; viewCount: number; likeCount: number; dislikeCount: number },
  visitorId: string | null,
): Promise<NewsEngagement> {
  const prisma = await getPrisma();
  const mine = visitorId
    ? await prisma.newsReaction.findUnique({
        where: { articleId_visitorId: { articleId: article.id, visitorId } },
        select: { value: true },
      })
    : null;
  return {
    views: article.viewCount,
    likes: article.likeCount,
    dislikes: article.dislikeCount,
    reaction: mine ? (mine.value === "LIKE" ? "like" : "dislike") : null,
  };
}

/** Vistas, votos y el voto de este lector. `countView` suma una vista. */
export async function getEngagement(slug: string, { countView }: { countView: boolean }) {
  const article = await findPublished(slug);
  if (!article) return null;

  const prisma = await getPrisma();
  const current = countView
    ? await prisma.newsArticle.update({
        where: { id: article.id },
        data: { viewCount: { increment: 1 } },
        select: { id: true, viewCount: true, likeCount: true, dislikeCount: true },
      })
    : article;
  return readEngagement(current, await getVisitorId({ create: false }));
}

/** Guarda (o quita, con null) el voto del lector y recalcula los totales de la noticia. */
export async function setReaction(slug: string, reaction: NewsReaction) {
  const article = await findPublished(slug);
  if (!article) return null;

  const visitorId = await getVisitorId({ create: true });
  if (!visitorId) return null;
  const key = { articleId_visitorId: { articleId: article.id, visitorId } };

  const prisma = await getPrisma();
  const updated = await prisma.$transaction(async (tx) => {
    if (reaction) {
      await tx.newsReaction.upsert({
        where: key,
        create: { articleId: article.id, visitorId, value: TO_DB[reaction] },
        update: { value: TO_DB[reaction] },
      });
    } else {
      await tx.newsReaction.deleteMany({ where: { articleId: article.id, visitorId } });
    }
    // Se cuentan de nuevo en vez de sumar y restar, para que los totales nunca se descuadren.
    const [likeCount, dislikeCount] = await Promise.all([
      tx.newsReaction.count({ where: { articleId: article.id, value: "LIKE" } }),
      tx.newsReaction.count({ where: { articleId: article.id, value: "DISLIKE" } }),
    ]);
    return tx.newsArticle.update({
      where: { id: article.id },
      data: { likeCount, dislikeCount },
      select: { id: true, viewCount: true, likeCount: true, dislikeCount: true },
    });
  });

  return { views: updated.viewCount, likes: updated.likeCount, dislikes: updated.dislikeCount, reaction };
}
