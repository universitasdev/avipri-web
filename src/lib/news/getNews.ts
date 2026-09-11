export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  href: string;
};

/**
 * Contrato de noticias del Observatorio.
 * Hoy devuelve contenido estático vacío; mañana puede leer el panel de AVIPRI.
 */
export async function getNews(): Promise<NewsItem[]> {
  return [];
}
