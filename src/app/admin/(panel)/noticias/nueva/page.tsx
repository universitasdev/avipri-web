import { Suspense } from "react";
import { NewsForm } from "@/components/admin/NewsForm";
import { canFeatureArticle } from "@/lib/auth/permissions";
import { getCurrentAdmin } from "@/lib/auth/session";

export default async function NewNewsPage() {
  const admin = await getCurrentAdmin();

  return (
    <Suspense fallback={<p className="text-sm text-brand-muted">Cargando formulario…</p>}>
      <NewsForm
        today={new Date().toISOString().slice(0, 10)}
        canFeature={admin ? canFeatureArticle(admin) : false}
      />
    </Suspense>
  );
}
