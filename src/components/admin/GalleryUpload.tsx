"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import { MIN_RECOMMENDED_WIDTH, prepareImage } from "@/components/admin/image-resize";

export const MAX_PHOTOS = 12;

/** Una foto de la galería: ya guardada (src) o recién elegida (file), con su vista previa. */
export type GalleryPhoto = {
  key: string;
  src?: string;
  file?: File;
  preview: string;
  alt: string;
  /** Más angosta que lo recomendado: se avisa, pero se sube igual. */
  small?: boolean;
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
  const [preparing, setPreparing] = useState(false);

  // Al salir de la página se liberan las vistas previas que siguen en uso.
  const latest = useRef(photos);
  useEffect(() => {
    latest.current = photos;
  }, [photos]);
  useEffect(() => () => latest.current.forEach((photo) => revokeIfBlob(photo.preview)), []);

  // Cada foto se achica y comprime en el navegador antes de agregarla (ver prepareImage).
  async function addFiles(files: File[]) {
    const room = MAX_PHOTOS - photos.length;
    const valid: GalleryPhoto[] = [];
    const problems: string[] = [];
    setPreparing(true);
    for (const original of files.slice(0, room)) {
      try {
        const prepared = await prepareImage(original);
        valid.push({
          key: `${original.name}-${original.size}-${original.lastModified}-${Math.random()}`,
          file: prepared.file,
          preview: URL.createObjectURL(prepared.file),
          alt: "",
          small: prepared.small,
        });
      } catch (error) {
        problems.push(error instanceof Error ? error.message : `No se pudo usar «${original.name}».`);
      }
    }
    setPreparing(false);
    const overflow = files.length - room;
    if (overflow > 0) problems.push(`Solo caben ${MAX_PHOTOS} fotos; ${overflow} no se agregaron.`);
    setLocalError(problems.length > 0 ? problems.join(" ") : null);
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
          const files = Array.from(event.target.files ?? []);
          event.target.value = "";
          void addFiles(files);
        }}
      />

      {photos.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((photo, i) => (
            <li key={photo.key} className="overflow-hidden rounded-lg border border-brand-border bg-white">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.preview} alt="" className="aspect-[4/3] w-full object-cover" />
                <span className="absolute top-2 left-2 rounded-full bg-brand-navy px-2.5 py-1 text-sm font-semibold text-white">
                  {i === 0 ? "Portada" : `Foto ${i + 1}`}
                </span>
              </div>
              <div className="space-y-2 p-3">
                {photo.small ? (
                  <p className="rounded-md bg-amber-50 px-2 py-1.5 text-sm text-amber-900">
                    Foto pequeña (menos de {MIN_RECOMMENDED_WIDTH} px de ancho): puede verse borrosa.
                    Si tienes una más grande, úsala.
                  </p>
                ) : null}
                <Input
                  value={photo.alt}
                  onChange={(event) => setAlt(i, event.target.value)}
                  maxLength={200}
                  placeholder="¿Qué se ve en la foto?"
                  aria-label={`Descripción de la foto ${i + 1}`}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    disabled={i === 0}
                    onClick={() => move(i, -1)}
                    aria-label={`Mover la foto ${i + 1} antes`}
                  >
                    <ArrowLeft aria-hidden="true" />
                    Antes
                  </Button>
                  <Button
                    variant="outline"
                    disabled={i === photos.length - 1}
                    onClick={() => move(i, 1)}
                    aria-label={`Mover la foto ${i + 1} después`}
                  >
                    Después
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  className="w-full text-red-700 hover:bg-red-50 hover:text-red-800"
                  onClick={() => remove(i)}
                  aria-label={`Quitar la foto ${i + 1}`}
                >
                  <X aria-hidden="true" />
                  Quitar foto
                </Button>
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

      <p className="text-base text-brand-muted">
        {photos.length === 0
          ? "Sin fotos, la noticia se muestra como tarjeta de texto (o de documento, si lleva PDF)."
          : photos.length === 1
            ? "1 foto. Con 2 o más se publica como galería."
            : `Galería de ${photos.length} fotos (máximo ${MAX_PHOTOS}). La primera es la portada.`}
      </p>
      {localError ? <p className="text-base text-red-700">{localError}</p> : null}

      <Button
        variant="outline"
        size="lg"
        disabled={photos.length >= MAX_PHOTOS || preparing}
        onClick={() => inputRef.current?.click()}
      >
        <ImagePlus aria-hidden="true" />
        {preparing
          ? "Preparando las fotos…"
          : photos.length === 0
            ? "Elegir fotos"
            : "Agregar más fotos"}
      </Button>
    </div>
  );
}
