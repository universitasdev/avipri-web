/**
 * El cuerpo de una noticia (`lead`) puede ser texto plano (noticias anteriores al editor con
 * formato) o HTML del editor. Estas funciones no sanean HTML y sirven también en el navegador;
 * el saneado está en rich-text.ts, solo del servidor.
 */

/** HTML del editor: empieza con un bloque (<p>, <h2>, <ul>…). */
export function looksLikeHtml(value: string) {
  return /^\s*<(p|h[1-6]|ul|ol|blockquote|div)[\s>]/i.test(value);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Texto plano a párrafos: una línea en blanco separa párrafos, como en el formulario anterior. */
export function plainTextToHtml(value: string) {
  return value
    .split(/\n\s*\n/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => `<p>${escapeHtml(text).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

/** Solo el texto, sin etiquetas (para resúmenes cortos). */
export function richTextToPlain(value: string) {
  if (!looksLikeHtml(value)) return value;
  return value
    .replace(/<(br|\/p|\/h[1-6]|\/li|\/blockquote)[^>]*>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
