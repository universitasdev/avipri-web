"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { PasswordInput } from "@/components/admin/ui/password-input";
import { ResultBanner } from "@/components/admin/ui/result-banner";
import { Label } from "@/components/admin/ui/label";
import { adminFetch, readError } from "@/components/admin/admin-fetch";

export function PasswordForm({ forced = false }: { forced?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const newPassword = String(form.get("newPassword") ?? "");
    if (newPassword !== String(form.get("confirmPassword") ?? "")) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }

    setPending(true);
    const response = await adminFetch("/api/admin/auth/password", {
      method: "POST",
      body: JSON.stringify({
        currentPassword: String(form.get("currentPassword") ?? ""),
        newPassword,
      }),
    });
    setPending(false);

    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    formElement.reset();
    if (forced) {
      router.replace("/admin");
    } else {
      setSaved(true);
    }
    router.refresh();
  }

  return (
    <div className="w-full max-w-md space-y-4">
      {saved ? (
        <ResultBanner title="Contraseña actualizada" onClose={() => setSaved(false)}>
          La próxima vez entra con la contraseña nueva. Las sesiones abiertas en otros equipos se
          cerraron.
        </ResultBanner>
      ) : null}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{forced ? "Crea tu contraseña" : "Cambiar contraseña"}</CardTitle>
          <CardDescription>
            {forced
              ? "Entraste con una contraseña temporal. Elige una propia para continuar."
              : "Al cambiarla se cierran tus sesiones en otros equipos."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error ? <Alert variant="destructive" className="text-base">{error}</Alert> : null}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-base">
                {forced ? "Contraseña temporal" : "Contraseña actual"}
              </Label>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                autoComplete="current-password"
                required
                minLength={8}
                maxLength={72}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-base">Nueva contraseña</Label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base">Repite la nueva contraseña</Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
              />
            </div>
            <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={pending}>
              {pending ? "Guardando…" : "Guardar contraseña"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
