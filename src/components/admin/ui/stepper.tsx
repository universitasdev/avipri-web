"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Indicador de pasos: número, nombre y estado de cada paso. Los pasos alcanzables se
 * pueden pulsar para volver a ellos; el actual se anuncia con aria-current.
 */
export function Stepper({
  steps,
  current,
  reachable,
  onSelect,
}: {
  steps: string[];
  current: number;
  /** Último paso al que se puede saltar directamente. */
  reachable: number;
  onSelect: (index: number) => void;
}) {
  return (
    <nav aria-label="Pasos para publicar la noticia">
      <p className="mb-3 text-base font-medium text-brand-navy sm:hidden">
        Paso {current + 1} de {steps.length}: {steps[current]}
      </p>
      <ol className="grid grid-cols-4 gap-2">
        {steps.map((label, index) => {
          const done = index < current;
          const active = index === current;
          const enabled = index <= reachable && !active;
          return (
            <li key={label}>
              <button
                type="button"
                disabled={!enabled}
                onClick={() => onSelect(index)}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "group flex w-full flex-col items-start gap-2 rounded-lg border-t-4 pt-3 text-left transition-colors",
                  active && "border-brand-navy",
                  done && "border-emerald-500",
                  !active && !done && "border-slate-200",
                  enabled ? "cursor-pointer" : "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full text-base font-semibold",
                    active && "bg-brand-navy text-white",
                    done && "bg-emerald-500 text-white",
                    !active && !done && "bg-slate-100 text-slate-500",
                  )}
                >
                  {done ? <Check className="size-5" aria-hidden="true" /> : index + 1}
                  {done ? <span className="sr-only">completado:</span> : null}
                </span>
                <span
                  className={cn(
                    "hidden text-sm font-medium sm:block",
                    active ? "text-brand-navy" : "text-slate-500",
                    enabled && "group-hover:text-brand-navy group-hover:underline",
                  )}
                >
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
