"use client";

import { useRef, useState } from "react";
import { ImagePlus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { MIN_RECOMMENDED_WIDTH, prepareImage } from "@/components/admin/image-resize";

export function ImageUpload({ currentSrc }: { currentSrc?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cleared, setCleared] = useState(false);
  const [preview, setPreview] = useState(currentSrc ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  function revokeIfBlob(url: string) {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  }

  function applyFile(next: File) {
    revokeIfBlob(preview);
    setFile(next);
    setCleared(false);
    setPreview(URL.createObjectURL(next));
  }

  function clearImage() {
    if (inputRef.current) inputRef.current.value = "";
    revokeIfBlob(preview);
    setFile(null);
    setCleared(true);
    setPreview("");
    setLocalError(null);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="imageSrc" value={file || cleared ? "" : currentSrc ?? ""} />
      <input
        ref={inputRef}
        type="file"
        name="imageFile"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={async (event) => {
          const input = event.target;
          const original = input.files?.[0];
          if (!original) return;
          try {
            // Se achica y comprime en el navegador; el campo queda con la versión lista para subir.
            const prepared = await prepareImage(original);
            const transfer = new DataTransfer();
            transfer.items.add(prepared.file);
            input.files = transfer.files;
            setLocalError(
              prepared.small
                ? `Foto pequeña (menos de ${MIN_RECOMMENDED_WIDTH} px de ancho): puede verse borrosa.`
                : null,
            );
            applyFile(prepared.file);
          } catch (error) {
            input.value = "";
            setLocalError(error instanceof Error ? error.message : "No se pudo usar esa foto.");
          }
        }}
      />
      <div className="overflow-hidden rounded-lg border border-brand-border bg-slate-50">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-48 w-full object-cover" />
        ) : (
          <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-brand-muted">
            <ImagePlus className="h-6 w-6" />
            Todavía no hay foto
          </div>
        )}
      </div>
      {localError ? <p className="text-sm text-red-700">{localError}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="lg" onClick={() => inputRef.current?.click()}>
          {preview ? "Cambiar imagen" : "Subir imagen"}
        </Button>
        {preview ? (
          <Button variant="ghost"
            size="lg" className="text-red-700" onClick={clearImage}>
            Quitar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
