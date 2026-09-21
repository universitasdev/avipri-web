"use client";

import { useEffect } from "react";

export function SessionRefresh() {
  useEffect(() => {
    fetch("/api/admin/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
    }).then((response) => {
      window.location.replace(response.ok ? "/admin" : "/admin/login");
    });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-brand-muted">
      Restaurando sesión…
    </div>
  );
}
