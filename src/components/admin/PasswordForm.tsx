"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Alert } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { adminFetch, readError } from "@/components/admin/admin-fetch";

export function PasswordForm({ forced = false }: { forced?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

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
      toast.success("Contraseña actualizada", {
        description: "Las sesiones abiertas en otros equipos se cerraron.",
      });
    }
    router.refresh();
  }

  return (
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
          {error ? <Alert>{error}</Alert> : null}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">
              {forced ? "Contraseña temporal" : "Contraseña actual"}
            </Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
              minLength={8}
              maxLength={72}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nueva contraseña</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Repite la nueva contraseña</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              maxLength={72}
            />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Guardando…" : "Guardar contraseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
