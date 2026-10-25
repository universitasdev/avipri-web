"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/admin/ui/badge";
import { Button, buttonVariants } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/admin/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { adminFetch, readError } from "@/components/admin/admin-fetch";
import { ResultBanner } from "@/components/admin/ui/result-banner";
import {
  NewsFilters,
  NewsPagination,
  newsListHref,
  rememberNewsList,
  type ListFilter,
} from "@/components/admin/NewsListControls";

const PAGE_SIZE = 10;

type OutcomeArticle = { id: string; slug: string; title: string; published: boolean };
import { cn } from "@/lib/utils";

export type AdminNewsItem = {
  id: string;
  categoryId: string;
  categoryName: string;
  tags: string[];
  externalSource: string | null;
  externalUrl: string | null;
  publishedAt: string;
  title: string;
  subtitle: string;
  lead: string | null;
  pointsLabel: string | null;
  pointsJson: string;
  eventDetailsLabel: string | null;
  eventDetailsJson: string | null;
  cta: string | null;
  href: string | null;
  imageSrc: string | null;
  imageAlt: string | null;
  mediaType: "IMAGE" | "VIDEO";
  images: { src: string; alt: string | null }[];
  videoYoutubeId: string | null;
  videoFileSrc: string | null;
  attachmentSrc: string | null;
  attachmentName: string | null;
  attachmentBytes: number | null;
  featured: boolean;
  published: boolean;
};

export type AdminNewsListItem = AdminNewsItem & {
  slug: string;
  authorName: string | null;
  canEdit: boolean;
};

function toDateInput(value: string) {
  return value.slice(0, 10);
}

type Outcome = { kind: "creada" | "actualizada" | "eliminada"; id?: string; title?: string };

function shortTitle(title: string) {
  return title.length > 90 ? `${title.slice(0, 90)}…` : title;
}

/** Aviso fijo con el resultado de publicar, guardar o eliminar una noticia. */
function OutcomeBanner({
  outcome,
  article,
  onClose,
}: {
  outcome: Outcome;
  article?: OutcomeArticle | null;
  onClose: () => void;
}) {
  const link = article ? (
    <a
      href={`/observatorio/${article.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ size: "lg" }))}
    >
      Ver la noticia en el sitio
      <span className="sr-only">(se abre en otra pestaña)</span>
    </a>
  ) : null;

  if (outcome.kind === "eliminada") {
    return (
      <ResultBanner title="Noticia eliminada" onClose={onClose}>
        {outcome.title ? `«${shortTitle(outcome.title)}» ` : "La noticia "}ya no aparece en el
        Observatorio.
      </ResultBanner>
    );
  }

  if (article && !article.published) {
    return (
      <ResultBanner
        tone="info"
        title={outcome.kind === "creada" ? "Tu noticia quedó guardada como borrador" : "Borrador guardado"}
        onClose={onClose}
        actions={
          <Link href={`/admin/noticias/${article.id}`} className={cn(buttonVariants({ size: "lg" }))}>
            Seguir editando
          </Link>
        }
      >
        «{shortTitle(article.title)}» está guardada en el panel, pero el público todavía no la ve.
        Para publicarla, edítala y marca «Visible en el sitio».
      </ResultBanner>
    );
  }

  return (
    <ResultBanner
      title={outcome.kind === "creada" ? "Tu noticia ya está publicada" : "Cambios guardados"}
      onClose={onClose}
      actions={
        <>
          {link}
          {outcome.kind === "creada" ? (
            <Link
              href="/admin/noticias/nueva"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Crear otra noticia
            </Link>
          ) : null}
        </>
      }
    >
      {article
        ? `«${shortTitle(article.title)}» ya se ve en el Observatorio del sitio público.`
        : "Ya se ve en el Observatorio del sitio público."}
    </ResultBanner>
  );
}

export function NewsManager({
  articles,
  outcomeArticle,
  filter,
  pageCount,
  matching,
  counts,
  authors,
  currentUserId,
}: {
  articles: AdminNewsListItem[];
  /** La noticia recién publicada o guardada (puede no estar en esta página). */
  outcomeArticle: OutcomeArticle | null;
  filter: ListFilter;
  pageCount: number;
  matching: number;
  counts: Record<ListFilter["status"], number>;
  authors: { id: string; name: string; count: number }[];
  currentUserId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  // El formulario llega aquí con ?estado=…&id=… después de publicar o guardar.
  const [outcome, setOutcome] = useState<Outcome | null>(() => {
    const estado = searchParams.get("estado");
    if (estado !== "creada" && estado !== "actualizada" && estado !== "eliminada") return null;
    return { kind: estado, id: searchParams.get("id") ?? undefined };
  });

  useEffect(() => {
    rememberNewsList(newsListHref(filter));
  }, [filter]);

  // Se limpia la dirección (sin perder los filtros) para que el aviso no vuelva a salir al recargar.
  useEffect(() => {
    if (searchParams.get("estado")) router.replace(newsListHref(filter), { scroll: false });
  }, [searchParams, router, filter]);

  async function remove(id: string, title: string) {
    setDeletingId(id);
    const response = await adminFetch(`/api/admin/news/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!response.ok) {
      toast.error("No se pudo eliminar", { description: await readError(response) });
      return;
    }
    setOutcome({ kind: "eliminada", title });
    router.refresh();
  }

  const filtered = filter.status !== "todas" || Boolean(filter.author);

  return (
    <div className="space-y-6">
      {outcome ? (
        <OutcomeBanner
          outcome={outcome}
          article={outcome.id && outcomeArticle?.id === outcome.id ? outcomeArticle : undefined}
          onClose={() => setOutcome(null)}
        />
      ) : null}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-navy">Noticias</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Lo que publiques aquí aparece en el Observatorio y en la portada.
          </p>
        </div>
        <Link href="/admin/noticias/nueva" className={cn(buttonVariants({ size: "lg" }), "text-base")}>
          + Nueva noticia
        </Link>
      </div>

      <NewsFilters filter={filter} counts={counts} authors={authors} currentUserId={currentUserId} />

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Autor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 && filtered ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-base text-brand-muted">
                  No hay noticias con estos filtros.{" "}
                  <Link href="/admin/noticias" className="font-medium text-brand-navy underline">
                    Ver todas las noticias
                  </Link>
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-base text-brand-muted">
                  Todavía no hay noticias. Empieza con{" "}
                  <Link href="/admin/noticias/nueva" className="font-medium text-brand-navy underline">
                    Nueva noticia
                  </Link>
                  .
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow
                  key={article.id}
                  className={cn(article.id === outcome?.id && "bg-emerald-50 hover:bg-emerald-50")}
                >
                  <TableCell>
                    <p className="max-w-xl font-medium text-brand-navy">{article.title}</p>
                    <p className="mt-1 text-xs text-brand-muted">
                      {toDateInput(article.publishedAt)}
                    </p>
                  </TableCell>
                  <TableCell>{article.categoryName}</TableCell>
                  <TableCell className="text-sm text-brand-muted">
                    {article.authorName ?? "Equipo editorial"}
                  </TableCell>
                  <TableCell className="space-x-2">
                    {article.featured ? <Badge>Destacada</Badge> : null}
                    <Badge variant={article.published ? "success" : "warning"}>
                      {article.published ? "Publicada" : "Borrador"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {article.canEdit ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        <Link
                          href={`/admin/noticias/${article.id}`}
                          className={cn(buttonVariants({ variant: "outline" }))}
                        >
                          Editar
                        </Link>
                        <a
                          href={`/observatorio/vista-previa/${article.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(buttonVariants({ variant: "ghost" }), "text-brand-navy")}
                        >
                          Vista previa
                          <span className="sr-only">(se abre en otra pestaña)</span>
                        </a>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              className="text-red-700 hover:bg-red-50 hover:text-red-800"
                              disabled={deletingId === article.id}
                            >
                              {deletingId === article.id ? "Eliminando…" : "Eliminar"}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar esta noticia?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se quitará del Observatorio y de la portada. Esta acción no se
                                puede deshacer.
                                <span className="mt-3 block font-medium text-brand-navy">
                                  {article.title}
                                </span>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-700 text-white hover:bg-red-800"
                                onClick={() => remove(article.id, article.title)}
                              >
                                Sí, eliminar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    ) : (
                      <span className="text-sm text-brand-muted">Solo lectura</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <NewsPagination filter={filter} pageCount={pageCount} matching={matching} pageSize={PAGE_SIZE} />
    </div>
  );
}
