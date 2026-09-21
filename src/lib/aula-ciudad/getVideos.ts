import { getPrisma } from "@/lib/db";
import { VIDEOS, type VideoItem } from "@/lib/aula-ciudad/content";

export async function getVideos(): Promise<VideoItem[]> {
  try {
    const prisma = await getPrisma();
    const rows = await prisma.video.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
    if (rows.length === 0) return VIDEOS;

    return rows.map((row) => ({
      id: row.youtubeId,
      badge: row.badge,
      title: row.title,
      body: row.body,
      href: row.href,
      thumbnail: row.thumbnail ?? undefined,
      publishedAt: row.publishedAt?.toISOString(),
    }));
  } catch {
    return VIDEOS;
  }
}

export async function getAdminVideos() {
  const prisma = await getPrisma();
  return prisma.video.findMany({
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
}
