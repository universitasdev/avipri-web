"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { PasswordRules } from "@/components/admin/PasswordRules";
import { joinSpanish, PASSWORD_MAX_LENGTH, passwordProblems } from "@/lib/auth/password-policy";
import { ErrorAlert } from "@/components/admin/ui/error-alert";
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
import { ResultBanner } from "@/components/admin/ui/result-banner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/admin/ui/select";

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
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const DIGITS = "23456789";
const SYMBOLS = "!@#$%&*?";

function randomIndex(max: number) {
  return crypto.getRandomValues(new Uint32Array(1))[0] % max;
}

/** Contraseña temporal que cumple las reglas: siempre lleva mayúscula, número y símbolo. */
function generatePassword(length = 12) {
  const all = LOWER + UPPER + DIGITS + SYMBOLS;
  const chars = [UPPER, LOWER, DIGITS, SYMBOLS].map((set) => set[randomIndex(set.length)]);
  while (chars.length < length) chars.push(all[randomIndex(all.length)]);
  // Mezcla para que la mayúscula y el símbolo no caigan siempre al principio.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
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
  const [newRole, setNewRole] = useState<"EDITOR" | "ADMIN">("EDITOR");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [issued, setIssued] = useState<IssuedCredentials | null>(null);
  // Resultado del último cambio (rol, activar, desactivar): aviso fijo, no un toast que se va.
  const [notice, setNotice] = useState<{ tone: "success" | "error"; title: string; text?: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError(null);

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    // Avisos propios (toast) en vez de los globos del navegador.
    const problems = passwordProblems(password);
    const problem =
      name.length < 2
        ? { field: "name", title: "Escribe el nombre de la persona" }
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ? { field: "email", title: "Revisa el correo", description: "Debe verse así: nombre@correo.com" }
          : problems.length > 0
            ? {
                field: "password",
                title: "La contraseña temporal no es segura",
                description: `Le falta: ${joinSpanish(problems)}. Pulsa «Generar» para crear una que sí cumpla.`,
              }
            : null;
    if (problem) {
      toast.error(problem.title, { description: problem.description });
      document.getElementById(problem.field)?.focus();
      return;
    }

    setCreating(true);
    const response = await adminFetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify({
        name,
        email,
        role: newRole,
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
    setNewRole("EDITOR");
    changePassword(generatePassword());
    router.refresh();
  }

  async function updateUser(user: AdminUserItem, changes: Record<string, unknown>, success: string) {
    setBusyId(user.id);
    setNotice(null);
    const response = await adminFetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    });
    setBusyId(null);

    if (!response.ok) {
      setNotice({ tone: "error", title: "No se pudo hacer el cambio", text: await readError(response) });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    setNotice({ tone: "success", title: success, text: `${user.name} (${user.email})` });
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.refresh();
    return true;
  }

  async function resetPassword(user: AdminUserItem) {
    const temporary = generatePassword();
    const ok = await updateUser(user, { password: temporary }, "Contraseña reseteada");
    if (ok) setIssued({ email: user.email, password: temporary, reason: "reseteado" });
  }

  function changePassword(value: string) {
    setPassword(value);
    setPasswordCopied(false);
  }

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(password);
      setPasswordCopied(true);
    } catch {
      setNotice({ tone: "error", title: "No se pudo copiar", text: "Selecciona la contraseña y cópiala a mano." });
    }
  }

  async function copyCredentials() {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(`Correo: ${issued.email}\nContraseña temporal: ${issued.password}`);
      setCopied(true);
    } catch {
      setCopied(false);
      setNotice({ tone: "error", title: "No se pudo copiar", text: "Selecciona el texto de las credenciales y cópialo a mano." });
    }
  }

  return (
    <div className="space-y-6">
      {notice?.tone === "success" ? (
        <ResultBanner title={notice.title} onClose={() => setNotice(null)}>
          {notice.text}
        </ResultBanner>
      ) : notice ? (
        <ErrorAlert title={notice.title}>{notice.text}</ErrorAlert>
      ) : null}
      <div>
        <h1 className="font-serif text-3xl font-bold text-brand-navy">Usuarios</h1>
        <p className="mt-1 text-base text-brand-muted">
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
              <Button size="lg" onClick={copyCredentials}>
                {copied ? "Copiado ✓" : "Copiar"}
              </Button>
              <Button size="lg" variant="outline" onClick={() => { setIssued(null); setCopied(false); }}>
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
          <form className="grid gap-4 md:grid-cols-2" onSubmit={createUser} noValidate>
            {createError ? (
              <ErrorAlert title="No se pudo crear el usuario" className="md:col-span-2">
                {createError}
              </ErrorAlert>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo</Label>
              <Input id="email" name="email" type="email" maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select value={newRole} onValueChange={(value) => setNewRole(value as "EDITOR" | "ADMIN")}>
                <SelectTrigger id="role">
                  <SelectValue>{newRole === "ADMIN" ? "Admin" : "Editor"}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EDITOR">Editor</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-brand-muted">
                {newRole === "EDITOR"
                  ? "Carga noticias y edita solo las suyas."
                  : "Además crea usuarios, maneja el termómetro y elige la noticia destacada."}
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña temporal</Label>
              <Input
                id="password"
                value={password}
                onChange={(event) => changePassword(event.target.value)}
                maxLength={PASSWORD_MAX_LENGTH}
                aria-describedby="password-rules"
                className="font-mono"
              />
              <PasswordRules id="password-rules" value={password} />
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => changePassword(generatePassword())}>
                  <RefreshCw aria-hidden="true" />
                  Generar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={copyPassword}
                  className={passwordCopied ? "border-emerald-300 bg-emerald-50 text-emerald-800" : undefined}
                >
                  {passwordCopied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  {passwordCopied ? "Copiada" : "Copiar"}
                </Button>
              </div>
              <p className="text-sm text-brand-muted" aria-live="polite">
                {passwordCopied
                  ? "Contraseña copiada. Ya puedes pegarla donde la vayas a enviar."
                  : "Cópiala para enviársela a la persona por un canal privado."}
              </p>
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
                      {isSelf ? <span className="ml-2 text-sm text-brand-muted">(tú)</span> : null}
                    </p>
                    <p className="mt-1 text-sm text-brand-muted">{user.email}</p>
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
                            <Button variant="ghost" className="ml-2" disabled={busy}>
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
