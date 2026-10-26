import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SIDEBAR_COOKIE_NAME } from "@/components/admin/ui/sidebar-cookie";
import { PasswordForm } from "@/components/admin/PasswordForm";
import { SessionRefresh } from "@/components/admin/SessionRefresh";
import { readAuthCookies } from "@/lib/auth/cookies";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const admin = await getCurrentAdmin();
  if (admin?.mustChangePassword) {
    // Con contraseña temporal, cualquier ruta del panel muestra solo el cambio de clave.
    return (
      <div className="legal-scaffold relative flex min-h-screen items-center justify-center px-4 py-12">
        <div className="relative z-10 flex w-full justify-center">
          <PasswordForm forced />
        </div>
      </div>
    );
  }
  if (admin) {
    // El menú abre como se dejó la última vez (abierto o recogido), sin parpadeo al cargar.
    const sidebarOpen = (await cookies()).get(SIDEBAR_COOKIE_NAME)?.value !== "false";
    return (
      <AdminShell user={admin} defaultSidebarOpen={sidebarOpen}>
        {children}
      </AdminShell>
    );
  }

  const { refreshToken } = await readAuthCookies();
  if (refreshToken) {
    return <SessionRefresh />;
  }

  redirect("/admin/login");
}
