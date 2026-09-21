import { Suspense } from "react";
import { NewsManager } from "@/components/admin/NewsManager";
import { getAdminNews } from "@/lib/observatorio/getNews";

export default async function AdminNewsPage() {
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
    featured: article.featured,
    published: article.published,
  }));

  return (
    <Suspense fallback={<p className="text-sm text-brand-muted">Cargando noticias…</p>}>
      <NewsManager articles={articles} />
    </Suspense>
  );
}
