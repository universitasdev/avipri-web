"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { Alert } from "@/components/admin/ui/alert";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
import { PasswordInput } from "@/components/admin/ui/password-input";
import { adminFetch, readError } from "@/components/admin/admin-fetch";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const response = await adminFetch("/api/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
      }),
    });

    if (!response.ok) {
      // Mensaje claro para el caso más común: correo o contraseña mal escritos.
      setError(
        response.status === 401
          ? "El correo o la contraseña no coinciden. Revísalos con calma; con «Mostrar» puedes ver la contraseña que escribiste."
          : await readError(response),
      );
      setPending(false);
      return;
    }

    const from = searchParams.get("from");
    router.replace(from?.startsWith("/admin") ? from : "/admin");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-terracotta">
          PDUL Online
        </p>
        <CardTitle className="mt-2">Panel editorial</CardTitle>
        <CardDescription className="text-base">
          Entra con el correo y la contraseña que te dio el administrador.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={onSubmit}>
          {error ? <Alert variant="destructive" className="text-base">{error}</Alert> : null}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-base">
              Correo
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              required
              maxLength={120}
              className="h-12 text-base"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-base">
              Contraseña
            </Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              required
              minLength={8}
              maxLength={72}
            />
          </div>
          <Button type="submit" size="lg" className="h-12 w-full text-base" disabled={pending}>
            {pending ? "Entrando…" : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
