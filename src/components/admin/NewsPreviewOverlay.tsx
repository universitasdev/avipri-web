"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { NewsArticleView } from "@/components/observatorio/NewsArticleView";
import type { NewsArticle } from "@/lib/observatorio/content";

/**
 * Vista previa a pantalla completa con lo que hay en el formulario, sin guardar nada.
 * Usa el mismo componente que la página pública, así que lo que se ve es lo que se publicará.
 */
export function NewsPreviewOverlay({
  article,
  onClose,
}: {
  article: NewsArticle;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const html = document.documentElement;
    const previous = { fontSize: html.style.fontSize, overflow: html.style.overflow };
    // El panel agranda la letra; la vista previa se muestra al tamaño real del sitio.
    html.style.fontSize = "100%";
    html.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      html.style.fontSize = previous.fontSize;
      html.style.overflow = previous.overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  // Los enlaces internos sacarían a la persona del formulario y perdería lo escrito.
  function blockInternalLinks(event: MouseEvent<HTMLDivElement>) {
    const link = (event.target as HTMLElement).closest("a");
    if (link && link.target !== "_blank") event.preventDefault();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Vista previa de la noticia"
      className="fixed inset-0 z-[60] flex flex-col bg-brand-bone"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-brand-orange bg-white px-4 py-3 shadow-md sm:px-6">
        <p className="flex items-center gap-2 text-base font-semibold text-brand-navy">
          <Eye className="size-5 text-brand-terracotta" aria-hidden="true" />
          Vista previa · así se verá en el sitio. Todavía no está guardada.
        </p>
        <Button ref={closeRef} size="lg" onClick={onClose} className="text-base">
          <ArrowLeft aria-hidden="true" />
          Volver a editar
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto" onClickCapture={blockInternalLinks}>
        <NewsArticleView article={article} />
      </div>
    </div>
  );
}
