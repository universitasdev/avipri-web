import Image from "next/image";
import Link from "next/link";
import { faVideo } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CATEGORY_STYLES } from "@/components/observatorio/categoryStyles";
import type { NewsArticle } from "@/lib/observatorio/content";

/** Tarjeta uniforme para "Más noticias"; el listado usa el mosaico. */
export function NewsCard({ article }: { article: NewsArticle }) {
  const category = CATEGORY_STYLES[article.category];
  const cover = article.image?.src ?? article.video?.poster;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-lg">
      <div className="legal-scaffold relative aspect-[16/10] shrink-0 overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={article.image?.alt ?? ""}
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <FontAwesomeIcon
            icon={category.icon}
            aria-hidden="true"
            className="absolute -right-4 -bottom-6 !h-36 !w-36 text-white/10"
          />
        )}
        {article.video ? (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-brand-navy/80 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <FontAwesomeIcon icon={faVideo} />
            Video
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-semibold ${category.chip}`}
          >
            <FontAwesomeIcon icon={category.icon} />
            {article.categoryLabel}
          </span>
          <time dateTime={article.isoDate}>{article.dateShort}</time>
        </p>
        <h3 className="mt-3 line-clamp-3 font-serif text-xl font-bold leading-snug text-brand-navy">
          <Link
            href={`/observatorio/${article.slug}`}
            className="after:absolute after:inset-0 group-hover:text-brand-terracotta"
          >
            {article.title}
          </Link>
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
          {article.subtitle}
        </p>
      </div>
    </article>
  );
}
