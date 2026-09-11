"use client";

import {
  faBuildingUser,
  faCheckCircle,
  faCity,
  faCommentSlash,
  faFileCircleCheck,
  faFileCircleXmark,
  faFileSignature,
  faInbox,
  faRoadBarrier,
  faRulerCombined,
  faScroll,
  faSquareParking,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useEffect, useState } from "react";
import { DECALOGUE, MYTHS } from "@/lib/abc/content";

const ICONS_BY_TOPIC: Record<
  (typeof MYTHS)[number]["topic"],
  { myth: IconDefinition; reality: IconDefinition }
> = {
  "Derecho de propiedad y régimen del suelo": {
    myth: faCommentSlash,
    reality: faCheckCircle,
  },
  "Variables Urbanas Fundamentales (VUF)": {
    myth: faBuildingUser,
    reality: faRulerCombined,
  },
  "Afectaciones viales y reservas públicas": {
    myth: faRoadBarrier,
    reality: faSquareParking,
  },
  "Sustitución de instrumentos obsoletos": {
    myth: faFileCircleXmark,
    reality: faFileCircleCheck,
  },
  "Consulta Pública de 60 días": {
    myth: faInbox,
    reality: faFileSignature,
  },
  "Autonomía municipal en el uso del suelo": {
    myth: faScroll,
    reality: faCity,
  },
};

function CardIcon({
  icon,
  className,
}: {
  icon: IconDefinition;
  className: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <span className={`inline-block h-[1em] w-[1em] ${className}`} aria-hidden />
    );
  }

  return <FontAwesomeIcon icon={icon} className={className} />;
}

function FlipCard({
  index,
  topic,
  myth,
  reality,
}: {
  index: number;
  topic: (typeof MYTHS)[number]["topic"];
  myth: string;
  reality: string;
}) {
  const [flipped, setFlipped] = useState(false);
  const icons = ICONS_BY_TOPIC[topic];

  return (
    <button
      type="button"
      aria-pressed={flipped}
      aria-label={`Mito ${index + 1}: ${topic}`}
      onClick={() => setFlipped((value) => !value)}
      className="group h-[420px] w-full [perspective:1000px] text-left sm:h-[440px]"
    >
      <span className="sr-only">
        {flipped ? "Mostrar mito" : "Mostrar realidad"}
      </span>
      <div
        className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${
          flipped ? "[transform:rotateY(180deg)]" : ""
        } [@media(hover:hover)]:group-hover:[transform:rotateY(180deg)]`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-xl border border-brand-border border-t-4 border-t-brand-terracotta bg-brand-bone p-6 text-center shadow-[0_8px_24px_rgba(26,43,75,0.06)] [backface-visibility:hidden]">
          <CardIcon
            icon={icons.myth}
            className="mb-4 text-4xl text-slate-400/70"
          />
          <p className="text-sm font-bold uppercase tracking-wide text-brand-navy">
            Mito {index + 1}
          </p>
          <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-brand-terracotta">
            {topic}
          </p>
          <p className="mt-3 text-sm italic leading-relaxed text-brand-navy">
            “{myth}”
          </p>
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-y-auto rounded-xl border border-brand-border border-t-4 border-t-brand-success bg-white p-6 text-center shadow-[0_8px_24px_rgba(26,43,75,0.06)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <CardIcon
            icon={icons.reality}
            className="mb-3 text-3xl text-brand-success"
          />
          <p className="mb-2 font-bold text-brand-success">Realidad</p>
          <p className="text-sm leading-relaxed text-brand-text">
            <strong className="text-brand-navy">FALSO.</strong> {reality}
          </p>
        </div>
      </div>
    </button>
  );
}

export function MitosSection() {
  return (
    <section
      id="mitos"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
    >
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
          Desmitificación conceptual
        </h2>
        <p className="mt-3 text-lg text-slate-600">
          Pasa el cursor (o toca) sobre las tarjetas para descubrir la realidad
          jurídica frente a los mitos comunes sobre la planificación urbana.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MYTHS.map((item, index) => (
          <FlipCard
            key={item.topic}
            index={index}
            topic={item.topic}
            myth={item.myth}
            reality={item.reality}
          />
        ))}
      </div>

      <div className="mt-12 rounded-xl bg-brand-navy p-6 text-white sm:p-8">
        <h3 className="mb-4 font-serif text-2xl font-bold">
          El decálogo del ciudadano urbano
        </h3>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {DECALOGUE.map((item, index) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate-200">
              <span className="font-bold text-brand-orange">{index + 1}.</span>
              {item}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
