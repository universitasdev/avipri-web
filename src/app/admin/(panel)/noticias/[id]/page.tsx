import { Suspense } from "react";
import { notFound } from "next/navigation";
import { NewsForm } from "@/components/admin/NewsForm";
import { getPrisma } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditNewsPage({ params }: PageProps) {
  const { id } = await params;
  const prisma = await getPrisma();
  const article = await prisma.newsArticle.findUnique({ where: { id } });
  if (!article) notFound();

  return (
    <Suspense fallback={<p className="text-sm text-brand-muted">Cargando noticia…</p>}>
      <NewsForm
        article={{
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
        }}
      />
    </Suspense>
  );
}
