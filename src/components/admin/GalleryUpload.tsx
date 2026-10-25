"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";

export const MAX_PHOTOS = 12;
const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

/** Una foto de la galería: ya guardada (src) o recién elegida (file), con su vista previa. */
export type GalleryPhoto = {
  key: string;
  src?: string;
  file?: File;
  preview: string;
  alt: string;
};

export function photosFromImages(images: { src: string; alt: string | null }[]): GalleryPhoto[] {
  return images.map((image) => ({
    key: image.src,
    src: image.src,
    preview: image.src,
    alt: image.alt ?? "",
  }));
}

function revokeIfBlob(url: string) {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
}

/**
 * Fotos de la noticia: con 1 es foto y con 2 o más se publica como galería. La primera es
 * la portada; las flechas cambian el orden. Los archivos se suben al guardar la noticia.
 */
export function GalleryUpload({
  photos,
  onChange,
}: {
  photos: GalleryPhoto[];
  onChange: (photos: GalleryPhoto[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  // Al salir de la página se liberan las vistas previas que siguen en uso.
  const latest = useRef(photos);
  useEffect(() => {
    latest.current = photos;
  }, [photos]);
  useEffect(() => () => latest.current.forEach((photo) => revokeIfBlob(photo.preview)), []);

  function addFiles(files: File[]) {
    const room = MAX_PHOTOS - photos.length;
    const valid: GalleryPhoto[] = [];
    let rejected = 0;
    for (const file of files) {
      if ((file.type && !ALLOWED.includes(file.type)) || file.size > MAX_BYTES) {
        rejected++;
        continue;
      }
      if (valid.length >= room) break;
      valid.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
        alt: "",
      });
    }
    const overflow = files.length - rejected - valid.length;
    setLocalError(
      [
        rejected > 0 ? `${rejected} archivo(s) no son JPG, PNG o WebP de hasta 3 MB.` : null,
        overflow > 0 ? `Solo caben ${MAX_PHOTOS} fotos; ${overflow} no se agregaron.` : null,
      ]
        .filter(Boolean)
        .join(" ") || null,
    );
    if (valid.length > 0) onChange([...photos, ...valid]);
  }

  function move(index: number, step: number) {
    const next = [...photos];
    const [photo] = next.splice(index, 1);
    next.splice(index + step, 0, photo!);
    onChange(next);
  }

  function remove(index: number) {
    revokeIfBlob(photos[index]!.preview);
    onChange(photos.filter((_, i) => i !== index));
    setLocalError(null);
  }

  function setAlt(index: number, alt: string) {
    onChange(photos.map((photo, i) => (i === index ? { ...photo, alt } : photo)));
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(event) => {
          addFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />

      {photos.length > 0 ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, i) => (
            <li key={photo.key} className="overflow-hidden rounded-lg border border-brand-border bg-white">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt="" className="aspect-[4/3] w-full object-cover" />
                {i === 0 ? (
                  <span className="absolute top-2 left-2 rounded-full bg-brand-navy px-2 py-0.5 text-[11px] font-semibold text-white">
                    Portada
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white/90 text-red-700 shadow hover:bg-white"
                >
                  <X className="size-4" aria-hidden="true" />
                  <span className="sr-only">Quitar foto {i + 1}</span>
                </button>
              </div>
              <div className="space-y-2 p-2">
                <Input
                  value={photo.alt}
                  onChange={(event) => setAlt(i, event.target.value)}
                  maxLength={200}
                  placeholder="Qué se ve en la foto"
                  aria-label={`Descripción de la foto ${i + 1}`}
                  className="h-8 text-xs"
                />
                <div className="flex justify-between">
                  <Button
                    size="xs"
                    variant="ghost"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    aria-label={`Mover la foto ${i + 1} antes`}
                  >
                    <ArrowLeft />
                  </Button>
                  <span className="self-center text-[11px] text-brand-muted">{i + 1}</span>
                  <Button
                    size="xs"
                    variant="ghost"
                    disabled={i === photos.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label={`Mover la foto ${i + 1} después`}
                  >
                    <ArrowRight />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-brand-border bg-slate-50 text-sm text-brand-muted">
          <ImagePlus className="h-6 w-6" />
          Todavía no hay fotos
        </div>
      )}

      <p className="text-xs text-brand-muted">
        {photos.length === 0
          ? "Sin fotos, la noticia se muestra como tarjeta de texto (o de documento, si lleva PDF)."
          : photos.length === 1
            ? "1 foto. Con 2 o más se publica como galería."
            : `Galería de ${photos.length} fotos (máximo ${MAX_PHOTOS}). La primera es la portada.`}
      </p>
      {localError ? <p className="text-xs text-red-700">{localError}</p> : null}

      <Button
        variant="outline"
        size="sm"
        disabled={photos.length >= MAX_PHOTOS}
        onClick={() => inputRef.current?.click()}
      >
        {photos.length === 0 ? "Subir fotos" : "Agregar fotos"}
      </Button>
    </div>
  );
}
