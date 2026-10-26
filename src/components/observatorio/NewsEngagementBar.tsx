"use client";

import { useEffect, useState } from "react";
import { faEye, faThumbsDown, faThumbsUp } from "@fortawesome/free-regular-svg-icons";
import {
  faThumbsDown as faThumbsDownSolid,
  faThumbsUp as faThumbsUpSolid,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { NewsStats } from "@/lib/observatorio/content";
import { cn } from "@/lib/utils";

type Reaction = "like" | "dislike" | null;
type Engagement = NewsStats & { reaction: Reaction };

const numberFormat = new Intl.NumberFormat("es-VE");

/** La vista se cuenta una vez por sesión del navegador, no en cada recarga. */
function viewedKey(slug: string) {
  return `pdul:vista:${slug}`;
}

function markViewed(slug: string) {
  try {
    if (sessionStorage.getItem(viewedKey(slug))) return false;
    sessionStorage.setItem(viewedKey(slug), "1");
    return true;
  } catch {
    return false;
  }
}

// Petición en curso por noticia. Si el efecto se ejecuta dos veces (modo estricto de React),
// la segunda reutiliza la primera en vez de cancelarla, y así la vista no se pierde.
const inFlight = new Map<string, Promise<Engagement | null>>();

function loadEngagement(endpoint: string, slug: string) {
  let request = inFlight.get(slug);
  if (!request) {
    request = fetch(endpoint, { method: markViewed(slug) ? "POST" : "GET" })
      .then((response) => (response.ok ? (response.json() as Promise<Engagement>) : null))
      .catch(() => null)
      .finally(() => inFlight.delete(slug));
    inFlight.set(slug, request);
  }
  return request;
}

/**
 * Barra de vistas y «Me gusta» / «No me gusta» bajo la noticia, como en PDUL YA.
 * Un voto por navegador: pulsar de nuevo el mismo botón lo quita y pulsar el otro lo cambia.
 */
export function NewsEngagementBar({ slug, initial }: { slug: string; initial: NewsStats }) {
  const [state, setState] = useState<Engagement>({ ...initial, reaction: null });
  const [saving, setSaving] = useState(false);
  const endpoint = `/api/noticias/${encodeURIComponent(slug)}/interacciones`;

  useEffect(() => {
    let active = true;
    loadEngagement(endpoint, slug).then((data) => {
      if (active && data) setState(data);
    });
    return () => {
      active = false;
    };
  }, [endpoint, slug]);

  async function react(choice: Exclude<Reaction, null>) {
    if (saving) return;
    const previous = state;
    const next: Reaction = state.reaction === choice ? null : choice;
    // Se muestra el cambio al instante y se corrige con la respuesta del servidor.
    setState({
      ...state,
      reaction: next,
      likes: state.likes + (next === "like" ? 1 : 0) - (state.reaction === "like" ? 1 : 0),
      dislikes:
        state.dislikes + (next === "dislike" ? 1 : 0) - (state.reaction === "dislike" ? 1 : 0),
    });
    setSaving(true);
    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reaccion: next }),
      });
      if (!response.ok) throw new Error();
      setState((await response.json()) as Engagement);
    } catch {
      setState(previous);
    } finally {
      setSaving(false);
    }
  }

  const button =
    "inline-flex min-h-12 items-center gap-2.5 rounded-full border px-5 text-base font-bold transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.97] disabled:cursor-wait";

  return (
    <section
      aria-label="Vistas y valoración de la noticia"
      className="flex flex-col gap-4 rounded-2xl border border-brand-border bg-white px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-8"
    >
      <p className="flex items-center gap-2 text-slate-500">
        <FontAwesomeIcon icon={faEye} className="text-lg" aria-hidden="true" />
        <span>
          <strong className="font-bold text-brand-navy">{numberFormat.format(state.views)}</strong>{" "}
          {state.views === 1 ? "vista" : "vistas"}
        </span>
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          aria-pressed={state.reaction === "like"}
          disabled={saving}
          onClick={() => react("like")}
          className={cn(
            button,
            state.reaction === "like"
              ? "border-brand-navy bg-brand-navy text-white"
              : "border-slate-200 text-brand-navy hover:border-brand-navy/40 hover:bg-slate-50",
          )}
        >
          <FontAwesomeIcon
            icon={state.reaction === "like" ? faThumbsUpSolid : faThumbsUp}
            aria-hidden="true"
          />
          Me gusta
          <span className="tabular-nums">{numberFormat.format(state.likes)}</span>
        </button>
        <button
          type="button"
          aria-pressed={state.reaction === "dislike"}
          disabled={saving}
          onClick={() => react("dislike")}
          className={cn(
            button,
            state.reaction === "dislike"
              ? "border-brand-terracotta bg-brand-terracotta text-white"
              : "border-slate-200 text-brand-navy hover:border-brand-navy/40 hover:bg-slate-50",
          )}
        >
          <FontAwesomeIcon
            icon={state.reaction === "dislike" ? faThumbsDownSolid : faThumbsDown}
            aria-hidden="true"
          />
          No me gusta
          <span className="tabular-nums">{numberFormat.format(state.dislikes)}</span>
        </button>
      </div>
    </section>
  );
}
