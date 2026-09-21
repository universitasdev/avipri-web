"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/admin/ui/alert";
import { Badge } from "@/components/admin/ui/badge";
import { Button, buttonVariants } from "@/components/admin/ui/button";
import { Card } from "@/components/admin/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { adminFetch, readError } from "@/components/admin/admin-fetch";
import { cn } from "@/lib/utils";

export type AdminVideoItem = {
  id: string;
  youtubeId: string;
  badge: string;
  title: string;
  body: string;
  href: string;
  thumbnail: string | null;
  publishedAt: string | null;
  published: boolean;
};

export function VideoManager({ videos }: { videos: AdminVideoItem[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function remove(id: string) {
    if (!window.confirm("¿Quitar esta videoconferencia del Aula Ciudad?")) return;
    const response = await adminFetch(`/api/admin/videos/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError(await readError(response));
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-navy">Videoconferencias</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Pega el enlace de YouTube. El sitio arma la tarjeta y la miniatura.
          </p>
        </div>
        <Link href="/admin/videos/nuevo" className={cn(buttonVariants())}>
          Nueva videoconferencia
        </Link>
      </div>

      {error ? <Alert>{error}</Alert> : null}

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>YouTube</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {videos.map((video) => (
              <TableRow key={video.id}>
                <TableCell className="max-w-xl font-medium text-brand-navy">{video.title}</TableCell>
                <TableCell className="font-mono text-xs">{video.youtubeId}</TableCell>
                <TableCell>
                  <Badge variant={video.published ? "success" : "warning"}>
                    {video.published ? "Publicada" : "Borrador"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Link
                    href={`/admin/videos/${video.id}`}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Editar
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-2 text-red-700"
                    onClick={() => remove(video.id)}
                  >
                    Eliminar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
