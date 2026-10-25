"use client";

import { useSyncExternalStore } from "react";
import {
  faArrowUpRightFromSquare,
  faDownload,
  faFilePdf,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NewsAttachment } from "@/lib/observatorio/content";
import { formatBytes } from "@/lib/format";

const noSubscription = () => () => {};

/**
 * Ficha del PDF adjunto (adaptada de VisorDocumento y VistaPdf de PDUL YA): nombre, peso,
 * botones para abrir o descargar y, en escritorio, vista previa dentro de la página si el
 * navegador tiene visor de PDF. Si no lo tiene, no se deja un recuadro vacío.
 */
export function NewsDocument({ attachment }: { attachment: NewsAttachment }) {
  const canPreview = useSyncExternalStore(
    noSubscription,
    () => navigator.pdfViewerEnabled === true,
    () => false,
  );
  const button =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-5 font-semibold transition-[background-color,transform] duration-150 active:scale-[0.97]";

  return (
    <section
      aria-labelledby="documento-adjunto"
      className="overflow-hidden rounded-2xl border border-brand-border bg-white shadow-sm"
    >
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand-terracotta/10 text-2xl text-brand-terracotta">
            <FontAwesomeIcon icon={faFilePdf} />
          </span>
          <div>
            <h2
              id="documento-adjunto"
              className="font-serif text-xl leading-snug font-bold text-brand-navy"
            >
              {attachment.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500">PDF · {formatBytes(attachment.bytes)}</p>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <a
            href={attachment.src}
            target="_blank"
            rel="noopener noreferrer"
            className={`${button} bg-brand-navy text-white hover:bg-brand-text`}
          >
            <FontAwesomeIcon icon={faArrowUpRightFromSquare} className="text-sm" />
            Abrir
            <span className="sr-only">(se abre en otra pestaña)</span>
          </a>
          <a
            href={attachment.src}
            download
            className={`${button} border border-brand-border text-brand-navy hover:bg-slate-50`}
          >
            <FontAwesomeIcon icon={faDownload} className="text-sm" />
            Descargar
          </a>
        </div>
      </div>
      {canPreview ? (
        <iframe
          src={`${attachment.src}#view=FitH`}
          title={`Vista previa de ${attachment.name}`}
          className="hidden h-[80vh] max-h-[56rem] w-full border-t border-brand-border bg-slate-50 lg:block"
        />
      ) : null}
    </section>
  );
}
