"use client";

import { FormEvent, ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { Alert } from "@/components/admin/ui/alert";
import { Button, buttonVariants } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { DatePicker } from "@/components/admin/ui/date-picker";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { Progress } from "@/components/admin/ui/progress";
import { Stepper } from "@/components/admin/ui/stepper";
import { Textarea } from "@/components/admin/ui/textarea";
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
import { ImageUpload } from "@/components/admin/ImageUpload";
import { GalleryUpload, photosFromImages, type GalleryPhoto } from "@/components/admin/GalleryUpload";
import {
  DocumentUpload,
  uploadNewsDocument,
  type NewsDocumentDraft,
} from "@/components/admin/DocumentUpload";
import { VideoUpload, uploadNewsVideo } from "@/components/admin/VideoUpload";
import { extractYoutubeId } from "@/lib/admin/schemas";
import { adminFetch, readError } from "@/components/admin/admin-fetch";
import { formatBytes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminNewsItem } from "@/components/admin/NewsManager";

type Point = { title: string; body: string };
type SavePhase = "idle" | "uploading" | "saving";
type MediaType = "IMAGE" | "VIDEO";
type VideoSource = "YOUTUBE" | "FILE";
type StepIssue = { field?: string; message: string };

const CATEGORIES = [
  { id: "institucional", label: "Análisis Institucional" },
  { id: "doctrina", label: "Doctrina Legal" },
  { id: "vuf", label: "Retiros y VUF" },
  { id: "aula", label: "Aula Ciudad" },
] as const;

// El formulario se recorre de a un paso para no abrumar: una cosa a la vez.
const STEPS = ["Texto", "Fotos o video", "Documento PDF", "Revisar y publicar"];
const LAST_STEP = STEPS.length - 1;

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

function formatDay(value: string) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-VE", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(`${value}T12:00:00`),
  );
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
      <Label htmlFor={id} className="text-base">
        {label}
      </Label>
      <p className="text-sm leading-relaxed text-brand-muted">{hint}</p>
      {children}
    </div>
  );
}

function ChoiceGroup<T extends string>({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div role="radiogroup" className="inline-flex flex-wrap rounded-lg border border-brand-border bg-slate-50 p-1">
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            "cursor-pointer rounded-md px-5 py-2.5 text-base font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-navy/40",
            value === option.value
              ? "bg-brand-navy text-white shadow-sm"
              : "text-slate-600 hover:text-brand-navy",
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}

/** Fila del resumen del último paso, con un botón para volver a ese paso y cambiarlo. */
function SummaryRow({
  label,
  children,
  onChange,
}: {
  label: string;
  children: ReactNode;
  onChange: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 border-b border-brand-border py-4 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <dt className="text-sm font-medium text-brand-muted">{label}</dt>
        <dd className="mt-1 text-base break-words text-brand-navy">{children}</dd>
      </div>
      <Button variant="outline" onClick={onChange} className="shrink-0">
        Cambiar
      </Button>
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

export function NewsForm({
  article,
  today,
  canFeature = false,
}: {
  article?: AdminNewsItem;
  today?: string;
  canFeature?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const reviewOpenedAt = useRef(0);
  const isEdit = Boolean(article?.id);
  const [step, setStep] = useState(0);
  // Al crear, solo se puede saltar a pasos ya visitados; al editar, a cualquiera.
  const [reached, setReached] = useState(isEdit ? LAST_STEP : 0);
  const [issues, setIssues] = useState<StepIssue[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [phase, setPhase] = useState<SavePhase>("idle");
  const [willPublish, setWillPublish] = useState(article?.published ?? true);
  const [points, setPoints] = useState<Point[]>(() => parsePoints(article?.pointsJson ?? "[]"));
  const [mediaType, setMediaType] = useState<MediaType>(article?.mediaType ?? "IMAGE");
  const [videoSource, setVideoSource] = useState<VideoSource>(
    article?.videoFileSrc ? "FILE" : "YOUTUBE",
  );
  const [youtubeInput, setYoutubeInput] = useState(
    article?.videoYoutubeId ? `https://www.youtube.com/watch?v=${article.videoYoutubeId}` : "",
  );
  const [photos, setPhotos] = useState<GalleryPhoto[]>(() =>
    photosFromImages(article?.images ?? []),
  );
  const [pdfDraft, setPdfDraft] = useState<NewsDocumentDraft | null>(() =>
    article?.attachmentSrc
      ? {
          src: article.attachmentSrc,
          name: article.attachmentName ?? "Documento",
          bytes: article.attachmentBytes ?? 0,
        }
      : null,
  );
  // Mensaje y avance de la subida ("Subiendo foto 2 de 5…", 40 %).
  const [uploadLabel, setUploadLabel] = useState("");
  const [progress, setProgress] = useState<number | undefined>(undefined);
  // Lo escrito en los campos, leído al llegar al último paso para mostrar el resumen.
  const [summary, setSummary] = useState<Record<string, string>>({});
  const youtubePreviewId = youtubeInput.trim() ? extractYoutubeId(youtubeInput) : null;
  const pending = phase !== "idle";

  // Cambios en estado propio (fotos, PDF, opciones): quedan cambios sin guardar.
  function change<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setDirty(true);
    };
  }

  // Si hay cambios sin guardar, el navegador pregunta antes de cerrar o recargar la página.
  useEffect(() => {
    if (!dirty || pending) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, pending]);

  // Por `name` (no `elements.namedItem`, que mezcla id y name: la fecha usa los dos).
  function fieldValue(name: string) {
    const element = formRef.current?.querySelector<HTMLInputElement>(`[name="${name}"]`);
    return element?.value ?? "";
  }

  function validateStep(index: number): StepIssue[] {
    const found: StepIssue[] = [];
    if (index === 0) {
      if (fieldValue("title").trim().length < 8) {
        found.push({ field: "title", message: "Escribe un título de al menos 8 letras." });
      }
      if (fieldValue("subtitle").trim().length < 8) {
        found.push({ field: "subtitle", message: "Escribe un subtítulo de al menos 8 letras." });
      }
      if (!fieldValue("publishedAt")) {
        found.push({ field: "publishedAt", message: "Elige la fecha de publicación." });
      }
    }
    if (index === 1 && mediaType === "VIDEO") {
      if (videoSource === "YOUTUBE" && !youtubePreviewId) {
        found.push({
          field: "videoYoutube",
          message: "Pega el enlace del video de YouTube, o elige «Fotos» si la noticia no lleva video.",
        });
      }
      if (videoSource === "FILE") {
        const input = formRef.current?.querySelector<HTMLInputElement>('[name="videoFile"]');
        if (!input?.files?.length && !fieldValue("videoFileSrc")) {
          found.push({ message: "Sube el archivo de video, o elige «Fotos» si la noticia no lleva video." });
        }
      }
    }
    if (index === 2 && pdfDraft && !pdfDraft.name.trim()) {
      found.push({ message: "Escribe el nombre del documento PDF, o quítalo si no lo necesitas." });
    }
    return found;
  }

  function showIssues(found: StepIssue[]) {
    setIssues(found);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const field = found.find((issue) => issue.field)?.field;
    if (field) document.getElementById(field)?.focus({ preventScroll: true });
  }

  function goTo(index: number) {
    if (index === LAST_STEP) {
      reviewOpenedAt.current = Date.now();
      setSummary({
        title: fieldValue("title"),
        subtitle: fieldValue("subtitle"),
        publishedAt: fieldValue("publishedAt"),
        categoryLabel:
          fieldValue("categoryLabel") ||
          CATEGORIES.find((item) => item.id === fieldValue("category"))?.label ||
          "",
        lead: fieldValue("lead"),
      });
    }
    setIssues([]);
    setError(null);
    setStep(index);
    setReached((current) => Math.max(current, index));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goNext() {
    const found = validateStep(step);
    if (found.length > 0) {
      showIssues(found);
      return;
    }
    goTo(step + 1);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Enter dentro de un campo avanza de paso; solo se publica desde el último.
    if (step < LAST_STEP) {
      goNext();
      return;
    }
    // Un doble clic en "Siguiente" no debe publicar: se ignora el envío si la revisión
    // acaba de aparecer y la persona todavía no pudo leerla.
    if (Date.now() - reviewOpenedAt.current < 1000) return;
    for (let index = 0; index < LAST_STEP; index++) {
      const found = validateStep(index);
      if (found.length > 0) {
        goTo(index);
        showIssues(found);
        return;
      }
    }

    setError(null);
    const form = new FormData(event.currentTarget);
    const category = String(form.get("category"));
    const imageFile = form.get("imageFile");
    let imageSrc = String(form.get("imageSrc") ?? "") || null;
    const videoFile = form.get("videoFile");
    let videoFileSrc = String(form.get("videoFileSrc") ?? "") || null;
    const published = form.get("published") === "on";
    const featured = canFeature ? form.get("featured") === "on" : (article?.featured ?? false);

    let uploading = "la imagen";
    const images: { src: string; alt: string | null }[] = [];
    let attachment: { src: string; name: string; bytes: number } | null = null;
    try {
      setPhase("uploading");
      setProgress(undefined);
      if (mediaType === "IMAGE") {
        // Las fotos nuevas se suben una por una, en el orden de la galería.
        const total = photos.filter((photo) => photo.file).length;
        let done = 0;
        const uploaded: GalleryPhoto[] = [];
        for (const photo of photos) {
          let src = photo.src;
          if (photo.file) {
            uploading = "una de las fotos";
            setUploadLabel(total > 1 ? `Subiendo foto ${done + 1} de ${total}…` : "Subiendo la foto…");
            setProgress(Math.round((done / total) * 100));
            src = await uploadNewsImage(photo.file);
            done++;
          }
          uploaded.push({ ...photo, src, file: undefined });
          images.push({ src: src!, alt: photo.alt.trim() || null });
        }
        // Ya subidas: un segundo guardado no las vuelve a subir.
        setPhotos(uploaded);
      } else if (imageFile instanceof File && imageFile.size > 0) {
        uploading = "la portada del video";
        setUploadLabel("Subiendo la portada del video…");
        imageSrc = await uploadNewsImage(imageFile);
      }

      if (
        mediaType === "VIDEO" &&
        videoSource === "FILE" &&
        videoFile instanceof File &&
        videoFile.size > 0
      ) {
        uploading = "el video";
        setUploadLabel("Subiendo el video…");
        videoFileSrc = await uploadNewsVideo(videoFile, setProgress);
      }

      if (pdfDraft) {
        let src = pdfDraft.src;
        if (pdfDraft.file) {
          uploading = "el PDF";
          setUploadLabel("Subiendo el documento PDF…");
          setProgress(0);
          src = await uploadNewsDocument(pdfDraft.file, setProgress);
          setPdfDraft({ ...pdfDraft, src, file: undefined });
        }
        attachment = { src: src!, name: pdfDraft.name.trim(), bytes: pdfDraft.bytes };
      }
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : `No se pudo subir ${uploading}.`;
      setError(`No se pudo subir ${uploading}. ${message} Revisa tu conexión e inténtalo de nuevo.`);
      toast.error(`No se pudo subir ${uploading}`, { description: message });
      setPhase("idle");
      return;
    }

    setPhase("saving");
    setUploadLabel("Guardando la noticia…");
    setProgress(undefined);
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
      mediaType,
      images: mediaType === "IMAGE" ? images : [],
      // Con video, imageSrc es la portada; con fotos no se usa.
      imageSrc: mediaType === "VIDEO" ? imageSrc : null,
      imageAlt: String(form.get("imageAlt") ?? "") || null,
      attachment,
      videoYoutube: mediaType === "VIDEO" && videoSource === "YOUTUBE" ? youtubeInput : null,
      videoFileSrc: mediaType === "VIDEO" && videoSource === "FILE" ? videoFileSrc : null,
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
      setError(`No se pudo guardar la noticia. ${message}`);
      toast.error("No se pudo guardar la noticia", { description: message });
      setPhase("idle");
      return;
    }

    const data = (await response.json()) as { article?: { id?: string } };
    setDirty(false);
    // De vuelta al listado, donde un aviso fijo confirma el resultado.
    const id = data.article?.id ?? article?.id ?? "";
    router.push(`/admin/noticias?estado=${isEdit ? "actualizada" : "creada"}&id=${id}`);
    router.refresh();
  }

  // El botón dice exactamente lo que va a pasar según la casilla "Visible en el sitio".
  const finalLabel = isEdit
    ? "Guardar cambios"
    : willPublish
      ? "Publicar noticia"
      : "Guardar como borrador";
  const photoCount = photos.length;

  return (
    <div className="space-y-6 pb-36">
      <div>
        <p className="text-base text-brand-muted">
          <Link href="/admin/noticias" className="hover:text-brand-navy hover:underline">
            Noticias
          </Link>
          <span className="mx-2">/</span>
          {isEdit ? "Editar" : "Nueva"}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-brand-navy">
          {isEdit ? "Editar noticia" : "Nueva noticia"}
        </h1>
        <p className="mt-2 max-w-3xl text-base leading-relaxed text-brand-muted">
          {isEdit
            ? "Puedes ir directo al paso que quieras cambiar. Al final, pulsa «Guardar cambios»."
            : "Son 4 pasos. Ve completando cada uno y pulsa «Siguiente». Antes de publicar podrás revisar todo."}
        </p>
      </div>

      <Stepper steps={STEPS} current={step} reachable={reached} onSelect={goTo} />

      {issues.length > 0 ? (
        <Alert className="text-base">
          <p className="font-semibold">Falta completar algo en este paso:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {issues.map((issue) => (
              <li key={issue.message}>{issue.message}</li>
            ))}
          </ul>
        </Alert>
      ) : null}
      {error ? <Alert className="text-base">{error}</Alert> : null}

      <form
        ref={formRef}
        className="space-y-6"
        onSubmit={onSubmit}
        onChange={() => setDirty(true)}
        noValidate
      >
        {/* Los pasos se ocultan en vez de desmontarse: así no se pierde lo escrito al ir y volver. */}
        <section hidden={step !== 0} aria-label="Paso 1: Texto" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paso 1 · Texto de la noticia</CardTitle>
              <CardDescription className="text-base">
                Lo primero que se lee: título, subtítulo, fecha y tipo de noticia.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <Field
                id="title"
                label="Título"
                hint="Frase principal, como el titular de un periódico. Aparece grande, en negrita, sobre la noticia."
                className="md:col-span-2"
              >
                <Input
                  id="title"
                  name="title"
                  required
                  defaultValue={article?.title ?? ""}
                  maxLength={300}
                  aria-invalid={issues.some((issue) => issue.field === "title") || undefined}
                  className="h-12 text-base aria-invalid:border-red-500"
                />
              </Field>
              <Field
                id="subtitle"
                label="Subtítulo"
                hint="El párrafo corto debajo del título. Resume la noticia en una o dos frases."
                className="md:col-span-2"
              >
                <Textarea
                  id="subtitle"
                  name="subtitle"
                  required
                  defaultValue={article?.subtitle ?? ""}
                  maxLength={600}
                  rows={3}
                  aria-invalid={issues.some((issue) => issue.field === "subtitle") || undefined}
                  className="text-base aria-invalid:border-red-500"
                  placeholder="Ejemplo: El Decreto Municipal N° 48-2026 abre la hoja de ruta participativa del PDUL Iribarren a 20 años."
                />
              </Field>
              <Field
                id="publishedAt"
                label="Fecha de publicación"
                hint="Fecha que se muestra junto a la noticia. No hace falta que sea la de hoy."
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
                hint="Tipo de noticia en el Observatorio. Cambia el color de la etiqueta."
              >
                <select
                  id="category"
                  name="category"
                  defaultValue={article?.category ?? "institucional"}
                  className="flex h-12 w-full rounded-md border border-brand-border bg-white px-3 text-base"
                >
                  {CATEGORIES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field
                id="lead"
                label="Texto de la noticia (opcional)"
                hint="Cuenta el hecho con más detalle. Para separar párrafos, deja una línea en blanco entre ellos."
                className="md:col-span-2"
              >
                <Textarea
                  id="lead"
                  name="lead"
                  defaultValue={article?.lead ?? ""}
                  rows={8}
                  className="text-base"
                />
              </Field>
            </CardContent>
          </Card>

          <details className="group rounded-xl border border-brand-border bg-white">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-lg font-semibold text-brand-navy marker:hidden">
              <span>
                Opciones adicionales
                <span className="mt-1 block text-base font-normal text-brand-muted">
                  Puntos de análisis, botón con enlace y texto de la etiqueta. Puedes saltarlas.
                </span>
              </span>
              <ChevronDown
                className="size-6 shrink-0 transition-transform group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <div className="space-y-8 border-t border-brand-border p-5">
              <Field
                id="categoryLabel"
                label="Texto de la etiqueta"
                hint="Palabras de la pastilla de color, por ejemplo «Análisis Institucional». Normalmente no hay que tocarlo."
              >
                <Input
                  id="categoryLabel"
                  name="categoryLabel"
                  defaultValue={article?.categoryLabel ?? "Análisis Institucional"}
                  maxLength={80}
                />
              </Field>

              <div className="space-y-4">
                <Field
                  id="pointsLabel"
                  label="Puntos de análisis"
                  hint="Una caja con 2 o 3 ideas clave, cada una con un título corto y una explicación. Escribe aquí el título de la caja (opcional), por ejemplo «Ejes del encuentro»."
                >
                  <Input
                    id="pointsLabel"
                    name="pointsLabel"
                    defaultValue={article?.pointsLabel ?? ""}
                    maxLength={120}
                    placeholder="Título de la caja (opcional)"
                  />
                </Field>
                {points.map((point, index) => (
                  <div key={index} className="space-y-3 rounded-lg border border-brand-border p-4">
                    <p className="text-sm font-medium text-brand-muted">Punto {index + 1}</p>
                    <Input
                      value={point.title}
                      placeholder="Título corto del punto"
                      aria-label={`Título del punto ${index + 1}`}
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
                      aria-label={`Explicación del punto ${index + 1}`}
                      onChange={(event) =>
                        setPoints((current) =>
                          current.map((item, i) =>
                            i === index ? { ...item, body: event.target.value } : item,
                          ),
                        )
                      }
                    />
                    {points.length > 1 ? (
                      <Button
                        variant="ghost"
                        className="text-red-700"
                        onClick={() => change(setPoints)(points.filter((_, i) => i !== index))}
                      >
                        Quitar este punto
                      </Button>
                    ) : null}
                  </div>
                ))}
                <Button
                  variant="outline"
                  onClick={() => change(setPoints)([...points, { title: "", body: "" }])}
                >
                  + Agregar otro punto
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Field
                  id="cta"
                  label="Botón con enlace: texto"
                  hint="Por ejemplo «Inscribirme a la videoconferencia». Si lo dejas vacío, no aparece ningún botón."
                >
                  <Input id="cta" name="cta" defaultValue={article?.cta ?? ""} maxLength={160} />
                </Field>
                <Field
                  id="href"
                  label="Botón con enlace: dirección"
                  hint="La página a la que lleva el botón. Copia y pega la dirección completa (empieza con https://)."
                >
                  <Input id="href" name="href" defaultValue={article?.href ?? ""} placeholder="https://" />
                </Field>
              </div>
            </div>
          </details>
        </section>

        <section hidden={step !== 1} aria-label="Paso 2: Fotos o video">
          <Card>
            <CardHeader>
              <CardTitle>Paso 2 · Fotos o video</CardTitle>
              <CardDescription className="text-base">
                Elige si la noticia lleva fotos o un video. Con 2 fotos o más se publica como
                galería. Si no tienes fotos, puedes seguir sin ellas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ChoiceGroup
                name="mediaType"
                value={mediaType}
                onChange={change(setMediaType)}
                options={[
                  { value: "IMAGE", label: "Fotos" },
                  { value: "VIDEO", label: "Video" },
                ]}
              />
              {/* Se ocultan en vez de desmontarse para no perder archivos ya elegidos al cambiar de opción. */}
              <div className={cn(mediaType !== "IMAGE" && "hidden")}>
                <Field
                  label="Fotos"
                  hint="JPG, PNG o WebP, de hasta 3 MB cada una y máximo 12. Puedes elegir varias a la vez. La primera es la portada; con los botones «Antes» y «Después» cambias el orden."
                >
                  <GalleryUpload photos={photos} onChange={change(setPhotos)} />
                </Field>
              </div>
              <div className={cn("grid gap-6 md:grid-cols-2", mediaType !== "VIDEO" && "hidden")}>
                <div className="space-y-4">
                  <ChoiceGroup
                    name="videoSource"
                    value={videoSource}
                    onChange={change(setVideoSource)}
                    options={[
                      { value: "YOUTUBE", label: "Enlace de YouTube" },
                      { value: "FILE", label: "Archivo de video" },
                    ]}
                  />
                  <div className={cn(videoSource !== "YOUTUBE" && "hidden")}>
                    <Field
                      id="videoYoutube"
                      label="Enlace de YouTube"
                      hint="En YouTube, pulsa «Compartir», luego «Copiar» y pega el enlace aquí."
                    >
                      <Input
                        id="videoYoutube"
                        value={youtubeInput}
                        onChange={(event) => change(setYoutubeInput)(event.target.value)}
                        maxLength={200}
                        className="h-12 text-base"
                        placeholder="https://www.youtube.com/watch?v=…"
                      />
                      {youtubeInput.trim() && !youtubePreviewId ? (
                        <p className="text-sm text-red-700">Ese enlace no parece de un video de YouTube.</p>
                      ) : null}
                      {youtubePreviewId ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://i.ytimg.com/vi/${youtubePreviewId}/hqdefault.jpg`}
                          alt="Miniatura del video de YouTube"
                          className="aspect-video w-full rounded-lg border border-brand-border object-cover"
                        />
                      ) : null}
                    </Field>
                  </div>
                  <div className={cn(videoSource !== "FILE" && "hidden")}>
                    <Field
                      label="Archivo de video"
                      hint="MP4 o WebM, de hasta 200 MB. Se sube al publicar."
                    >
                      <VideoUpload currentSrc={article?.videoFileSrc} />
                    </Field>
                  </div>
                </div>
                <div className="space-y-6">
                  <Field
                    label="Portada del video (opcional)"
                    hint="Imagen que se ve antes de reproducir. Si no subes una, se usa la de YouTube o el primer cuadro del video."
                  >
                    <ImageUpload currentSrc={article?.imageSrc} />
                  </Field>
                  <Field
                    id="imageAlt"
                    label="Descripción del video"
                    hint="Una frase que diga qué se ve. Ejemplo: «Recorrido por el centro histórico de Barquisimeto»."
                  >
                    <Input
                      id="imageAlt"
                      name="imageAlt"
                      defaultValue={article?.imageAlt ?? ""}
                      maxLength={200}
                      placeholder="Describe en una frase lo que se ve"
                    />
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section hidden={step !== 2} aria-label="Paso 3: Documento PDF">
          <Card>
            <CardHeader>
              <CardTitle>Paso 3 · Documento PDF (opcional)</CardTitle>
              <CardDescription className="text-base">
                Decretos, estudios o cuadernillos que el público pueda ver o descargar. Si la
                noticia no lleva documento, pulsa «Siguiente».
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Field
                label="Archivo PDF"
                hint="De hasta 20 MB. El nombre es el que verá el público; puedes cambiarlo."
              >
                <DocumentUpload value={pdfDraft} onChange={change(setPdfDraft)} />
              </Field>
            </CardContent>
          </Card>
        </section>

        <section hidden={step !== LAST_STEP} aria-label="Paso 4: Revisar y publicar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Paso 4 · Revisa antes de {isEdit || !willPublish ? "guardar" : "publicar"}</CardTitle>
              <CardDescription className="text-base">
                Así quedará la noticia. Si algo no está bien, pulsa «Cambiar» al lado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl>
                <SummaryRow label="Título" onChange={() => goTo(0)}>
                  <span className="font-serif text-xl font-bold">{summary.title || "—"}</span>
                </SummaryRow>
                <SummaryRow label="Subtítulo" onChange={() => goTo(0)}>
                  {summary.subtitle || "—"}
                </SummaryRow>
                <SummaryRow label="Fecha y categoría" onChange={() => goTo(0)}>
                  {formatDay(summary.publishedAt ?? "")} · {summary.categoryLabel}
                </SummaryRow>
                <SummaryRow label="Texto de la noticia" onChange={() => goTo(0)}>
                  {summary.lead?.trim()
                    ? `${summary.lead.trim().slice(0, 160)}${summary.lead.trim().length > 160 ? "…" : ""}`
                    : "Sin texto adicional"}
                </SummaryRow>
                <SummaryRow label="Fotos o video" onChange={() => goTo(1)}>
                  {mediaType === "VIDEO" ? (
                    videoSource === "YOUTUBE" ? (
                      "Video de YouTube"
                    ) : (
                      "Video subido como archivo"
                    )
                  ) : photoCount === 0 ? (
                    "Sin fotos: se mostrará como tarjeta de texto"
                  ) : (
                    <span className="flex flex-wrap items-center gap-2">
                      {photos.slice(0, 6).map((photo) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={photo.key}
                          src={photo.preview}
                          alt=""
                          className="h-14 w-20 rounded-md border border-brand-border object-cover"
                        />
                      ))}
                      <span>
                        {photoCount === 1 ? "1 foto" : `Galería de ${photoCount} fotos`}
                      </span>
                    </span>
                  )}
                </SummaryRow>
                <SummaryRow label="Documento PDF" onChange={() => goTo(2)}>
                  {pdfDraft ? `${pdfDraft.name} (${formatBytes(pdfDraft.bytes)})` : "Sin documento"}
                </SummaryRow>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>¿Quién la puede ver?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-brand-border p-4 has-[:checked]:border-emerald-400 has-[:checked]:bg-emerald-50">
                <input
                  type="checkbox"
                  name="published"
                  className="mt-1 size-6 accent-emerald-600"
                  checked={willPublish}
                  onChange={(event) => setWillPublish(event.target.checked)}
                />
                <span>
                  <span className="text-base font-semibold text-brand-navy">Visible en el sitio</span>
                  <span className="mt-1 block text-base leading-relaxed text-brand-muted">
                    Marcada: el público la ve en el Observatorio. Sin marcar: queda guardada como
                    borrador y solo se ve en este panel.
                  </span>
                </span>
              </label>
              {canFeature ? (
                <label className="flex cursor-pointer items-start gap-4 rounded-lg border border-brand-border p-4 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-50">
                  <input
                    type="checkbox"
                    name="featured"
                    className="mt-1 size-6 accent-amber-500"
                    defaultChecked={article?.featured ?? false}
                  />
                  <span>
                    <span className="text-base font-semibold text-brand-navy">Destacada</span>
                    <span className="mt-1 block text-base leading-relaxed text-brand-muted">
                      Aparece primero y en grande en el Observatorio. Solo puede haber una: si
                      marcas esta, se quita la anterior.
                    </span>
                  </span>
                </label>
              ) : (
                <p className="text-base leading-relaxed text-brand-muted">
                  {article?.featured
                    ? "Esta noticia es la destacada del Observatorio. Solo un admin puede cambiarlo."
                    : "La noticia destacada del Observatorio la elige un admin."}
                </p>
              )}
            </CardContent>
          </Card>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-border bg-white/95 px-4 py-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/85 md:pl-72">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
            {dirty ? (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="lg" disabled={pending}>
                    Cancelar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Salir sin guardar?</AlertDialogTitle>
                    <AlertDialogDescription className="text-base">
                      Lo que escribiste o subiste en esta noticia se va a perder.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Seguir editando</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-700 text-white hover:bg-red-800"
                      onClick={() => router.push("/admin/noticias")}
                    >
                      Sí, salir sin guardar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            ) : (
              <Link href="/admin/noticias" className={cn(buttonVariants({ variant: "ghost", size: "lg" }))}>
                Cancelar
              </Link>
            )}
            <div className="flex flex-wrap gap-3">
              {step > 0 ? (
                <Button variant="outline" size="lg" disabled={pending} onClick={() => goTo(step - 1)}>
                  <ArrowLeft aria-hidden="true" />
                  Atrás
                </Button>
              ) : null}
              {isEdit && step < LAST_STEP ? (
                <Button variant="outline" size="lg" disabled={pending} onClick={() => goTo(LAST_STEP)}>
                  Ir a guardar
                </Button>
              ) : null}
              {/* Keys distintas: si React reutilizara el mismo <button> y lo volviera "submit"
                  durante el clic de "Siguiente", el navegador publicaría sin pasar por la revisión. */}
              {step < LAST_STEP ? (
                <Button key="next" size="lg" className="text-base" disabled={pending} onClick={goNext}>
                  Siguiente: {STEPS[step + 1]}
                  <ArrowRight aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  key="submit"
                  type="submit"
                  size="lg"
                  variant="terracotta"
                  className="text-base"
                  disabled={pending}
                >
                  {finalLabel}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>

      {pending ? (
        // Mientras sube y guarda: aviso grande que tapa la pantalla para que nadie la cierre.
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="saving-title"
          className="fixed inset-0 z-50 grid place-items-center bg-brand-navy/40 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md space-y-5 rounded-2xl bg-white p-8 text-center shadow-2xl">
            <p id="saving-title" className="text-xl font-semibold text-brand-navy">
              {uploadLabel || "Preparando…"}
            </p>
            <Progress value={progress} aria-label="Avance" />
            <p className="text-base text-brand-muted">
              No cierres esta página ni apagues el computador hasta que termine.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
