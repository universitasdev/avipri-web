import { Suspense } from "react";
import { NewsForm } from "@/components/admin/NewsForm";

export default function NewNewsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-brand-muted">Cargando formulario…</p>}>
      <NewsForm today={new Date().toISOString().slice(0, 10)} />
    </Suspense>
  );
}
