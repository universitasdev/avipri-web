import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Toaster } from "@/components/admin/ui/sonner";

export const metadata: Metadata = {
  title: "Panel editorial",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root min-h-screen font-sans text-brand-text">
      {children}
      {/* Aquí y no en el menú: así los avisos también salen en el inicio de sesión y al crear la contraseña. */}
      <Toaster />
    </div>
  );
}
