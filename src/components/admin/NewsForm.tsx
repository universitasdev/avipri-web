"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Alert } from "@/components/admin/ui/alert";
import { Button, buttonVariants } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { DatePicker } from "@/components/admin/ui/date-picker";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Textarea } from "@/components/admin/ui/textarea";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { adminFetch, readError } from "@/components/admin/admin-fetch";
import { cn } from "@/lib/utils";
import type { AdminNewsItem } from "@/components/admin/NewsManager";

type Point = { title: string; body: string };
type SavePhase = "idle" | "uploading" | "saving";

const CATEGORIES = [
  { id: "institucional", label: "Análisis Institucional" },
  { id: "doctrina", label: "Doctrina Legal" },
  { id: "vuf", label: "Retiros y VUF" },
  { id: "aula", label: "Aula Ciudad" },
] as const;

function parsePoints(raw: string | null) {
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [{ title: "", body: "" }];
    const points = parsed.filter(Boolean).map((item) => ({
      title: String((item as Point).title ?? ""),
      body: String((item as Point).body ?? ""),
    }));
    return points.length > 0 ? points : [{ title: "", body: "" }];
  } catch {
    return [{ title: "", body: "" }];
  }
}

function toDateInput(value?: string, fallback?: string) {
  if (value) return value.slice(0, 10);
  return fallback ?? "";
}

function Field({
  id,
  label,
  hint,
  className,
  children,
}: {
  id?: string;
  label: string;
  hint: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={id}>{label}</Label>
      <p className="text-xs leading-relaxed text-brand-muted">{hint}</p>
      {children}
    </div>
  );
}

async function uploadNewsImage(file: File) {
  const body = new FormData();
  body.append("file", file);
  const response = await adminFetch("/api/admin/uploads/image", {
    method: "POST",
    body,
  });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
  const data = (await response.json()) as { url?: string };
  if (!data.url) {
    throw new Error("No se pudo guardar la imagen.");
  }
  return data.url;
}

function visibilityDescription(published: boolean, featured: boolean) {
  if (!published) return "Quedó como borrador: el público no la ve.";
  if (featured) return "Ya es visible en el Observatorio y está destacada en portada.";
  return "Ya es visible en el Observatorio.";
}

export function NewsForm({
  article,
  today,
}: {
  article?: AdminNewsItem;
  today?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [phase, setPhase] = useState<SavePhase>("idle");
  const [points, setPoints] = useState<Point[]>(() => parsePoints(article?.pointsJson ?? "[]"));
  const isEdit = Boolean(article?.id);
  const pending = phase === "uploading" || phase === "saving";

  useEffect(() => {
    if (searchParams.get("estado") !== "creada" || !article?.id) return;
    toast.success("Noticia creada", {
      description: visibilityDescription(article.published, article.featured),
      action: {
        label: "Ver Observatorio",
        onClick: () => window.open("/observatorio", "_blank", "noopener,noreferrer"),
      },
    });
    router.replace(`/admin/noticias/${article.id}`, { scroll: false });
  }, [searchParams, router, article?.id, article?.published, article?.featured]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const form = new FormData(event.currentTarget);
    const category = String(form.get("category"));
    const imageFile = form.get("imageFile");
    let imageSrc = String(form.get("imageSrc") ?? "") || null;
    const published = form.get("published") === "on";
    const featured = form.get("featured") === "on";

    try {
      if (imageFile instanceof File && imageFile.size > 0) {
        setPhase("uploading");
        imageSrc = await uploadNewsImage(imageFile);
      }
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : "No se pudo subir la imagen.";
      setError(message);
      toast.error("No se pudo subir la imagen", { description: message });
      setPhase("idle");
      return;
    }

    setPhase("saving");
    const payload = {
      category,
      categoryLabel:
        String(form.get("categoryLabel") ?? "") ||
        CATEGORIES.find((item) => item.id === category)?.label ||
        category,
      publishedAt: `${String(form.get("publishedAt"))}T12:00:00.000Z`,
      title: String(form.get("title") ?? ""),
      subtitle: String(form.get("subtitle") ?? ""),
      lead: String(form.get("lead") ?? "") || null,
      pointsLabel: String(form.get("pointsLabel") ?? "") || null,
      points: points.filter((point) => point.title.trim() && point.body.trim()),
      eventDetailsLabel: String(form.get("eventDetailsLabel") ?? "") || null,
      cta: String(form.get("cta") ?? "") || null,
      href: String(form.get("href") ?? "") || null,
      imageSrc,
      imageAlt: String(form.get("imageAlt") ?? "") || null,
      featured,
      published,
    };

    const response = await adminFetch(
      isEdit ? `/api/admin/news/${article!.id}` : "/api/admin/news",
      {
        method: isEdit ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      },
    );

    if (!response.ok) {
      const message = await readError(response);
      setError(message);
      toast.error("No se pudo guardar la noticia", { description: message });
      setPhase("idle");
      return;
    }

    const data = (await response.json()) as { article?: { id?: string } };
    setPhase("idle");

    if (!isEdit) {
      const createdId = data.article?.id;
      router.push(
        createdId
          ? `/admin/noticias/${createdId}?estado=creada`
          : "/admin/noticias?estado=creada",
      );
      router.refresh();
      return;
    }

    toast.success("Noticia guardada", {
      description: visibilityDescription(published, featured),
      action: {
        label: "Ver Observatorio",
        onClick: () => window.open("/observatorio", "_blank", "noopener,noreferrer"),
      },
    });
    router.refresh();
  }

  const submitLabel =
    phase === "uploading"
      ? "Subiendo imagen…"
      : phase === "saving"
        ? "Guardando…"
        : isEdit
          ? "Guardar cambios"
          : "Publicar noticia";

  return (
    <div className="space-y-6 pb-28">
      <div>
        <p className="text-sm text-brand-muted">
          <Link href="/admin/noticias" className="hover:text-brand-navy hover:underline">
            Noticias
          </Link>
          <span className="mx-2">/</span>
          {isEdit ? "Editar" : "Nueva"}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-brand-navy">
          {isEdit ? "Editar noticia" : "Nueva noticia"}
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-brand-muted">
          Cada campo tiene una nota debajo del nombre. Lo que escribas aquí es lo que verá el
          público en el Observatorio y, si la marcas como destacada, también en la portada.
        </p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Encabezado</CardTitle>
            <CardDescription>
              Es lo primero que se lee: título, subtítulo, fecha y tipo de noticia.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field
              id="title"
              label="Título"
              hint="Frase principal, como el titular de un periódico. Aparece grande, en negrita, sobre la noticia."
              className="md:col-span-2"
            >
              <Input id="title" name="title" required defaultValue={article?.title ?? ""} maxLength={300} />
            </Field>
            <Field
              id="subtitle"
              label="Subtítulo"
              hint="Antes se llamaba “bajada”: es el párrafo corto justo debajo del título. Resume la noticia en una o dos frases para quien no vaya a leer el texto completo."
              className="md:col-span-2"
            >
              <Textarea
                id="subtitle"
                name="subtitle"
                required
                defaultValue={article?.subtitle ?? ""}
                maxLength={600}
                rows={3}
                placeholder="Ejemplo: El Decreto Municipal N° 48-2026 abre la hoja de ruta participativa del PDUL Iribarren a 20 años."
              />
            </Field>
            <Field
              id="publishedAt"
              label="Fecha de publicación"
              hint="Fecha que se muestra junto a la noticia. No hace falta que coincida con el día en que la guardas."
            >
              <DatePicker
                id="publishedAt"
                name="publishedAt"
                required
                defaultValue={toDateInput(article?.publishedAt, today)}
              />
            </Field>
            <Field
              id="category"
              label="Categoría"
              hint="Clasifica la noticia en el Observatorio: análisis institucional, doctrina, retiros/VUF o Aula Ciudad. Cambia el color de la etiqueta."
            >
              <select
                id="category"
                name="category"
                defaultValue={article?.category ?? "institucional"}
                className="flex h-10 w-full rounded-md border border-brand-border bg-white px-3 text-sm"
              >
                {CATEGORIES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              id="categoryLabel"
              label="Texto de la etiqueta"
              hint="Palabras que salen en la pastilla de color (por ejemplo “Análisis Institucional”). Si lo dejas igual que la categoría, no hay que tocarlo."
              className="md:col-span-2"
            >
              <Input
                id="categoryLabel"
                name="categoryLabel"
                defaultValue={article?.categoryLabel ?? "Análisis Institucional"}
                maxLength={80}
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cuerpo de la noticia</CardTitle>
            <CardDescription>
              El párrafo de entrada abre la lectura. Los puntos de análisis van en una caja aparte.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Field
              id="lead"
              label="Párrafo de entrada"
              hint="Texto largo opcional, debajo del subtítulo. Cuenta el hecho con más detalle. Si lo dejas vacío, la noticia se muestra solo con título, subtítulo y puntos."
            >
              <Textarea id="lead" name="lead" defaultValue={article?.lead ?? ""} rows={6} />
            </Field>
            <Field
              id="pointsLabel"
              label="Título de los puntos de análisis"
              hint="Encabezado opcional de la caja de viñetas, por ejemplo “Ejes temáticos del encuentro”. Si no lo usas, las viñetas se muestran sin título."
            >
              <Input
                id="pointsLabel"
                name="pointsLabel"
                defaultValue={article?.pointsLabel ?? ""}
                maxLength={120}
                placeholder="Opcional"
              />
            </Field>
            <div className="space-y-3">
              <p className="text-sm font-medium text-brand-navy">Puntos de análisis</p>
              <p className="text-xs leading-relaxed text-brand-muted">
                Cada punto tiene un título corto (en negrita) y una explicación. Sirven para
                destacar 2 o 3 ideas clave, no para copiar todo el artículo.
              </p>
              {points.map((point, index) => (
                <div key={index} className="grid gap-3 rounded-lg border border-brand-border p-3 md:grid-cols-2">
                  <Input
                    value={point.title}
                    placeholder="Título del punto"
                    maxLength={200}
                    onChange={(event) =>
                      setPoints((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, title: event.target.value } : item,
                        ),
                      )
                    }
                  />
                  <Textarea
                    value={point.body}
                    placeholder="Explicación"
                    onChange={(event) =>
                      setPoints((current) =>
                        current.map((item, i) =>
                          i === index ? { ...item, body: event.target.value } : item,
                        ),
                      )
                    }
                  />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPoints((current) => [...current, { title: "", body: "" }])}
              >
                Añadir punto
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imagen de portada</CardTitle>
            <CardDescription>
              Sube un archivo desde tu computador. En producción se guarda en Cloud Storage; en local
              puede usarse la carpeta{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">public/uploads/news/</code>
              . Se muestra a la izquierda de la noticia destacada y en la portada.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field
              label="Foto"
              hint="JPG, PNG o WebP, máximo 3 MB. No uses un enlace de internet: elige el archivo con el botón. Si no subes foto, el sitio muestra un recuadro institucional."
            >
              <ImageUpload currentSrc={article?.imageSrc} />
            </Field>
            <Field
              id="imageAlt"
              label="Descripción de la foto"
              hint="Frase que dice qué se ve en la imagen, para personas que no pueden verla y para buscadores. Ejemplo: “Promulgación del Decreto de Inicio del PDUL Iribarren”."
            >
              <Input
                id="imageAlt"
                name="imageAlt"
                defaultValue={article?.imageAlt ?? ""}
                maxLength={200}
                placeholder="Describe la foto en una frase"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Botón opcional</CardTitle>
            <CardDescription>
              Solo las noticias del listado del Observatorio pueden llevar un enlace (por ejemplo,
              a una inscripción). Si no lo necesitas, déjalo vacío.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field
              id="cta"
              label="Texto del botón"
              hint="Lo que se lee en el enlace, por ejemplo “Inscribirme a la videoconferencia”. Si no hay texto, no se muestra ningún botón."
            >
              <Input id="cta" name="cta" defaultValue={article?.cta ?? ""} maxLength={160} />
            </Field>
            <Field
              id="href"
              label="Dirección del botón"
              hint="Página a la que lleva el botón. Debe ser un enlace https o una ruta interna que empiece por /."
            >
              <Input
                id="href"
                name="href"
                defaultValue={article?.href ?? ""}
                placeholder="https://"
              />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visibilidad</CardTitle>
            <CardDescription>
              Controla si la noticia se publica y si abre el Observatorio.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="featured"
                className="mt-1"
                defaultChecked={article?.featured ?? false}
              />
              <span>
                <span className="font-medium text-brand-navy">Destacada en portada</span>
                <span className="mt-1 block text-xs leading-relaxed text-brand-muted">
                  Es la noticia grande del Observatorio y también aparece en el inicio. Solo puede
                  haber una destacada: si marcas esta, se quita la anterior.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                name="published"
                className="mt-1"
                defaultChecked={article?.published ?? true}
              />
              <span>
                <span className="font-medium text-brand-navy">Visible en el sitio</span>
                <span className="mt-1 block text-xs leading-relaxed text-brand-muted">
                  Si lo desmarcas, la noticia queda guardada en el panel pero el público no la ve.
                  Sirve para redactar un borrador.
                </span>
              </span>
            </label>
          </CardContent>
        </Card>

        {error ? <Alert>{error}</Alert> : null}

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-white/95 px-4 py-3 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/85">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-brand-muted sm:text-sm">
              {pending
                ? "No cierres esta página mientras se guarda…"
                : "Revisa los campos y guarda cuando esté lista."}
            </p>
            <div className="flex gap-3">
              <Link href="/admin/noticias" className={cn(buttonVariants({ variant: "outline" }))}>
                Cancelar
              </Link>
              <Button type="submit" disabled={pending}>
                {submitLabel}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
