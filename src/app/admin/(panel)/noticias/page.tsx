import { Suspense } from "react";
import { redirect } from "next/navigation";
import { NewsManager } from "@/components/admin/NewsManager";
import { canEditArticle } from "@/lib/auth/permissions";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getAdminNewsPage, parseAdminNewsFilter } from "@/lib/admin/news-list";
import { getPrisma } from "@/lib/db";

type PageProps = {
  searchParams: Promise<{ ver?: string; autor?: string; pagina?: string; id?: string }>;
};

export default async function AdminNewsPage({ searchParams }: PageProps) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const params = await searchParams;
  const filter = parseAdminNewsFilter(params);
  const list = await getAdminNewsPage(filter);

  // Noticia recién publicada o guardada: se busca aparte porque puede no estar en esta página.
  const prisma = await getPrisma();
  const outcomeArticle = params.id
    ? await prisma.newsArticle.findUnique({
        where: { id: params.id },
        select: { id: true, slug: true, title: true, published: true },
      })
    : null;

  const articles = list.rows.map((article) => ({
    id: article.id,
    slug: article.slug,
    categoryId: article.categoryId,
    categoryName: article.category.name,
    tags: article.tags.map(({ tag }) => tag.name),
    externalSource: article.externalSource,
    externalUrl: article.externalUrl,
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
    authorName: article.createdBy?.name ?? null,
    canEdit: canEditArticle(admin, article),
  }));

  return (
    <Suspense fallback={<p className="text-sm text-brand-muted">Cargando noticias…</p>}>
      <NewsManager
        articles={articles}
        outcomeArticle={outcomeArticle}
        filter={{ ...filter, page: list.page }}
        pageCount={list.pageCount}
        matching={list.matching}
        counts={list.counts}
        authors={list.authors}
        currentUserId={admin.id}
      />
    </Suspense>
  );
}
