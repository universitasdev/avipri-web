import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  faArrowLeft,
  faArrowRight,
  faArrowUpRightFromSquare,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CATEGORY_STYLES } from "@/components/observatorio/categoryStyles";
import { NewsCard } from "@/components/observatorio/NewsCard";
import { NewsVideoPlayer } from "@/components/observatorio/NewsVideoPlayer";
import type { NewsPoint } from "@/lib/observatorio/content";
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

function PointsBlock({ label, points }: { label?: string; points: NewsPoint[] }) {
  return (
    <section className="mt-8 rounded-xl border border-slate-100 bg-slate-50 p-5 sm:p-6">
      {label ? (
        <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</h2>
      ) : null}
      <ul className="space-y-4">
        {points.map((point) => (
          <li key={point.title} className="leading-relaxed text-slate-700">
            <strong className="block font-serif text-lg font-bold text-brand-navy">
              {point.title}
            </strong>
            {point.body}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedNews(article);
  const category = CATEGORY_STYLES[article.category];
  const paragraphs = (article.lead ?? "")
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter(Boolean);

  return (
    <>
      <header className="legal-scaffold pt-10 pb-28 text-white lg:pb-32">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <nav aria-label="Ruta" className="text-sm text-white/70">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true">
                <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
              </li>
              <li>
                <Link href="/observatorio" className="hover:text-white">
                  Observatorio
                </Link>
              </li>
              <li aria-hidden="true">
                <FontAwesomeIcon icon={faChevronRight} className="text-[10px]" />
              </li>
              <li aria-current="page" className="font-semibold text-white">
                {article.categoryLabel}
              </li>
            </ol>
          </nav>
          <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/80">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold text-brand-navy">
              <FontAwesomeIcon icon={category.icon} />
              {article.categoryLabel}
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={article.isoDate}>{article.date}</time>
          </p>
          <h1 className="mt-5 font-serif text-3xl leading-tight font-bold sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/85">{article.subtitle}</p>
        </div>
      </header>

      <article className="relative z-10 mx-auto -mt-20 max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
        {article.video ? (
          <figure className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <NewsVideoPlayer video={article.video} />
            {article.video.title !== article.title ? (
              <figcaption className="px-5 py-3 text-sm text-slate-500">{article.video.title}</figcaption>
            ) : null}
          </figure>
        ) : article.image ? (
          <figure className="overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="relative aspect-[16/9] bg-slate-100">
              <Image
                src={article.image.src}
                alt={article.image.alt}
                fill
                priority
                sizes="(min-width: 896px) 864px, 100vw"
                className="object-cover"
              />
            </div>
            <figcaption className="px-5 py-3 text-sm text-slate-500">{article.image.alt}</figcaption>
          </figure>
        ) : null}

        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm sm:p-10">
          {paragraphs.length > 0 ? (
            <div className="space-y-5 text-base leading-relaxed text-slate-700 sm:text-lg">
              {paragraphs.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          ) : null}

          {article.points.length > 0 ? (
            <PointsBlock label={article.pointsLabel} points={article.points} />
          ) : null}

          {article.eventDetails ? (
            <PointsBlock label={article.eventDetailsLabel} points={article.eventDetails} />
          ) : null}

          {article.cta && article.href ? (
            <a
              href={article.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand-terracotta px-5 font-semibold text-white transition-colors hover:bg-orange-800"
            >
              {article.cta}
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-sm" />
              <span className="sr-only">(se abre en otra pestaña)</span>
            </a>
          ) : null}
        </div>

        <Link
          href="/observatorio"
          className="inline-flex items-center gap-2 text-sm font-semibold text-brand-navy hover:text-brand-terracotta"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
          Volver al Observatorio
        </Link>
      </article>

      {related.length > 0 ? (
        <section
          aria-labelledby="mas-noticias"
          className="mx-auto max-w-7xl px-4 pt-16 pb-24 sm:px-6 lg:px-8 lg:pt-20"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="mas-noticias" className="font-serif text-3xl font-bold text-brand-navy">
              Más noticias
            </h2>
            <Link
              href="/observatorio"
              className="inline-flex items-center gap-1.5 font-semibold text-brand-terracotta hover:underline"
            >
              Ver todas
              <FontAwesomeIcon icon={faArrowRight} />
            </Link>
          </div>
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.slug}>
                <NewsCard article={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
