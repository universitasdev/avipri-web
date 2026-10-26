"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { CircleCheck, Info, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";

/**
 * Aviso del resultado de una acción (publicar, guardar, eliminar), sobre el Alert de shadcn.
 * A diferencia de un toast, no desaparece solo: queda arriba hasta que la persona pulsa
 * "Entendido". Al aparecer recibe el foco para que los lectores de pantalla lo anuncien.
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
    <Alert
      ref={ref}
      role="status"
      tabIndex={-1}
      variant={tone}
      className="pr-14 shadow-sm outline-none sm:py-5"
    >
      <Icon aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {children ? <div>{children}</div> : null}
        <div className="mt-3 flex flex-wrap gap-3">
          {actions}
          <Button variant="outline" size="lg" onClick={onClose} className="bg-white/80">
            Entendido
          </Button>
        </div>
      </AlertDescription>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-3 right-3 size-9 rounded-full"
      >
        <X className="size-5" aria-hidden="true" />
        <span className="sr-only">Cerrar aviso</span>
      </Button>
    </Alert>
  );
}
