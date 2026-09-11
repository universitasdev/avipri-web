"use client";

import { faPlus, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { PHASES, TRUSTTECH } from "@/lib/abc/content";

export function ProcedimientoSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="procedimiento"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
    >
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
          Procedimiento de elaboración (flujograma legal)
        </h2>
        <p className="mt-3 text-lg leading-relaxed text-slate-600">
          La elaboración del nuevo PDUL del Municipio Iribarren no es un acto
          improvisado de despacho; es un procedimiento administrativo riguroso y
          transparente que abarca 24 meses continuos divididos en 4 fases
          secuenciales e interdependientes:
        </p>
      </header>

      <div className="relative">
        <div
          aria-hidden="true"
          className="absolute bottom-4 left-[15px] top-2 w-1 rounded bg-brand-border"
        />
        {PHASES.map((phase, index) => {
          const isOpen = open === index;

          return (
            <article
              key={phase.roman}
              className="relative mb-4 pl-14 last:mb-0 sm:pl-16"
            >
              <div className="absolute left-0 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-brand-navy text-xs font-bold text-white shadow-md">
                {phase.roman}
              </div>
              <Card className="overflow-hidden p-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left sm:px-6"
                  onClick={() => setOpen(isOpen ? null : index)}
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wide text-brand-terracotta">
                      Fase {phase.roman} · {phase.badge}
                    </p>
                    <h3 className="mt-1 font-serif text-xl font-bold text-brand-navy sm:text-2xl">
                      {phase.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">{phase.kicker}</p>
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
                      <p className="text-sm font-semibold text-brand-navy">
                        ¿En qué consiste?
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600">
                        {phase.body}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-navy">
                        Hitos y entregables clave
                      </p>
                      <ul className="mt-3 space-y-3">
                        {phase.items.map((item) => (
                          <li key={item.title} className="text-sm text-brand-text">
                            <span className="flex gap-2">
                              <span className="mt-0.5 text-brand-success">✓</span>
                              <span>
                                <strong className="text-brand-navy">
                                  {item.title}:
                                </strong>{" "}
                                {item.body}
                              </span>
                            </span>
                            {"nested" in item && item.nested ? (
                              <ul className="mt-2 space-y-2 pl-6">
                                {item.nested.map((child) => (
                                  <li
                                    key={child.title}
                                    className="flex gap-2 text-sm text-brand-text"
                                  >
                                    <span className="mt-0.5 text-brand-success">
                                      ✓
                                    </span>
                                    <span>
                                      <strong className="text-brand-navy">
                                        {child.title}:
                                      </strong>{" "}
                                      {child.body}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : null}
              </Card>
            </article>
          );
        })}
      </div>

      <div className="mt-10 rounded-xl border border-brand-success/20 bg-brand-success/5 p-6 sm:p-8">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-brand-success">
          <FontAwesomeIcon icon={faShieldHalved} />
          Garantías procedimentales y transparencia TrustTech
        </h3>
        <p className="text-sm leading-relaxed text-brand-text">{TRUSTTECH.intro}</p>
        <ul className="mt-4 space-y-3">
          {TRUSTTECH.items.map((item) => (
            <li key={item.title} className="flex gap-2 text-sm text-brand-text">
              <span className="mt-0.5 text-brand-success">✓</span>
              <span>
                <strong className="text-brand-navy">{item.title}:</strong> {item.body}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
