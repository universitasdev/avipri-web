/**
 * Borrador local de una noticia: lo escrito se guarda en el navegador mientras se trabaja,
 * para recuperarlo si se cierra la pestaña o se va la luz antes de guardar.
 * Solo texto y opciones; las fotos, el video y el PDF no se pueden guardar aquí.
 */
export type NewsDraft = {
  savedAt: string;
  title: string;
  subtitle: string;
  publishedAt: string;
  lead: string;
  pointsLabel: string;
  points: { title: string; body: string }[];
  cta: string;
  href: string;
  imageAlt: string;
  categoryId: string;
  tags: string[];
  isReview: boolean;
  externalSource: string;
  externalUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  youtubeInput: string;
};

/** Por persona y noticia: dos editoras en el mismo computador no se mezclan. */
export function newsDraftKey(userId: string, articleId?: string) {
  return `pdul:borrador:${userId}:${articleId ?? "nueva"}`;
}

/** Texto guardado tal cual (un string, para useSyncExternalStore). */
export function readNewsDraftRaw(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Borrador utilizable, o null. Si la noticia se guardó después del borrador (por ejemplo
 * desde otro computador), el borrador ya no sirve y se ignora.
 */
export function parseNewsDraft(raw: string | null, updatedAt?: string): NewsDraft | null {
  if (!raw) return null;
  try {
    const draft = JSON.parse(raw) as NewsDraft;
    if (!draft || typeof draft.savedAt !== "string" || typeof draft.title !== "string") return null;
    if (updatedAt && new Date(draft.savedAt) <= new Date(updatedAt)) return null;
    return {
      ...draft,
      points: Array.isArray(draft.points) ? draft.points : [],
      tags: Array.isArray(draft.tags) ? draft.tags : [],
    };
  } catch {
    return null;
  }
}

export function writeNewsDraft(key: string, draft: NewsDraft) {
  try {
    localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Sin espacio o almacenamiento bloqueado: se sigue sin borrador.
  }
}

export function clearNewsDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Nada que borrar.
  }
}
