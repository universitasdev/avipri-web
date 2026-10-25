"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Campo de contraseña con botón «Mostrar» / «Ocultar», para poder revisar lo escrito antes
 * de enviar (evita errores de tipeo, sobre todo en personas mayores).
 */
function PasswordInput({ className, ...props }: Omit<React.ComponentProps<"input">, "type">) {
  const [visible, setVisible] = React.useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"}
        className={cn(
          "flex h-12 w-full rounded-md border border-brand-border bg-white py-2 pr-32 pl-3 text-base text-brand-text shadow-sm transition-colors placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-brand-navy/25 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-pressed={visible}
        className="absolute top-1/2 right-1.5 inline-flex h-9 -translate-y-1/2 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-brand-navy hover:bg-slate-100"
      >
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
        {visible ? "Ocultar" : "Mostrar"}
        <span className="sr-only"> la contraseña</span>
      </button>
    </div>
  );
}

export { PasswordInput };
