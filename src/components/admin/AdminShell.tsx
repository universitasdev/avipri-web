"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Newspaper, Thermometer, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { Separator } from "@/components/admin/ui/separator";
import { Toaster } from "@/components/admin/ui/sonner";
import { adminFetch } from "@/components/admin/admin-fetch";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Resumen", icon: LayoutDashboard },
  { href: "/admin/noticias", label: "Noticias", icon: Newspaper },
  { href: "/admin/termometro", label: "Termómetro", icon: Thermometer },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({
  user,
  children,
}: {
  user: { name: string; email: string };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

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
          {NAV.map((item) => {
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
          <p className="truncate text-sm font-medium text-brand-navy">{user.name}</p>
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
            {NAV.map((item) => {
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
