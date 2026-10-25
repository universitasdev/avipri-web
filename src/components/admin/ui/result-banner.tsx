"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CircleCheck, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Aviso del resultado de una acción (publicar, guardar, eliminar). A diferencia de un
 * toast, no desaparece solo: queda arriba hasta que la persona pulsa "Entendido".
 * Al aparecer recibe el foco para que los lectores de pantalla lo anuncien.
 */
export function ResultBanner({
  tone = "success",
  title,
  children,
  actions,
  onClose,
}: {
  tone?: "success" | "info";
  title: string;
  children?: ReactNode;
  actions?: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.focus();
    ref.current?.scrollIntoView({ block: "nearest" });
  }, []);

  const Icon = tone === "success" ? CircleCheck : Info;
  return (
    <div
      ref={ref}
      role="status"
      tabIndex={-1}
      className={cn(
        "relative flex gap-4 rounded-xl border-2 p-5 shadow-sm outline-none sm:p-6",
        tone === "success"
          ? "border-emerald-300 bg-emerald-50 text-emerald-950"
          : "border-sky-300 bg-sky-50 text-sky-950",
      )}
    >
      <Icon
        aria-hidden="true"
        className={cn("mt-0.5 size-8 shrink-0", tone === "success" ? "text-emerald-600" : "text-sky-600")}
      />
      <div className="min-w-0 flex-1">
        <p className="pr-8 text-lg font-semibold">{title}</p>
        {children ? <div className="mt-1 text-base leading-relaxed">{children}</div> : null}
        <div className="mt-4 flex flex-wrap gap-3">
          {actions}
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 items-center rounded-md border border-current/25 bg-white/70 px-4 text-sm font-medium hover:bg-white"
          >
            Entendido
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="absolute top-3 right-3 grid size-9 place-items-center rounded-full hover:bg-black/5"
      >
        <X className="size-5" aria-hidden="true" />
        <span className="sr-only">Cerrar aviso</span>
      </button>
    </div>
  );
}
