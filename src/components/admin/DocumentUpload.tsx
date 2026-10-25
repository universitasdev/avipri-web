"use client";

import { useRef, useState } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { uploadDirect } from "@/components/admin/direct-upload";
import { formatBytes } from "@/lib/format";

export const DOCUMENT_MAX_BYTES = 20 * 1024 * 1024;

/** PDF adjunto: ya guardado (src) o recién elegido (file). */
export type NewsDocumentDraft = {
  src?: string;
  file?: File;
  name: string;
  bytes: number;
};

/** Sube el PDF: directo a Cloud Storage con URL firmada, o al servidor en local. */
export function uploadNewsDocument(file: File, onProgress: (percent: number) => void) {
  return uploadDirect("/api/admin/uploads/document", file, "application/pdf", onProgress);
}

export function DocumentUpload({
  value,
  onChange,
}: {
  value: NewsDocumentDraft | null;
  onChange: (value: NewsDocumentDraft | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (!file) return;
          const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
          if (!isPdf) {
            setLocalError("Solo se admiten archivos PDF.");
            return;
          }
          if (file.size > DOCUMENT_MAX_BYTES) {
            setLocalError("El PDF no puede superar 20 MB.");
            return;
          }
          setLocalError(null);
          onChange({ file, name: file.name.replace(/\.pdf$/i, ""), bytes: file.size });
        }}
      />

      {value ? (
        <div className="flex items-start gap-3 rounded-lg border border-brand-border bg-white p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-terracotta/10 text-brand-terracotta">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <Input
              value={value.name}
              onChange={(event) => onChange({ ...value, name: event.target.value })}
              maxLength={200}
              aria-label="Nombre del documento"
              placeholder="Nombre que verá el público"
            />
            <p className="text-xs text-brand-muted">
              PDF · {formatBytes(value.bytes)}
              {value.file ? " · Se sube al guardar la noticia." : ""}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-brand-border bg-slate-50 text-sm text-brand-muted">
          <FileText className="h-6 w-6" />
          Sin documento adjunto
        </div>
      )}
      {localError ? <p className="text-xs text-red-700">{localError}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          {value ? "Cambiar PDF" : "Subir PDF"}
        </Button>
        {value ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-700"
            onClick={() => {
              onChange(null);
              setLocalError(null);
            }}
          >
            Quitar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
