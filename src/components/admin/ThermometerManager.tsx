"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorAlert } from "@/components/admin/ui/error-alert";
import { Button, buttonVariants } from "@/components/admin/ui/button";
import { ResultBanner } from "@/components/admin/ui/result-banner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Label } from "@/components/admin/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/admin/ui/radio-group";
import { Textarea } from "@/components/admin/ui/textarea";
import { Input } from "@/components/admin/ui/input";
import { adminFetch, readError } from "@/components/admin/admin-fetch";
import { THERMOMETER_STEPS } from "@/lib/thermometer/steps";
import { cn } from "@/lib/utils";

export function ThermometerManager({
  activeIndex,
  activeTitle,
  activeDescription,
}: {
  activeIndex: number;
  activeTitle: string;
  activeDescription: string;
}) {
  const router = useRouter();
  const [index, setIndex] = useState(activeIndex);
  const [title, setTitle] = useState(activeTitle);
  const [description, setDescription] = useState(activeDescription);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Fase recién publicada: se muestra en un aviso fijo hasta que la persona lo cierra.
  const [published, setPublished] = useState<string | null>(null);
  const [invalid, setInvalid] = useState<"activeTitle" | "activeDescription" | null>(null);

  function selectStep(nextIndex: number) {
    setIndex(nextIndex);
    const step = THERMOMETER_STEPS[nextIndex];
    setTitle(`Fase ${nextIndex + 1}: ${step.label}.`);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPublished(null);

    // Avisos propios (toast) en vez de los globos del navegador.
    const problem =
      title.trim().length < 4
        ? { field: "activeTitle" as const, title: "Escribe el título de la fase en curso" }
        : description.trim().length < 8
          ? {
              field: "activeDescription" as const,
              title: "Escribe la descripción de la barra informativa",
              description: "Debe tener al menos 8 caracteres.",
            }
          : null;
    if (problem) {
      setInvalid(problem.field);
      toast.error(problem.title, { description: problem.description });
      document.getElementById(problem.field)?.focus();
      return;
    }

    setPending(true);

    const response = await adminFetch("/api/admin/thermometer", {
      method: "PATCH",
      body: JSON.stringify({
        activeIndex: index,
        activeTitle: title,
        activeDescription: description,
      }),
    });

    if (!response.ok) {
      setError(`No se pudo publicar el termómetro. ${await readError(response)}`);
      setPending(false);
      return;
    }

    setPending(false);
    const stepLabel = THERMOMETER_STEPS[index]?.label ?? "fase activa";
    setPublished(stepLabel);
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {published ? (
        <ResultBanner
          title="Termómetro publicado"
          onClose={() => setPublished(null)}
          actions={
            <a
              href="/abc-pdul"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Verlo en El ABC del PDUL
              <span className="sr-only">(se abre en otra pestaña)</span>
            </a>
          }
        >
          La fase en curso ahora es «{published}».
        </ResultBanner>
      ) : null}
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-navy">Termómetro</h1>
        <p className="mt-1 text-base text-brand-muted">
          Elige la fase en curso. Las anteriores quedan completadas automáticamente.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fase activa</CardTitle>
          <CardDescription>
            El texto de la barra informativa se muestra debajo del termómetro en El ABC del PDUL.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={onSubmit} noValidate>
            <RadioGroup
              aria-label="Fase en curso"
              value={String(index)}
              onValueChange={(value) => selectStep(Number(value))}
            >
              {THERMOMETER_STEPS.map((step, stepIndex) => {
                const state =
                  stepIndex < index ? "Completada" : stepIndex === index ? "En curso" : "Pendiente";
                return (
                  <label
                    key={step.key}
                    htmlFor={`fase-${stepIndex}`}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4",
                      stepIndex === index
                        ? "border-brand-terracotta bg-orange-50"
                        : "border-brand-border bg-white",
                    )}
                  >
                    <RadioGroupItem id={`fase-${stepIndex}`} value={String(stepIndex)} className="mt-0.5" />
                    <span>
                      <span className="block text-base font-medium text-brand-navy">
                        {stepIndex + 1}. {step.label}
                      </span>
                      <span className="text-sm text-brand-muted">{state}</span>
                    </span>
                  </label>
                );
              })}
            </RadioGroup>

            <div className="space-y-2">
              <Label htmlFor="activeTitle">Título de la fase en curso</Label>
              <Input
                id="activeTitle"
                value={title}
                onChange={(event) => {
                  setTitle(event.target.value);
                  setInvalid(null);
                }}
                aria-invalid={invalid === "activeTitle" || undefined}
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activeDescription">Descripción de la barra informativa</Label>
              <Textarea
                id="activeDescription"
                value={description}
                onChange={(event) => {
                  setDescription(event.target.value);
                  setInvalid(null);
                }}
                aria-invalid={invalid === "activeDescription" || undefined}
                maxLength={600}
                rows={4}
              />
            </div>
            {error ? <ErrorAlert title="No se pudo publicar el termómetro">{error}</ErrorAlert> : null}
            <Button type="submit" variant="terracotta" size="lg" className="text-base" disabled={pending}>
              {pending ? "Guardando…" : "Publicar termómetro"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
