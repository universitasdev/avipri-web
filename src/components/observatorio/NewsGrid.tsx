import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CATEGORY_STYLES } from "@/components/observatorio/categoryStyles";
import type { NewsArticle, NewsPoint } from "@/lib/observatorio/content";

function PointsBox({
  label,
  points,
}: {
  label?: string;
  points: NewsPoint[];
}) {
  return (
    <div className="space-y-2.5 rounded-lg border border-slate-100 bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
      {label ? (
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
      ) : null}
      {points.map((point) => (
        <p key={point.title}>
          <strong className="text-slate-700">• {point.title}:</strong>{" "}
          {point.body}
        </p>
      ))}
    </div>
  );
}

export function NewsGrid({ articles }: { articles: NewsArticle[] }) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
      {articles.map((article) => {
        const category = CATEGORY_STYLES[article.category];

        return (
          <article
            key={article.id}
            className="flex h-full flex-col overflow-hidden rounded-xl border border-brand-border bg-white shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex flex-1 flex-col p-6">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${category.chip}`}
                >
                  <FontAwesomeIcon icon={category.icon} />
                  {article.categoryLabel}
                </span>
                <span className="shrink-0 text-xs text-slate-400">
                  {article.dateShort}
                </span>
              </div>
              <h3 className="mb-2 font-serif text-xl font-bold leading-snug text-brand-navy">
                {article.title}
              </h3>
              <p className="mb-3 text-sm font-medium leading-relaxed text-slate-600">
                {article.subtitle}
              </p>
              {article.lead ? (
                <p className="mb-4 text-sm leading-relaxed text-slate-600">
                  {article.lead}
                </p>
              ) : null}
              <div className="space-y-3">
                <PointsBox label={article.pointsLabel} points={article.points} />
                {article.eventDetails ? (
                  <PointsBox
                    label={article.eventDetailsLabel}
                    points={article.eventDetails}
                  />
                ) : null}
              </div>
            </div>
            <div className="px-6 pb-6 pt-0">
              <a
                href={article.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-terracotta hover:text-orange-800"
              >
                {article.cta} ➔
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
