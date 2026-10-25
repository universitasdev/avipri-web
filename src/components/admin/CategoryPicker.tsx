"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Input } from "@/components/admin/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";
import { categoryStyle } from "@/components/observatorio/categoryStyles";
import { adminFetch, readError } from "@/components/admin/admin-fetch";

export type CategoryOption = {
  id: string;
  slug: string;
  name: string;
  color: string;
  icon: string | null;
};

/**
 * Lista de categorías con un botón «+ Nueva categoría» al lado: el editor elige una que
 * ya existe o crea otra sin salir del formulario. Si el nombre ya existe, se reutiliza.
 */
export function CategoryPicker({
  id,
  categories,
  value,
  onChange,
  onCreated,
  invalid,
}: {
  id: string;
  categories: CategoryOption[];
  value: string;
  onChange: (categoryId: string) => void;
  onCreated: (category: CategoryOption) => void;
  invalid?: boolean;
}) {
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = categories.find((category) => category.id === value);

  async function create() {
    if (name.trim().length < 2) {
      setError("Escribe el nombre de la categoría (al menos 2 letras).");
      inputRef.current?.focus();
      return;
    }
    setPending(true);
    const response = await adminFetch("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    setPending(false);
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    const data = (await response.json()) as { category: CategoryOption };
    onCreated(data.category);
    onChange(data.category.id);
    setName("");
    setError(null);
    setCreating(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id={id} aria-invalid={invalid || undefined} className="min-w-0 flex-1">
            <SelectValue placeholder="Elige una categoría…">
              {selected ? (
                <span className="flex items-center gap-2.5">
                  <span aria-hidden="true" className={`size-3 shrink-0 rounded-full ${categoryStyle(selected).fill}`} />
                  {selected.name}
                </span>
              ) : undefined}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <span className="flex items-center gap-2.5">
                  {/* Punto con el color que tendrá la noticia en el Observatorio. */}
                  <span
                    aria-hidden="true"
                    className={`size-3 shrink-0 rounded-full ${categoryStyle(category).fill}`}
                  />
                  {category.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="lg"
          className="h-12 shrink-0"
          onClick={() => {
            setCreating((open) => !open);
            setError(null);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
          aria-expanded={creating}
        >
          <Plus aria-hidden="true" />
          Nueva categoría
        </Button>
      </div>

      {creating ? (
        <div className="space-y-3 rounded-lg border border-brand-border bg-slate-50 p-4">
          <label htmlFor={`${id}-new`} className="block text-base font-medium text-brand-navy">
            Nombre de la nueva categoría
          </label>
          <Input
            id={`${id}-new`}
            ref={inputRef}
            value={name}
            maxLength={60}
            placeholder="Por ejemplo: Mesas técnicas"
            className="h-12 text-base"
            onChange={(event) => setName(event.target.value)}
            onKeyDown={(event) => {
              // Enter crea la categoría en vez de avanzar de paso en el formulario.
              if (event.key === "Enter") {
                event.preventDefault();
                void create();
              }
            }}
          />
          {error ? <p className="text-base text-red-700">{error}</p> : null}
          <div className="flex flex-wrap gap-2">
            <Button size="lg" disabled={pending} onClick={() => void create()}>
              {pending ? "Creando…" : "Crear y usar esta categoría"}
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={() => {
                setCreating(false);
                setName("");
                setError(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
