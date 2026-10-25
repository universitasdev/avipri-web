"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Newspaper, Thermometer, LayoutDashboard, LogOut, Users, UserCog } from "lucide-react";
import { Badge } from "@/components/admin/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/admin/ui/sidebar";
import { adminFetch } from "@/components/admin/admin-fetch";

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

type ShellUser = { name: string; email: string; role: Role };

function AdminSidebar({ user, onLogout }: { user: ShellUser; onLogout: () => void }) {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const nav = NAV.filter((item) => !item.adminOnly || user.role === "ADMIN");

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5 group-data-[collapsible=icon]:px-2.5">
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-brand-navy/30"
        >
          {/* Recogido, el menú muestra solo la inicial de la marca. */}
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-navy font-serif text-xl font-bold text-white">
            P
          </span>
          <span className="min-w-0 group-data-[collapsible=icon]:hidden">
            <span className="block text-xs font-semibold tracking-[0.2em] text-brand-terracotta uppercase">
              PDUL Online
            </span>
            <span className="block truncate font-serif text-xl font-bold text-brand-navy">
              Panel editorial
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Secciones</SidebarGroupLabel>
          <SidebarMenu>
            {nav.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActivePath(pathname, item.href)}
                  tooltip={item.label}
                >
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    <item.icon aria-hidden="true" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="px-1 group-data-[collapsible=icon]:hidden">
          <p className="flex items-center gap-2 text-base font-medium text-brand-navy">
            <span className="truncate">{user.name}</span>
            <Badge variant="secondary" className="shrink-0 text-[11px] uppercase">
              {ROLE_LABEL[user.role]}
            </Badge>
          </p>
          <p className="truncate text-sm text-brand-muted">{user.email}</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Cerrar sesión" onClick={onLogout}>
              <LogOut aria-hidden="true" />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

export function AdminShell({
  user,
  defaultSidebarOpen = true,
  children,
}: {
  user: ShellUser;
  /** Estado guardado en la cookie del sidebar (abierto o recogido). */
  defaultSidebarOpen?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();

  async function logout() {
    await adminFetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <SidebarProvider defaultOpen={defaultSidebarOpen}>
      <AdminSidebar user={user} onLogout={logout} />
      <SidebarInset>
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-brand-border bg-white/95 px-3 py-2.5 backdrop-blur sm:px-4">
          <SidebarTrigger showLabel className="text-base" />
          <span className="font-serif text-lg font-bold text-brand-navy md:hidden">Panel editorial</span>
        </header>
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
