"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  faArrowLeft,
  faArrowRight,
  faExpand,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NewsImage } from "@/lib/observatorio/content";

/*
 * Adaptado de la galería de PDUL YA (portal-iribarren/src/components/noticias/galeria.tsx).
 * Retícula asimétrica (la primera foto grande) en pantallas medianas y carril deslizable en
 * teléfonos. Cada foto abre un visor a pantalla completa con <dialog>, que atrapa el foco,
 * cierra con Esc y devuelve el foco a la miniatura.
 */

// Retícula sin huecos (clases literales para que Tailwind las genere):
// 5 fotos → 1 grande + 2×2; 3-4 → 1 grande + una columna; 2 → mitades.
const LAYOUT = {
  2: { list: "sm:h-72 sm:grid-cols-2", big: "" },
  3: {
    list: "sm:h-[26rem] lg:h-[30rem] sm:grid-cols-3 sm:grid-rows-2",
    big: "sm:col-span-2 sm:row-span-2",
  },
  4: {
    list: "sm:h-[26rem] lg:h-[30rem] sm:grid-cols-3 sm:grid-rows-3",
    big: "sm:col-span-2 sm:row-span-3",
  },
  5: {
    list: "sm:h-[26rem] lg:h-[30rem] sm:grid-cols-4 sm:grid-rows-2",
    big: "sm:col-span-2 sm:row-span-2",
  },
} as const;

export function NewsGallery({ images, title }: { images: NewsImage[]; title: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const touch = useRef<number | null>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const total = images.length;

  const open = (i: number) => {
    setCurrent(i);
    dialog.current?.showModal();
  };
  const move = (step: number) =>
    setCurrent((i) => (i === null ? i : (i + step + total) % total));

  // Mientras el visor está abierto, la página de fondo no se desplaza.
  useEffect(() => {
    if (current === null) return;
    const html = document.documentElement;
    const previous = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      html.style.overflow = previous;
    };
  }, [current]);

  const visible = images.slice(0, 5);
  const layout = LAYOUT[Math.min(Math.max(visible.length, 2), 5) as 2 | 3 | 4 | 5];
  const hidden = total - visible.length;
  const photo = current === null ? null : images[current];

  return (
    <section aria-label={`Galería: ${title}`}>
      <ul
        className={`-mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:snap-none sm:overflow-visible ${layout.list} sm:px-0 sm:pb-0 [&::-webkit-scrollbar]:hidden`}
      >
        {visible.map((image, i) => (
          <li
            key={image.src}
            className={`relative w-[85%] shrink-0 snap-start sm:w-auto ${i === 0 ? layout.big : ""}`}
          >
            <button
              type="button"
              onClick={() => open(i)}
              className="group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl bg-brand-navy shadow-md sm:aspect-auto sm:h-full sm:min-h-40"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={i === 0 ? "(min-width: 640px) 432px, 85vw" : "(min-width: 640px) 216px, 85vw"}
                priority={i === 0}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              />
              <span className="absolute right-3 bottom-3 grid size-10 place-items-center rounded-full bg-brand-navy/70 text-white opacity-90 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                <FontAwesomeIcon icon={faExpand} />
              </span>
              {i === visible.length - 1 && hidden > 0 ? (
                <span className="absolute inset-0 grid place-items-center bg-brand-navy/65 font-serif text-3xl font-bold text-white">
                  +{hidden}
                </span>
              ) : null}
              <span className="sr-only">
                Ampliar foto {i + 1} de {total}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm text-slate-500 sm:hidden">
        Desliza para ver las {total} fotos · toca una para ampliarla
      </p>

      <dialog
        ref={dialog}
        aria-label={`Visor de fotos: ${title}`}
        onClose={() => setCurrent(null)}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") move(1);
          if (event.key === "ArrowLeft") move(-1);
        }}
        onTouchStart={(event) => {
          touch.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touch.current;
          const end = event.changedTouches[0]?.clientX;
          if (start !== null && end !== undefined && Math.abs(end - start) > 50) {
            move(end < start ? 1 : -1);
          }
          touch.current = null;
        }}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-brand-navy/95 p-0 text-white backdrop:bg-brand-navy/80"
      >
        {photo ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <p className="font-semibold" aria-live="polite">
                {current! + 1} de {total}
              </p>
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                autoFocus
                className="grid size-11 place-items-center rounded-full bg-white/10 text-xl transition-colors hover:bg-white/20"
              >
                <FontAwesomeIcon icon={faXmark} />
                <span className="sr-only">Cerrar visor</span>
              </button>
            </div>

            <div className="relative flex-1">
              <Image
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="100vw"
                className="object-contain"
              />
              {total > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() => move(-1)}
                    className="absolute top-1/2 left-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-brand-navy/70 transition-colors hover:bg-brand-navy sm:left-6"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} />
                    <span className="sr-only">Foto anterior</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(1)}
                    className="absolute top-1/2 right-2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-brand-navy/70 transition-colors hover:bg-brand-navy sm:right-6"
                  >
                    <FontAwesomeIcon icon={faArrowRight} />
                    <span className="sr-only">Foto siguiente</span>
                  </button>
                </>
              ) : null}
            </div>

            <p className="px-4 py-4 text-sm text-white/80 sm:px-6">{photo.alt}</p>
          </div>
        ) : null}
      </dialog>
    </section>
  );
}
