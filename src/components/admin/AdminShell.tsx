"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Newspaper, Thermometer, LayoutDashboard, LogOut, Users, UserCog } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Separator } from "@/components/admin/ui/separator";
import { Toaster } from "@/components/admin/ui/sonner";
import { adminFetch } from "@/components/admin/admin-fetch";
import { cn } from "@/lib/utils";

type Role = "ADMIN" | "EDITOR";

const NAV: { href: string; label: string; icon: typeof Newspaper; adminOnly?: boolean }[] = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/noticias", label: "Noticias", icon: Newspaper },
  { href: "/admin/termometro", label: "Termómetro", icon: Thermometer, adminOnly: true },
  { href: "/admin/usuarios", label: "Usuarios", icon: Users, adminOnly: true },
  { href: "/admin/cuenta", label: "Mi cuenta", icon: UserCog },
];

const ROLE_LABEL: Record<Role, string> = { ADMIN: "Admin", EDITOR: "Editor" };

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string; role: Role };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const nav = NAV.filter((item) => !item.adminOnly || user.role === "ADMIN");

  async function logout() {
    await adminFetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster />
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-brand-border bg-white md:flex md:flex-col">
        <div className="px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-terracotta">
            PDUL Online
          </p>
          <p className="mt-1 font-serif text-2xl font-bold text-brand-navy">Panel editorial</p>
        </div>
        <Separator />
        <nav className="flex flex-1 flex-col gap-1 p-4">
          {nav.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-navy text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-brand-navy",
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4">
          <p className="flex items-center gap-2 text-sm font-medium text-brand-navy">
            <span className="truncate">{user.name}</span>
            <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
              {ROLE_LABEL[user.role]}
            </span>
          </p>
          <p className="truncate text-xs text-brand-muted">{user.email}</p>
          <Button variant="outline" className="mt-3 w-full" onClick={logout}>
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 border-b border-brand-border bg-white/95 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3">
            <p className="font-serif text-lg font-bold text-brand-navy">Panel editorial</p>
            <Button size="sm" variant="outline" onClick={logout}>
              Salir
            </Button>
          </div>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {nav.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold",
                    active ? "bg-brand-navy text-white" : "bg-slate-100 text-slate-600",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
