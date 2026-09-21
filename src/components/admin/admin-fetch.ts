"use client";

export async function adminFetch(input: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const request = { ...init, headers, credentials: "same-origin" as const };
  let response = await fetch(input, request);

  if (response.status === 401 && !input.includes("/auth/login")) {
    const refresh = await fetch("/api/admin/auth/refresh", {
      method: "POST",
      credentials: "same-origin",
    });
    if (refresh.ok) {
      response = await fetch(input, request);
    } else {
      window.location.href = "/admin/login";
    }
  }

  return response;
}

export async function readError(response: Response) {
  try {
    const data = (await response.json()) as { error?: string };
    return data.error || "No se pudo completar la acción.";
  } catch {
    return "No se pudo completar la acción.";
  }
}
