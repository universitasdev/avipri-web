import { faCalendarDays, faCity, faFilePdf } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CATEGORY_STYLES } from "@/components/observatorio/categoryStyles";
import type { NewsArticle } from "@/lib/observatorio/content";

export function LeadArticle({ article }: { article: NewsArticle }) {
  const category = CATEGORY_STYLES[article.category];

  return (
    <article className="mb-12 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-md transition-all hover:shadow-lg">
      <div className="grid grid-cols-1 gap-0 lg:grid-cols-12">
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

        <div className="flex flex-col justify-between p-8 sm:p-10 lg:col-span-7">
          <div>
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

            <div className="mb-6 space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              {article.points.map((point) => (
                <p key={point.title}>
                  <strong>• {point.title}:</strong> {point.body}
                </p>
              ))}
            </div>
          </div>

          <div>
            <a
              href={article.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-terracotta px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-orange-800"
            >
              <FontAwesomeIcon icon={faFilePdf} />
              {article.cta} ➔
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
