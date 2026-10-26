import type { Metadata } from "next";
import Link from "next/link";
import { faHashtag, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NewsMosaic } from "@/components/observatorio/NewsMosaic";
import { ObservatorioHero } from "@/components/observatorio/ObservatorioHero";
import { getNews, getPublicCategories, getTagName } from "@/lib/observatorio/getNews";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Observatorio y noticias",
  description:
    "Noticias, análisis de coyuntura y reportes de avance del PDUL Iribarren 2026–2046: monitoreo técnico, impacto jurídico, ingeniería municipal y convocatorias de Aula Ciudad.",
};

type PageProps = { searchParams: Promise<{ categoria?: string; etiqueta?: string }> };

const chip =
  "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors";

export default async function ObservatorioPage({ searchParams }: PageProps) {
  const { categoria, etiqueta } = await searchParams;
  const [articles, categories, tagName] = await Promise.all([
    getNews({ category: categoria, tag: etiqueta }),
    getPublicCategories(),
    etiqueta ? getTagName(etiqueta) : Promise.resolve(null),
  ]);
  const total = categories.reduce((sum, category) => sum + category.count, 0);

  return (
    <div className="urban-pattern">
      <ObservatorioHero />
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        {categories.length > 1 ? (
          <nav aria-label="Filtrar por categoría" className="mb-6">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link
                  href="/observatorio"
                  aria-current={!categoria && !etiqueta ? "page" : undefined}
                  className={cn(
                    chip,
                    !categoria && !etiqueta
                      ? "border-brand-navy bg-brand-navy text-white"
                      : "border-brand-border bg-white text-brand-navy hover:border-brand-navy",
                  )}
                >
                  Todas
                  <span className="text-xs opacity-75">{total}</span>
                </Link>
              </li>
              {categories.map((category) => {
                const active = category.slug === categoria;
                return (
                  <li key={category.slug}>
                    <Link
                      href={`/observatorio?categoria=${category.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        chip,
                        active
                          ? "border-brand-navy bg-brand-navy text-white"
                          : "border-brand-border bg-white text-brand-navy hover:border-brand-navy",
                      )}
                    >
                      {category.name}
                      <span className="text-xs opacity-75">{category.count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}

        {etiqueta ? (
          <p className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-brand-border bg-white px-5 py-4 text-base text-brand-navy">
            <span>
              Noticias con la etiqueta{" "}
              <strong className="inline-flex items-center gap-1">
                <FontAwesomeIcon icon={faHashtag} className="text-sm" />
                {tagName ?? etiqueta}
              </strong>
            </span>
            <Link
              href="/observatorio"
              className="inline-flex items-center gap-1.5 font-semibold text-brand-terracotta hover:underline"
            >
              <FontAwesomeIcon icon={faXmark} />
              Ver todas
            </Link>
          </p>
        ) : null}

        <p className="mb-5 text-sm text-brand-muted">
          {articles.length === 1 ? "1 noticia" : `${articles.length} noticias`}
        </p>
        <NewsMosaic articles={articles} />
      </section>
    </div>
  );
}
