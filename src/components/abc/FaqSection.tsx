"use client";

import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { FAQS } from "@/lib/abc/content";

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8"
    >
      <header className="mx-auto mb-10 max-w-3xl text-center">
        <h2 className="font-serif text-3xl font-bold text-brand-navy sm:text-4xl">
          Preguntas frecuentes y capacitación gremial
        </h2>
      </header>

      <div className="mx-auto max-w-3xl">
        {FAQS.map((item, index) => {
          const isOpen = open === index;

          return (
            <div
              key={item.question}
              className="mb-4 overflow-hidden rounded-xl border border-brand-border bg-white shadow-[0_8px_24px_rgba(26,43,75,0.04)]"
            >
              <button
                type="button"
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold text-brand-navy"
                onClick={() => setOpen(isOpen ? null : index)}
              >
                {item.question}
                <FontAwesomeIcon
                  icon={faPlus}
                  className={`shrink-0 text-brand-terracotta transition-transform ${
                    isOpen ? "rotate-45" : ""
                  }`}
                />
              </button>
              {isOpen ? (
                <div className="space-y-3 border-t border-brand-border bg-brand-bone px-5 py-4 text-sm leading-relaxed text-brand-text">
                  {item.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {"bullets" in item && item.bullets ? (
                    <ul className="space-y-3">
                      {item.bullets.map((bullet) => (
                        <li key={bullet.title} className="flex gap-2">
                          <span className="mt-0.5 text-brand-success">✓</span>
                          <span>
                            <strong className="text-brand-navy">
                              {bullet.title}:
                            </strong>{" "}
                            {bullet.body}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
