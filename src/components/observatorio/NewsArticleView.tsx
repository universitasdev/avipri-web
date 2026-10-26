import Image from "next/image";
import Link from "next/link";
import {
  faArrowLeft,
  faArrowRight,
  faArrowUpRightFromSquare,
  faBookOpenReader,
  faChevronRight,
  faHashtag,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { categoryStyle } from "@/components/observatorio/categoryStyles";
import { NewsCard } from "@/components/observatorio/NewsCard";
import { NewsDocument } from "@/components/observatorio/NewsDocument";
import { NewsEngagementBar } from "@/components/observatorio/NewsEngagementBar";
import { NewsGallery } from "@/components/observatorio/NewsGallery";
import { NewsVideoPlayer } from "@/components/observatorio/NewsVideoPlayer";
import type { NewsArticle, NewsPoint } from "@/lib/observatorio/content";
import { plainTextToHtml } from "@/lib/observatorio/plain-text";

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

/** Bloque de una reseña: el artículo completo está en la web de la revista. */
function ExternalReview({ external }: { external: NonNullable<NewsArticle["external"]> }) {
  return (
    <section
      aria-labelledby="resena-externa"
      className="flex flex-col gap-5 rounded-2xl border-2 border-brand-orange/40 bg-amber-50 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white text-2xl text-brand-terracotta shadow-sm">
          <FontAwesomeIcon icon={faBookOpenReader} />
        </span>
        <div>
          <h2 id="resena-externa" className="font-serif text-xl font-bold text-brand-navy">
            Reseña de un artículo publicado en {external.source}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            El artículo completo está en la web de la revista.
          </p>
        </div>
      </div>
      <a
        href={external.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-terracotta px-5 font-semibold text-white transition-colors hover:bg-orange-800"
      >
        Leer el artículo completo
        <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-sm" />
        <span className="sr-only">(se abre en otra pestaña)</span>
      </a>
    </section>
  );
}

/**
 * Página completa de una noticia. La usan el sitio público (/observatorio/<slug>) y la vista
 * previa del panel, para que lo que se revisa antes de publicar sea exactamente lo que se verá.
 * `engagement` muestra vistas y «Me gusta»; solo en el sitio público, no en la vista previa.
 */
export function NewsArticleView({
  article,
  related = [],
  engagement = false,
}: {
  article: NewsArticle;
  related?: NewsArticle[];
  engagement?: boolean;
}) {
  const category = categoryStyle(article.category);
  // HTML ya saneado en el servidor (o el del editor, en la vista previa del formulario).
  const bodyHtml = article.bodyHtml ?? plainTextToHtml(article.lead ?? "");
  const hasTags = Boolean(article.tags && article.tags.length > 0);
  const hasBody =
    Boolean(bodyHtml) ||
    article.points.length > 0 ||
    Boolean(article.eventDetails) ||
    Boolean(article.cta && article.href);

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
            <Link
              href={`/observatorio?categoria=${article.category.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold text-brand-navy hover:bg-amber-300"
            >
              <FontAwesomeIcon icon={category.icon} />
              {article.categoryLabel}
            </Link>
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
        ) : (article.images?.length ?? 0) >= 2 ? (
          <NewsGallery images={article.images!} title={article.title} />
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

        {article.external ? <ExternalReview external={article.external} /> : null}

        {hasBody || hasTags ? (
        <div className="rounded-2xl border border-brand-border bg-white p-6 shadow-sm sm:p-10">
          {bodyHtml ? (
            <div
              className="news-rich-text text-base leading-relaxed text-slate-700 sm:text-lg"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
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

          {hasTags ? (
            <div className={hasBody ? "mt-8 border-t border-brand-border pt-6" : undefined}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Etiquetas</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {article.tags!.map((tag) => (
                  <li key={tag.slug}>
                    <Link
                      href={`/observatorio?etiqueta=${tag.slug}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-brand-border bg-slate-50 px-3 py-1.5 text-sm text-brand-navy transition-colors hover:border-brand-terracotta hover:text-brand-terracotta"
                    >
                      <FontAwesomeIcon icon={faHashtag} className="text-xs" />
                      {tag.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        ) : null}

        {article.attachment ? <NewsDocument attachment={article.attachment} /> : null}

        {engagement && article.stats ? (
          <NewsEngagementBar slug={article.slug} initial={article.stats} />
        ) : null}

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
      ) : (
        <div className="pb-24" />
      )}
    </>
  );
}
