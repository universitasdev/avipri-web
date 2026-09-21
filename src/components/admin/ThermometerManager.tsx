"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Label } from "@/components/admin/ui/label";
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

  function selectStep(nextIndex: number) {
    setIndex(nextIndex);
    const step = THERMOMETER_STEPS[nextIndex];
    setTitle(`Fase ${nextIndex + 1}: ${step.label}.`);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
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
      toast.error("No se pudo publicar el termómetro", {
        description: await readError(response),
      });
      setPending(false);
      return;
    }

    setPending(false);
    const stepLabel = THERMOMETER_STEPS[index]?.label ?? "fase activa";
    toast.success("Termómetro publicado", {
      description: `La fase en curso ahora es “${stepLabel}”. Ya se ve en El ABC del PDUL.`,
      action: {
        label: "Ver ABC",
        onClick: () => window.open("/abc-pdul", "_blank", "noopener,noreferrer"),
      },
    });
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-navy">Termómetro</h1>
        <p className="mt-1 text-sm text-brand-muted">
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
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-3">
              {THERMOMETER_STEPS.map((step, stepIndex) => {
                const state =
                  stepIndex < index ? "Completada" : stepIndex === index ? "En curso" : "Pendiente";
                return (
                  <label
                    key={step.key}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-4",
                      stepIndex === index
                        ? "border-brand-terracotta bg-orange-50"
                        : "border-brand-border bg-white",
                    )}
                  >
                    <input
                      type="radio"
                      name="activeIndex"
                      className="mt-1"
                      checked={index === stepIndex}
                      onChange={() => selectStep(stepIndex)}
                    />
                    <span>
                      <span className="block font-medium text-brand-navy">
                        {stepIndex + 1}. {step.label}
                      </span>
                      <span className="text-xs text-brand-muted">{state}</span>
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="space-y-2">
              <Label htmlFor="activeTitle">Título de la fase en curso</Label>
              <Input
                id="activeTitle"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
                maxLength={160}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="activeDescription">Descripción de la barra informativa</Label>
              <Textarea
                id="activeDescription"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                maxLength={600}
                rows={4}
              />
            </div>
            <Button type="submit" variant="terracotta" disabled={pending}>
              {pending ? "Guardando…" : "Publicar termómetro"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
