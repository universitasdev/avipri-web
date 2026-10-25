import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsArticleView } from "@/components/observatorio/NewsArticleView";
import { getNewsBySlug, getRelatedNews } from "@/lib/observatorio/getNews";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) return { title: "Noticia no encontrada" };

  const cover = article.image?.src ?? article.video?.poster;
  return {
    title: article.title,
    description: article.subtitle,
    openGraph: {
      type: "article",
      title: article.title,
      description: article.subtitle,
      publishedTime: article.isoDate,
      images: cover ? [{ url: cover }] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedNews(article);
  return <NewsArticleView article={article} related={related} />;
}
