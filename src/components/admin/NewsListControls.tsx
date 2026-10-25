"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { buttonVariants } from "@/components/admin/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";

// Radix no admite "" como valor de una opción: "todos" representa "sin filtro de autor".
const ALL_AUTHORS = "todos";
import { cn } from "@/lib/utils";

const LIST_URL_KEY = "pdul-admin-news-list";

/** Guarda la dirección actual del listado (filtros y página) para volver desde el formulario. */
export function rememberNewsList(url: string) {
  try {
    sessionStorage.setItem(LIST_URL_KEY, url);
  } catch {
    // Sin almacenamiento (modo privado estricto): se vuelve al listado sin filtros.
  }
}

/** Dirección del listado al que volver, con parámetros extra (por ejemplo, el aviso). */
export function backToNewsList(extra?: Record<string, string>) {
  let base = "/admin/noticias";
  try {
    base = sessionStorage.getItem(LIST_URL_KEY) || base;
  } catch {}
  if (!extra) return base;
  const url = new URL(base, window.location.origin);
  for (const [key, value] of Object.entries(extra)) url.searchParams.set(key, value);
  return url.pathname + url.search;
}

export type ListFilter = { status: "todas" | "publicadas" | "borradores"; author: string; page: number };

/** Dirección del listado con los filtros dados (sin parámetros vacíos ni la página 1). */
export function newsListHref(filter: ListFilter, changes: Partial<ListFilter> = {}) {
  const next = { ...filter, ...changes };
  const params = new URLSearchParams();
  if (next.status !== "todas") params.set("ver", next.status);
  if (next.author) params.set("autor", next.author);
  if (next.page > 1) params.set("pagina", String(next.page));
  const query = params.toString();
  return query ? `/admin/noticias?${query}` : "/admin/noticias";
}

const STATUS_OPTIONS = [
  { value: "todas", label: "Todas" },
  { value: "publicadas", label: "Publicadas" },
  { value: "borradores", label: "Borradores" },
] as const;

/** Filtros por estado (botones) y por autor (lista). Cambiar un filtro vuelve a la página 1. */
export function NewsFilters({
  filter,
  counts,
  authors,
  currentUserId,
}: {
  filter: ListFilter;
  counts: Record<ListFilter["status"], number>;
  authors: { id: string; name: string; count: number }[];
  currentUserId: string;
}) {
  const router = useRouter();
  const filtered = filter.status !== "todas" || Boolean(filter.author);
  // Las noticias propias van primero, como «Mis noticias».
  const mine = authors.find((author) => author.id === currentUserId);
  const others = authors.filter((author) => author.id !== currentUserId);
  const authorLabel = !filter.author
    ? "Todos los autores"
    : filter.author === mine?.id
      ? "Mis noticias"
      : (authors.find((author) => author.id === filter.author)?.name ?? "Todos los autores");

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-brand-border bg-white p-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <p className="text-sm font-medium text-brand-muted">Mostrar</p>
        <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((option) => {
            const active = filter.status === option.value;
            return (
              <Link
                key={option.value}
                href={newsListHref(filter, { status: option.value, page: 1 })}
                aria-current={active ? "true" : undefined}
                className={cn(
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-base font-medium transition-colors",
                  active
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-brand-border bg-white text-brand-navy hover:border-brand-navy",
                )}
              >
                {option.label}
                <span
                  className={cn(
                    "rounded-full px-2 text-sm",
                    active ? "bg-white/20" : "bg-slate-100 text-brand-muted",
                  )}
                >
                  {counts[option.value]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="space-y-2">
          <label htmlFor="filtro-autor" className="block text-sm font-medium text-brand-muted">
            Autor
          </label>
          <Select
            value={filter.author || ALL_AUTHORS}
            onValueChange={(value) =>
              router.push(
                newsListHref(filter, { author: value === ALL_AUTHORS ? "" : value, page: 1 }),
              )
            }
          >
            <SelectTrigger id="filtro-autor" className="h-11 w-full sm:w-80">
              {/* Texto explícito: se ve desde la primera carga, antes de que arranque la página. */}
              <SelectValue>{authorLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_AUTHORS}>Todos los autores</SelectItem>
              {mine ? (
                <SelectItem value={mine.id} hint={mine.count}>
                  Mis noticias
                </SelectItem>
              ) : null}
              <SelectSeparator />
              {others.map((author) => (
                <SelectItem key={author.id} value={author.id} hint={author.count}>
                  {author.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {filtered ? (
          <Link
            href="/admin/noticias"
            className={cn(buttonVariants({ variant: "ghost" }), "h-11 text-base text-brand-navy")}
          >
            <X aria-hidden="true" />
            Quitar filtros
          </Link>
        ) : null}
      </div>
    </div>
  );
}

/** Números de página a mostrar: los extremos, la actual y sus vecinas; el resto con «…». */
function pageItems(page: number, pageCount: number) {
  const wanted = new Set([1, pageCount, page - 1, page, page + 1]);
  const pages = [...wanted].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);
  const items: (number | "…")[] = [];
  pages.forEach((n, i) => {
    if (i > 0 && n - pages[i - 1]! > 1) items.push("…");
    items.push(n);
  });
  return items;
}

export function NewsPagination({
  filter,
  pageCount,
  matching,
  pageSize,
}: {
  filter: ListFilter;
  pageCount: number;
  matching: number;
  pageSize: number;
}) {
  if (matching === 0) return null;
  const from = (filter.page - 1) * pageSize + 1;
  const to = Math.min(filter.page * pageSize, matching);
  const step = "min-h-11 px-4 text-base";

  return (
    <nav
      aria-label="Páginas del listado"
      className="flex flex-col items-center justify-between gap-3 sm:flex-row"
    >
      <p className="text-base text-brand-muted">
        Mostrando {from}–{to} de {matching} {matching === 1 ? "noticia" : "noticias"}
      </p>
      {pageCount > 1 ? (
        <div className="flex flex-wrap items-center gap-2">
          {filter.page > 1 ? (
            <Link
              href={newsListHref(filter, { page: filter.page - 1 })}
              className={cn(buttonVariants({ variant: "outline" }), step)}
            >
              <ChevronLeft aria-hidden="true" />
              Anterior
            </Link>
          ) : null}
          <span className="sr-only">
            Página {filter.page} de {pageCount}
          </span>
          {pageItems(filter.page, pageCount).map((item, i) =>
            item === "…" ? (
              <span key={`gap-${i}`} aria-hidden="true" className="px-1 text-brand-muted">
                …
              </span>
            ) : (
              <Link
                key={item}
                href={newsListHref(filter, { page: item })}
                aria-current={item === filter.page ? "page" : undefined}
                aria-label={`Página ${item}`}
                className={cn(
                  "grid size-11 place-items-center rounded-md border text-base font-medium",
                  item === filter.page
                    ? "border-brand-navy bg-brand-navy text-white"
                    : "border-brand-border bg-white text-brand-navy hover:border-brand-navy",
                )}
              >
                {item}
              </Link>
            ),
          )}
          {filter.page < pageCount ? (
            <Link
              href={newsListHref(filter, { page: filter.page + 1 })}
              className={cn(buttonVariants({ variant: "outline" }), step)}
            >
              Siguiente
              <ChevronRight aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      ) : null}
    </nav>
  );
}
