import sanitizeHtml from "sanitize-html";
import { looksLikeHtml, plainTextToHtml, richTextToPlain } from "@/lib/observatorio/plain-text";

/**
 * Saneado del cuerpo con formato. Solo lo que ofrece el editor del panel: párrafos, negrita,
 * cursiva, subtítulos, listas, citas y enlaces https o mailto. Todo lo demás (scripts,
 * estilos, atributos on*, javascript:) se elimina. Solo se usa en el servidor.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["p", "br", "strong", "em", "u", "s", "h2", "h3", "ul", "ol", "li", "blockquote", "a"],
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["https", "mailto"],
  allowProtocolRelative: false,
  // Párrafos vacíos (Enter de más): solo dejan huecos en la página.
  exclusiveFilter: (frame) => frame.tag === "p" && !frame.text.trim(),
  transformTags: {
    b: "strong",
    i: "em",
    h1: "h2",
    h4: "h3",
    h5: "h3",
    h6: "h3",
    a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
  },
};

export function sanitizeNewsHtml(html: string) {
  return sanitizeHtml(html, OPTIONS).trim();
}

/**
 * Lo que se guarda en `lead`: el HTML del editor ya saneado, o el texto plano tal cual.
 * Un editor vacío (<p></p>) queda en null.
 */
export function normalizeLead(value: string | null | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (!looksLikeHtml(trimmed)) return trimmed;
  const clean = sanitizeNewsHtml(trimmed);
  return richTextToPlain(clean) ? clean : null;
}

/** HTML listo para mostrar: el texto plano viejo pasa a párrafos y el HTML se vuelve a sanear. */
export function leadToHtml(lead: string | null | undefined) {
  if (!lead?.trim()) return undefined;
  const html = looksLikeHtml(lead) ? sanitizeNewsHtml(lead) : plainTextToHtml(lead);
  return html || undefined;
}
