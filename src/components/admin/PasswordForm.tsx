"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ErrorAlert } from "@/components/admin/ui/error-alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { PasswordInput } from "@/components/admin/ui/password-input";
import { ResultBanner } from "@/components/admin/ui/result-banner";
import { Label } from "@/components/admin/ui/label";
import { PasswordRules } from "@/components/admin/PasswordRules";
import { adminFetch, readError } from "@/components/admin/admin-fetch";
import { joinSpanish, PASSWORD_MAX_LENGTH, passwordProblems } from "@/lib/auth/password-policy";

type Field = "currentPassword" | "newPassword" | "confirmPassword";

export function PasswordForm({ forced = false }: { forced?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [invalid, setInvalid] = useState<Field | null>(null);

  // Avisos propios (toast) en vez de los globos del navegador, que son pequeños y en otro idioma.
  function reject(field: Field, title: string, description?: string) {
    setInvalid(field);
    toast.error(title, { description });
    document.getElementById(field)?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setInvalid(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const currentPassword = String(form.get("currentPassword") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (!currentPassword) {
      reject(
        "currentPassword",
        forced ? "Escribe la contraseña temporal" : "Escribe tu contraseña actual",
        forced ? "Es la que te dio el administrador para entrar." : undefined,
      );
      return;
    }
    const problems = passwordProblems(newPassword);
    if (problems.length > 0) {
      reject(
        "newPassword",
        "La nueva contraseña no es segura todavía",
        `Le falta: ${joinSpanish(problems)}.`,
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      reject(
        "confirmPassword",
        "Las contraseñas nuevas no coinciden",
        "Escribe la misma contraseña nueva en los dos campos.",
      );
      return;
    }

    setPending(true);
    const response = await adminFetch("/api/admin/auth/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setPending(false);

    if (!response.ok) {
      setError(await readError(response));
      return;
    }

    formElement.reset();
    setNewPassword("");
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
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            {error ? <ErrorAlert title="No se pudo guardar la contraseña">{error}</ErrorAlert> : null}
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-base">
                {forced ? "Contraseña temporal" : "Contraseña actual"}
              </Label>
              <PasswordInput
                id="currentPassword"
                name="currentPassword"
                autoComplete="current-password"
                maxLength={PASSWORD_MAX_LENGTH}
                aria-invalid={invalid === "currentPassword" || undefined}
                onChange={() => setInvalid(null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-base">Nueva contraseña</Label>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                autoComplete="new-password"
                maxLength={PASSWORD_MAX_LENGTH}
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setInvalid(null);
                }}
                aria-invalid={invalid === "newPassword" || undefined}
                aria-describedby="newPassword-rules"
              />
              <PasswordRules id="newPassword-rules" value={newPassword} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-base">Repite la nueva contraseña</Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                autoComplete="new-password"
                maxLength={PASSWORD_MAX_LENGTH}
                aria-invalid={invalid === "confirmPassword" || undefined}
                onChange={() => setInvalid(null)}
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
