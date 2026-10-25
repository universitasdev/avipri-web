import type { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/db";
import { NEWS_INCLUDE } from "@/lib/observatorio/getNews";

export const ADMIN_PAGE_SIZE = 10;

export type AdminNewsStatus = "todas" | "publicadas" | "borradores";

/**
 * Filtros del listado del panel, leídos de la dirección (?ver=, ?autor=, ?pagina=) para que
 * al volver de editar se llegue a la misma página filtrada.
 *   autor: "" (todos), "equipo" (noticias sin autor, previas a las cuentas) o el id de un usuario.
 */
export type AdminNewsFilter = { status: AdminNewsStatus; author: string; page: number };

export function parseAdminNewsFilter(params: {
  ver?: string;
  autor?: string;
  pagina?: string;
}): AdminNewsFilter {
  const status: AdminNewsStatus =
    params.ver === "publicadas" || params.ver === "borradores" ? params.ver : "todas";
  const page = Math.max(1, Number.parseInt(params.pagina ?? "1", 10) || 1);
  return { status, author: params.autor?.trim() ?? "", page };
}

function authorWhere(author: string): Prisma.NewsArticleWhereInput {
  if (!author) return {};
  return author === "equipo" ? { createdById: null } : { createdById: author };
}

function statusWhere(status: AdminNewsStatus): Prisma.NewsArticleWhereInput {
  if (status === "publicadas") return { published: true };
  if (status === "borradores") return { published: false };
  return {};
}

export async function getAdminNewsPage(filter: AdminNewsFilter) {
  const prisma = await getPrisma();
  const byAuthor = authorWhere(filter.author);
  const where = { ...byAuthor, ...statusWhere(filter.status) };

  const [total, published, drafts, authors, teamCount] = await Promise.all([
    prisma.newsArticle.count({ where: byAuthor }),
    prisma.newsArticle.count({ where: { ...byAuthor, published: true } }),
    prisma.newsArticle.count({ where: { ...byAuthor, published: false } }),
    // Solo las personas que tienen noticias, con cuántas tiene cada una.
    prisma.user.findMany({
      where: { newsCreated: { some: {} } },
      orderBy: { name: "asc" },
      select: { id: true, name: true, email: true, _count: { select: { newsCreated: true } } },
    }),
    prisma.newsArticle.count({ where: { createdById: null } }),
  ]);

  const matching =
    filter.status === "publicadas" ? published : filter.status === "borradores" ? drafts : total;
  const pageCount = Math.max(1, Math.ceil(matching / ADMIN_PAGE_SIZE));
  // Si la página pedida ya no existe (por ejemplo, tras eliminar la última noticia), se usa la última.
  const page = Math.min(filter.page, pageCount);

  const rows = await prisma.newsArticle.findMany({
    where,
    orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    skip: (page - 1) * ADMIN_PAGE_SIZE,
    take: ADMIN_PAGE_SIZE,
    include: { ...NEWS_INCLUDE, createdBy: { select: { name: true } } },
  });

  return {
    rows,
    page,
    pageCount,
    matching,
    counts: { todas: total, publicadas: published, borradores: drafts },
    authors: [
      // Si dos personas se llaman igual, se agrega el correo para distinguirlas.
      ...authors.map((user) => ({
        id: user.id,
        name: authors.filter((other) => other.name === user.name).length > 1 ? `${user.name} (${user.email})` : user.name,
        count: user._count.newsCreated,
      })),
      ...(teamCount > 0 ? [{ id: "equipo", name: "Equipo editorial (noticias iniciales)", count: teamCount }] : []),
    ],
  };
}
