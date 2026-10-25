import type { Metadata } from "next";
import { NewsMosaic } from "@/components/observatorio/NewsMosaic";
import { ObservatorioHero } from "@/components/observatorio/ObservatorioHero";
import { getNews } from "@/lib/observatorio/getNews";

export const metadata: Metadata = {
  title: "Observatorio y noticias",
  description:
    "Noticias, análisis de coyuntura y reportes de avance del PDUL Iribarren 2026–2046: monitoreo técnico, impacto jurídico, ingeniería municipal y convocatorias de Aula Ciudad.",
};

export default async function ObservatorioPage() {
  const articles = await getNews();

  return (
    <div className="urban-pattern">
      <ObservatorioHero />
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <p className="mb-5 text-sm text-brand-muted">
          {articles.length === 1 ? "1 noticia" : `${articles.length} noticias`}
        </p>
        <NewsMosaic articles={articles} />
      </section>
    </div>
  );
}
