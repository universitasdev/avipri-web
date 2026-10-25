import { Suspense } from "react";
import { redirect } from "next/navigation";
import { NewsManager } from "@/components/admin/NewsManager";
import { canEditArticle } from "@/lib/auth/permissions";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getAdminNews } from "@/lib/observatorio/getNews";

export default async function AdminNewsPage() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const rows = await getAdminNews();
  const articles = rows.map((article) => ({
    id: article.id,
    category: article.category,
    categoryLabel: article.categoryLabel,
    publishedAt: article.publishedAt.toISOString(),
    title: article.title,
    subtitle: article.subtitle,
    lead: article.lead,
    pointsLabel: article.pointsLabel,
    pointsJson: article.pointsJson,
    eventDetailsLabel: article.eventDetailsLabel,
    eventDetailsJson: article.eventDetailsJson,
    cta: article.cta,
    href: article.href,
    imageSrc: article.imageSrc,
    imageAlt: article.imageAlt,
    mediaType: article.mediaType,
    videoYoutubeId: article.videoYoutubeId,
    videoFileSrc: article.videoFileSrc,
    featured: article.featured,
    published: article.published,
    authorName: article.createdBy?.name ?? null,
    canEdit: canEditArticle(admin, article),
  }));

  return (
    <Suspense fallback={<p className="text-sm text-brand-muted">Cargando noticias…</p>}>
      <NewsManager articles={articles} />
    </Suspense>
  );
}
