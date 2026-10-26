"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";

export const MAX_TAGS = 10;

function sameTag(a: string, b: string) {
  const key = (value: string) =>
    value.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();
  return key(a) === key(b);
}

/**
 * Etiquetas libres: se escribe, se pulsa Enter o «Agregar» y queda como pastilla. Mientras
 * se escribe, el navegador sugiere las etiquetas ya usadas (lista nativa), para no duplicar.
 */
export function TagInput({
  id,
  value,
  onChange,
  suggestions,
}: {
  id: string;
  value: string[];
  onChange: (tags: string[]) => void;
  suggestions: string[];
}) {
  const [draft, setDraft] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const full = value.length >= MAX_TAGS;

  function add() {
    const name = draft.replace(/\s+/g, " ").trim();
    if (!name) return;
    if (full) {
      setMessage(`Puedes poner hasta ${MAX_TAGS} etiquetas.`);
      return;
    }
    if (value.some((tag) => sameTag(tag, name))) {
      setMessage(`«${name}» ya está agregada.`);
      setDraft("");
      return;
    }
    // Si existe una parecida (mayúsculas o acentos), se usa la que ya existe.
    const existing = suggestions.find((tag) => sameTag(tag, name));
    onChange([...value, existing ?? name]);
    setDraft("");
    setMessage(null);
  }

  return (
    <div className="space-y-3">
      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2" aria-label="Etiquetas agregadas">
          {value.map((tag) => (
            <li
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-brand-navy/20 bg-blue-50 py-1 pr-1 pl-3 text-base text-brand-navy"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(value.filter((item) => item !== tag))}
                className="grid size-8 place-items-center rounded-full hover:bg-white"
              >
                <X className="size-4" aria-hidden="true" />
                <span className="sr-only">Quitar la etiqueta {tag}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id={id}
          value={draft}
          list={`${id}-suggestions`}
          maxLength={60}
          disabled={full}
          placeholder={full ? `Ya tienes ${MAX_TAGS} etiquetas` : "Escribe una etiqueta, por ejemplo: Catedral"}
          className="h-12 text-base"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            // Enter agrega la etiqueta en vez de avanzar de paso en el formulario.
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              add();
            }
          }}
        />
        <Button variant="outline" size="lg" className="h-12 shrink-0" disabled={full} onClick={add}>
          <Plus aria-hidden="true" />
          Agregar
        </Button>
      </div>
      <datalist id={`${id}-suggestions`}>
        {suggestions
          .filter((tag) => !value.some((item) => sameTag(item, tag)))
          .map((tag) => (
            <option key={tag} value={tag} />
          ))}
      </datalist>
      {message ? <p className="text-base text-amber-800">{message}</p> : null}
    </div>
  );
}
