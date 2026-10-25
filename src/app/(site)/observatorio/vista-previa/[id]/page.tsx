import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { faArrowLeft, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NewsArticleView } from "@/components/observatorio/NewsArticleView";
import { canEditArticle } from "@/lib/auth/permissions";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getNewsForPreview } from "@/lib/observatorio/getNews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vista previa",
  robots: { index: false, follow: false },
};

type PageProps = { params: Promise<{ id: string }> };

/**
 * Vista previa de una noticia guardada (también borradores), con el diseño real del sitio.
 * Solo la ve quien puede editarla; para el resto no existe.
 */
export default async function NewsPreviewPage({ params }: PageProps) {
  const { id } = await params;
  const admin = await getCurrentAdmin();
  if (!admin) notFound();

  const preview = await getNewsForPreview(id);
  if (!preview || !canEditArticle(admin, preview.row)) notFound();

  return (
    <>
      <div className="sticky top-0 z-40 border-b-4 border-brand-orange bg-white px-4 py-3 shadow-md sm:px-6">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-base font-semibold text-brand-navy">
            <FontAwesomeIcon icon={faEye} className="text-brand-terracotta" />
            Vista previa ·{" "}
            {preview.row.published
              ? "así se ve en el sitio."
              : "es un borrador: el público todavía no la ve."}
          </p>
          <Link
            href={`/admin/noticias/${id}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-brand-navy px-5 font-semibold text-white hover:bg-brand-navy/90"
          >
            <FontAwesomeIcon icon={faArrowLeft} />
            Volver a editar
          </Link>
        </div>
      </div>
      <NewsArticleView article={preview.article} />
    </>
  );
}
