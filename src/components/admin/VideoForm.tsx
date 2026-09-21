"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/admin/ui/alert";
import { Button, buttonVariants } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { DatePicker } from "@/components/admin/ui/date-picker";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Textarea } from "@/components/admin/ui/textarea";
import { adminFetch, readError } from "@/components/admin/admin-fetch";
import { cn } from "@/lib/utils";
import type { AdminVideoItem } from "@/components/admin/VideoManager";

function toDateInput(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export function VideoForm({ video }: { video?: AdminVideoItem }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const isEdit = Boolean(video?.id);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    const payload = {
      youtube: String(form.get("youtube") ?? ""),
      badge: String(form.get("badge") ?? "Aula Ciudad"),
      title: String(form.get("title") ?? ""),
      body: String(form.get("body") ?? ""),
      thumbnail: String(form.get("thumbnail") ?? "") || null,
      publishedAt: String(form.get("publishedAt") ?? "") || null,
      published: form.get("published") === "on",
    };

    const response = await adminFetch(
      isEdit ? `/api/admin/videos/${video!.id}` : "/api/admin/videos",
      {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      setError(await readError(response));
      setPending(false);
      return;
    }

    router.push("/admin/videos");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-brand-muted">
          <Link href="/admin/videos" className="hover:text-brand-navy hover:underline">
            Videoconferencias
          </Link>
          <span className="mx-2">/</span>
          {isEdit ? "Editar" : "Nueva"}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-brand-navy">
          {isEdit ? "Editar videoconferencia" : "Nueva videoconferencia"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? "Datos del video" : "Añadir video"}</CardTitle>
          <CardDescription>
            Acepta un ID de 11 caracteres o un enlace completo de YouTube.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error ? <Alert>{error}</Alert> : null}
            <div className="space-y-2">
              <Label htmlFor="youtube">Enlace o ID de YouTube</Label>
              <Input
                id="youtube"
                name="youtube"
                required
                defaultValue={video?.youtubeId ?? ""}
                placeholder="https://www.youtube.com/watch?v=..."
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input id="title" name="title" required defaultValue={video?.title ?? ""} maxLength={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badge">Etiqueta</Label>
                <Input id="badge" name="badge" defaultValue={video?.badge ?? "Aula Ciudad"} maxLength={40} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="body">Descripción</Label>
              <Textarea id="body" name="body" required defaultValue={video?.body ?? ""} maxLength={2000} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="publishedAt">Fecha (opcional)</Label>
                <DatePicker
                  id="publishedAt"
                  name="publishedAt"
                  defaultValue={toDateInput(video?.publishedAt ?? null)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thumbnail">Miniatura propia (opcional)</Label>
                <Input id="thumbnail" name="thumbnail" defaultValue={video?.thumbnail ?? ""} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="published" defaultChecked={video?.published ?? true} />
              Visible en Aula Ciudad
            </label>
            <div className="flex gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Guardando…" : "Guardar"}
              </Button>
              <Link href="/admin/videos" className={cn(buttonVariants({ variant: "outline" }))}>
                Cancelar
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
