import { Check, Circle } from "lucide-react";
import { PASSWORD_RULES } from "@/lib/auth/password-policy";
import { cn } from "@/lib/utils";

/** Requisitos de la contraseña nueva, que se van marcando mientras se escribe. */
export function PasswordRules({ value, id }: { value: string; id?: string }) {
  return (
    <ul id={id} className="space-y-1.5 text-sm" aria-label="Requisitos de la contraseña">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <li
            key={rule.id}
            className={cn("flex items-center gap-2", ok ? "text-emerald-700" : "text-brand-muted")}
          >
            {ok ? (
              <Check className="size-4 shrink-0" aria-hidden="true" />
            ) : (
              <Circle className="size-4 shrink-0" aria-hidden="true" />
            )}
            {rule.label}
            <span className="sr-only">{ok ? "(cumplido)" : "(falta)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
