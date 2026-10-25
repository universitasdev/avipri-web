"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Alert } from "@/components/admin/ui/alert";
import { Badge } from "@/components/admin/ui/badge";
import { Button } from "@/components/admin/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/admin/ui/card";
import { Input } from "@/components/admin/ui/input";
import { Label } from "@/components/admin/ui/label";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/admin/ui/table";
import { adminFetch, readError } from "@/components/admin/admin-fetch";

export type AdminUserItem = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  active: boolean;
  mustChangePassword: boolean;
  newsCount: number;
};

type IssuedCredentials = { email: string; password: string; reason: "creado" | "reseteado" };

const ROLE_LABEL = { ADMIN: "Admin", EDITOR: "Editor" } as const;

// Sin caracteres ambiguos (0/O, 1/l/I) para dictarla o copiarla a mano.
const PASSWORD_ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generatePassword(length = 12) {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => PASSWORD_ALPHABET[value % PASSWORD_ALPHABET.length]).join("");
}

export function UsersManager({
  users,
  currentUserId,
}: {
  users: AdminUserItem[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [password, setPassword] = useState(() => generatePassword());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [issued, setIssued] = useState<IssuedCredentials | null>(null);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);
    setCreating(true);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const email = String(form.get("email") ?? "");
    const response = await adminFetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        email,
        role: String(form.get("role") ?? "EDITOR"),
        password,
      }),
    });
    setCreating(false);

    if (!response.ok) {
      setCreateError(await readError(response));
      return;
    }

    setIssued({ email: email.trim().toLowerCase(), password, reason: "creado" });
    formElement.reset();
    setPassword(generatePassword());
    router.refresh();
  }

  async function updateUser(user: AdminUserItem, changes: Record<string, unknown>, success: string) {
    setBusyId(user.id);
    const response = await adminFetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });
    setBusyId(null);

    if (!response.ok) {
      toast.error("No se pudo actualizar", { description: await readError(response) });
      return false;
    }

    toast.success(success);
    router.refresh();
    return true;
  }

  async function resetPassword(user: AdminUserItem) {
    const temporary = generatePassword();
    const ok = await updateUser(user, { password: temporary }, "Contraseña reseteada");
    if (ok) setIssued({ email: user.email, password: temporary, reason: "reseteado" });
  }

  async function copyCredentials() {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(`Correo: ${issued.email}\nContraseña temporal: ${issued.password}`);
      toast.success("Credenciales copiadas");
    } catch {
      toast.error("No se pudo copiar; cópialas a mano.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-navy">Usuarios</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Los editores cargan y publican sus propias noticias. Solo los admins gestionan usuarios,
          el termómetro y la noticia destacada.
        </p>
      </div>

      {issued ? (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardHeader>
            <CardTitle>
              {issued.reason === "creado" ? "Usuario creado" : "Contraseña reseteada"}
            </CardTitle>
            <CardDescription>
              Entrega estas credenciales a la persona por un canal privado. La contraseña no se
              vuelve a mostrar, y el sistema le pedirá cambiarla al entrar.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-md border border-emerald-200 bg-white p-3 font-mono text-sm">
              <p>Correo: {issued.email}</p>
              <p>Contraseña temporal: {issued.password}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={copyCredentials}>
                Copiar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIssued(null)}>
                Listo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Nuevo usuario</CardTitle>
          <CardDescription>Se crea con una contraseña temporal.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={createUser}>
            {createError ? <Alert className="md:col-span-2">{createError}</Alert> : null}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" required minLength={2} maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" name="email" type="email" required maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <select
                id="role"
                name="role"
                defaultValue="EDITOR"
                className="flex h-10 w-full rounded-md border border-brand-border bg-white px-3 text-sm"
              >
                <option value="EDITOR">Editor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña temporal</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={8}
                  maxLength={72}
                  className="font-mono"
                />
                <Button type="button" variant="outline" onClick={() => setPassword(generatePassword())}>
                  Generar
                </Button>
              </div>
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={creating}>
                {creating ? "Creando…" : "Crear usuario"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Noticias</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const isSelf = user.id === currentUserId;
              const busy = busyId === user.id;
              return (
                <TableRow key={user.id} className={user.active ? undefined : "opacity-60"}>
                  <TableCell>
                    <p className="font-medium text-brand-navy">
                      {user.name}
                      {isSelf ? <span className="ml-2 text-xs text-brand-muted">(tú)</span> : null}
                    </p>
                    <p className="mt-1 text-xs text-brand-muted">{user.email}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {ROLE_LABEL[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Badge variant={user.active ? "success" : "outline"}>
                      {user.active ? "Activo" : "Desactivado"}
                    </Badge>
                    {user.mustChangePassword ? (
                      <Badge variant="warning">Clave temporal</Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{user.newsCount}</TableCell>
                  <TableCell className="whitespace-nowrap text-right">
                    {isSelf ? null : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy}
                          onClick={() =>
                            updateUser(
                              user,
                              { role: user.role === "ADMIN" ? "EDITOR" : "ADMIN" },
                              user.role === "ADMIN" ? "Ahora es editor" : "Ahora es admin",
                            )
                          }
                        >
                          {user.role === "ADMIN" ? "Pasar a editor" : "Hacer admin"}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="ml-2" disabled={busy}>
                              Resetear clave
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Resetear la contraseña?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Se generará una contraseña temporal nueva para {user.name} y se
                                cerrarán sus sesiones abiertas.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => resetPassword(user)}>
                                Sí, resetear
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        {user.active ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="ml-2 text-red-700"
                                disabled={busy}
                              >
                                Desactivar
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Desactivar a {user.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  No podrá entrar al panel y su sesión se cierra de inmediato. Sus
                                  noticias siguen publicadas. Puedes reactivarla después.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-700 text-white hover:bg-red-800"
                                  onClick={() => updateUser(user, { active: false }, "Usuario desactivado")}
                                >
                                  Sí, desactivar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="ml-2"
                            disabled={busy}
                            onClick={() => updateUser(user, { active: true }, "Usuario reactivado")}
                          >
                            Reactivar
                          </Button>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
