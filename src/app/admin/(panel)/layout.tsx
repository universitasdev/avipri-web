import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { SessionRefresh } from "@/components/admin/SessionRefresh";
import { readAuthCookies } from "@/lib/auth/cookies";
import { getCurrentAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({ children }: { children: ReactNode }) {
  const admin = await getCurrentAdmin();
  if (admin) {
    return <AdminShell user={admin}>{children}</AdminShell>;
  }

  const { refreshToken } = await readAuthCookies();
  if (refreshToken) {
    return <SessionRefresh />;
  }

  redirect("/admin/login");
}
