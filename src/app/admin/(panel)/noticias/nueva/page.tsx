import { Suspense } from "react";
import { NewsForm } from "@/components/admin/NewsForm";
import { canFeatureArticle } from "@/lib/auth/permissions";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getFormTaxonomy } from "@/lib/observatorio/taxonomy";

export default async function NewNewsPage() {
  const [admin, taxonomy] = await Promise.all([getCurrentAdmin(), getFormTaxonomy()]);

  return (
    <Suspense fallback={<p className="text-sm text-brand-muted">Cargando formulario…</p>}>
      <NewsForm
        userId={admin?.id ?? "sin-sesion"}
        today={new Date().toISOString().slice(0, 10)}
        canFeature={admin ? canFeatureArticle(admin) : false}
        categories={taxonomy.categories}
        tagSuggestions={taxonomy.tagSuggestions}
      />
    </Suspense>
  );
}
