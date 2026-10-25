"use client";

import { useState } from "react";
import Image from "next/image";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NewsVideo } from "@/lib/observatorio/content";

/**
 * Un archivo subido se reproduce con el <video> nativo. Un video de YouTube se muestra
 * primero como portada y el reproductor (sin cookies) solo se carga al pulsar reproducir.
 */
export function NewsVideoPlayer({ video }: { video: NewsVideo }) {
  const [active, setActive] = useState(false);
  const frame = "relative aspect-video w-full overflow-hidden bg-brand-navy";

  if (video.kind === "file") {
    return (
      <video
        src={video.src}
        poster={video.poster}
        aria-label={video.title}
        controls
        playsInline
        preload="metadata"
        className={`${frame} object-contain`}
      />
    );
  }

  if (active) {
    return (
      <div className={frame}>
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
          title={video.title}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 size-full border-0"
        />
      </div>
    );
  }

  return (
    <button type="button" onClick={() => setActive(true)} className={`group ${frame} block`}>
      <Image
        src={video.poster}
        alt=""
        fill
        sizes="(min-width: 896px) 864px, 100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
      />
      <span aria-hidden="true" className="absolute inset-0 bg-brand-navy/35" />
      <span
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 grid size-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-brand-terracotta text-3xl text-white shadow-xl ring-8 ring-white/20 transition-transform duration-300 ease-out group-hover:scale-110"
      >
        <FontAwesomeIcon icon={faPlay} className="translate-x-0.5" />
      </span>
      <span className="absolute inset-x-0 bottom-0 bg-brand-navy/70 px-4 py-2 text-left text-xs text-white/85">
        Al reproducir se cargará YouTube.
      </span>
      <span className="sr-only">Reproducir el video «{video.title}»</span>
    </button>
  );
}
