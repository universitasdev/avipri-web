import { faCalendarDays, faCity } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import { CATEGORY_STYLES } from "@/components/observatorio/categoryStyles";
import type { NewsArticle } from "@/lib/observatorio/content";

export function LeadArticle({ article }: { article: NewsArticle }) {
  const category = CATEGORY_STYLES[article.category];

  return (
    <article className="mb-12 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-md transition-all hover:shadow-lg">
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-12">
        {article.image ? (
          <div className="relative min-h-[280px] overflow-hidden sm:min-h-[360px] lg:col-span-5 lg:min-h-full">
            <Image
              src={article.image.src}
              alt={article.image.alt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 42vw"
              priority
            />
          </div>
        ) : (
          <div className="legal-scaffold relative flex min-h-[280px] items-center justify-center overflow-hidden p-8 lg:col-span-5">
            <div className="relative z-10 text-center">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full border border-brand-terracotta/40 bg-brand-terracotta/20 text-3xl text-brand-orange">
                <FontAwesomeIcon icon={faCity} />
              </div>
              <span className="block text-xs font-semibold uppercase tracking-widest text-white/70">
                Especial Barquisimeto
              </span>
            </div>
          </div>
        )}

        <div className="p-8 sm:p-10 lg:col-span-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${category.chip}`}
            >
              <FontAwesomeIcon icon={category.icon} />
              {article.categoryLabel}
            </span>
            <span className="text-xs font-medium text-slate-400">
              <FontAwesomeIcon icon={faCalendarDays} className="mr-1" />
              {article.date}
            </span>
          </div>

          <h2 className="mb-3 font-serif text-2xl font-bold leading-snug text-brand-navy sm:text-3xl">
            {article.title}
          </h2>
          <p className="mb-4 text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
            {article.subtitle}
          </p>
          {article.lead ? (
            <p className="mb-6 text-sm leading-relaxed text-slate-600 sm:text-base">
              {article.lead}
            </p>
          ) : null}

          <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {article.points.map((point) => (
              <p key={point.title}>
                <strong>• {point.title}:</strong> {point.body}
              </p>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}
