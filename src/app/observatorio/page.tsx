import type { Metadata } from "next";
import { LeadArticle } from "@/components/observatorio/LeadArticle";
import { NewsGrid } from "@/components/observatorio/NewsGrid";
import { ObservatorioHero } from "@/components/observatorio/ObservatorioHero";
import { LEAD_ARTICLE, SECONDARY_ARTICLES } from "@/lib/observatorio/content";

export const metadata: Metadata = {
  title: "Observatorio y noticias | PDUL Iribarren",
  description:
    "Noticias, análisis de coyuntura y reportes de avance del PDUL Iribarren 2026–2046: monitoreo técnico, impacto jurídico, ingeniería municipal y convocatorias de Aula Ciudad.",
};

export default function ObservatorioPage() {
  return (
    <div className="urban-pattern">
      <ObservatorioHero />
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <LeadArticle article={LEAD_ARTICLE} />
        <NewsGrid articles={SECONDARY_ARTICLES} />
      </section>
    </div>
  );
}
