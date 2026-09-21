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
import { cn } from "@/lib/utils";

export type AdminNewsItem = {
  id: string;
  category: string;
  categoryLabel: string;
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
  featured: boolean;
  published: boolean;
};

function toDateInput(value: string) {
  return value.slice(0, 10);
}

export function NewsManager({ articles }: { articles: AdminNewsItem[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const estado = searchParams.get("estado");
    if (!estado) return;

    if (estado === "creada") {
      toast.success("Noticia creada", {
        description: "Ya está en el listado y lista para editar o revisar en el Observatorio.",
        action: {
          label: "Ver Observatorio",
          onClick: () => window.open("/observatorio", "_blank", "noopener,noreferrer"),
        },
      });
    } else if (estado === "eliminada") {
      toast.success("Noticia eliminada", {
        description: "Se quitó del Observatorio y de la portada.",
      });
    } else if (estado === "actualizada") {
      toast.success("Noticia actualizada", {
        description: "Los cambios ya están disponibles en el sitio público.",
      });
    }

    router.replace("/admin/noticias", { scroll: false });
  }, [searchParams, router]);

  async function remove(id: string, title: string) {
    setDeletingId(id);
    const response = await adminFetch(`/api/admin/news/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (!response.ok) {
      toast.error("No se pudo eliminar", { description: await readError(response) });
      return;
    }
    toast.success("Noticia eliminada", {
      description: `“${title.slice(0, 80)}${title.length > 80 ? "…" : ""}” ya no aparece en el Observatorio.`,
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-navy">Noticias</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Lo que publiques aquí aparece en el Observatorio y en la portada.
          </p>
        </div>
        <Link href="/admin/noticias/nueva" className={cn(buttonVariants())}>
          Nueva noticia
        </Link>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {articles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-sm text-brand-muted">
                  Todavía no hay noticias. Empieza con{" "}
                  <Link href="/admin/noticias/nueva" className="font-medium text-brand-navy underline">
                    Nueva noticia
                  </Link>
                  .
                </TableCell>
              </TableRow>
            ) : (
              articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell>
                    <p className="max-w-xl font-medium text-brand-navy">{article.title}</p>
                    <p className="mt-1 text-xs text-brand-muted">
                      {toDateInput(article.publishedAt)}
                    </p>
                  </TableCell>
                  <TableCell>{article.categoryLabel}</TableCell>
                  <TableCell className="space-x-2">
                    {article.featured ? <Badge>Destacada</Badge> : null}
                    <Badge variant={article.published ? "success" : "warning"}>
                      {article.published ? "Publicada" : "Borrador"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/noticias/${article.id}`}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Editar
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="ml-2 text-red-700"
                          disabled={deletingId === article.id}
                        >
                          {deletingId === article.id ? "Eliminando…" : "Eliminar"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar esta noticia?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se quitará del Observatorio y de la portada. Esta acción no se puede
                            deshacer.
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
