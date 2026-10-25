import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { NewsForm } from "@/components/admin/NewsForm";
import { canEditArticle, canFeatureArticle } from "@/lib/auth/permissions";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getPrisma } from "@/lib/db";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditNewsPage({ params }: PageProps) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const prisma = await getPrisma();
  const article = await prisma.newsArticle.findUnique({
    where: { id },
    include: { images: { orderBy: { position: "asc" } } },
  });
  if (!article) notFound();
  if (!canEditArticle(admin, article)) redirect("/admin/noticias");

  return (
    <Suspense fallback={<p className="text-sm text-brand-muted">Cargando noticia…</p>}>
      <NewsForm
        canFeature={canFeatureArticle(admin)}
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
          mediaType: article.mediaType,
          videoYoutubeId: article.videoYoutubeId,
          videoFileSrc: article.videoFileSrc,
          images: article.images.map((image) => ({ src: image.src, alt: image.alt })),
          attachmentSrc: article.attachmentSrc,
          attachmentName: article.attachmentName,
          attachmentBytes: article.attachmentBytes,
          featured: article.featured,
          published: article.published,
        }}
      />
    </Suspense>
  );
}
