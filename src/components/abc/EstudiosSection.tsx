"use client";

import {
  faHouseCrack,
  faMapLocationDot,
  faPlugCircleBolt,
  faPlus,
  faWater,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { STUDIES, STUDY_MATRIX } from "@/lib/abc/content";

const STUDY_ICONS: IconDefinition[] = [
  faHouseCrack,
  faWater,
  faPlugCircleBolt,
  faMapLocationDot,
];

export function EstudiosSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="estudios"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
    >
      <header className="mx-auto mb-10 max-w-4xl text-center">
        <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
          Estudios técnicos multidisciplinarios
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-slate-600">
          Un error histórico en la planificación urbana ha sido tratar las
          ciudades como hojas en blanco donde se asignan alturas y densidades sin
          analizar la resistencia del suelo, la disponibilidad real de agua o la
          amenaza de sismos e inundaciones.
        </p>
        <p className="mt-3 text-lg leading-relaxed text-slate-600">
          Para evitar tragedias, colapsos de servicios o la paralización de
          inversiones, la Ley Orgánica de Ordenación Urbanística (LOOU) y la Guía
          MINFRA N° 139 exigen que la Ordenanza de Zonificación sea el resultado
          directo de cuatro grandes estudios técnicos de base:
        </p>
      </header>

      <div className="mb-12 grid grid-cols-1 items-start gap-6 md:grid-cols-2">
        {STUDIES.map((study, index) => {
          const isOpen = open === index;

          return (
            <Card key={study.title} className="overflow-hidden p-0">
              <button
                type="button"
                aria-expanded={isOpen}
                className="flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6"
                onClick={() => setOpen(isOpen ? null : index)}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-brand-bone text-xl text-brand-terracotta">
                    <FontAwesomeIcon icon={STUDY_ICONS[index]} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-terracotta">
                      Estudio {index + 1}
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-bold leading-snug text-brand-navy sm:text-2xl">
                      {study.title}
                    </h3>
                  </div>
                </div>
                <span className="mt-1 shrink-0 rounded-full border border-brand-border px-2 py-1">
                  <FontAwesomeIcon
                    icon={faPlus}
                    className={`text-sm text-brand-terracotta transition-transform ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  />
                </span>
              </button>
              {isOpen ? (
                <div className="space-y-4 border-t border-brand-border bg-brand-bone px-5 py-5 sm:px-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-terracotta">
                      El desafío en Barquisimeto
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-brand-text">
                      {study.challenge}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-terracotta">
                      ¿Qué analiza el estudio?
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-brand-text">
                      {study.analyzes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-terracotta">
                      Traducción a las Variables Urbanas Fundamentales (VUF)
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-brand-text">
                      {study.norms.map((norm) => (
                        <li key={norm}>{norm}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </Card>
          );
        })}
      </div>

      <h3 className="mb-4 font-serif text-2xl font-bold text-brand-navy">
        Matriz de traducción: del estudio técnico a la norma parcelaria
      </h3>
      <div className="overflow-x-auto rounded-xl border border-brand-border bg-white shadow-[0_8px_24px_rgba(26,43,75,0.06)]">
        <table className="min-w-[720px] w-full border-collapse text-left text-sm">
          <thead>
            <tr className="bg-brand-navy text-white">
              <th className="px-5 py-4 font-medium">Estudio Técnico de Base</th>
              <th className="px-5 py-4 font-medium">
                Variable Urbana Fundamental (VUF) Resultante
              </th>
              <th className="px-5 py-4 font-medium">
                Impacto Directo para el Propietario / Inversionista
              </th>
            </tr>
          </thead>
          <tbody>
            {STUDY_MATRIX.map((row) => (
              <tr
                key={row.study}
                className="border-t border-brand-border hover:bg-brand-bone"
              >
                <td className="px-5 py-4 font-semibold text-brand-navy">
                  {row.study}
                </td>
                <td className="px-5 py-4 text-brand-text">{row.vuf}</td>
                <td className="px-5 py-4 text-brand-text">{row.impact}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
