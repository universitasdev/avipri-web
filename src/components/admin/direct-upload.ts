"use client";

import { adminFetch, readError } from "@/components/admin/admin-fetch";

function sendWithProgress(
  method: "PUT" | "POST",
  url: string,
  body: Blob | FormData,
  headers: Record<string, string>,
  onProgress: (percent: number) => void,
) {
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    for (const [key, value] of Object.entries(headers)) xhr.setRequestHeader(key, value);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
      else {
        let message = "No se pudo subir el archivo.";
        try {
          message = (JSON.parse(xhr.responseText) as { error?: string }).error || message;
        } catch {}
        reject(new Error(message));
      }
    };
    xhr.onerror = () => reject(new Error("Se cortó la conexión mientras subía el archivo."));
    xhr.send(body);
  });
}

/**
 * Sube un archivo grande (video o PDF) por la ruta indicada: directo a Cloud Storage con
 * URL firmada o, en desarrollo local, al servidor. Devuelve la URL pública del archivo.
 */
export async function uploadDirect(
  endpoint: string,
  file: File,
  contentType: string,
  onProgress: (percent: number) => void,
) {
  const response = await adminFetch(endpoint, {
    method: "POST",
    body: JSON.stringify({ contentType, size: file.size }),
  });
  if (!response.ok) throw new Error(await readError(response));

  const plan = (await response.json()) as
    | { mode: "direct"; uploadUrl: string; headers: Record<string, string>; url: string }
    | { mode: "server" };

  if (plan.mode === "direct") {
    await sendWithProgress("PUT", plan.uploadUrl, file, plan.headers, onProgress);
    return plan.url;
  }

  const body = new FormData();
  body.append("file", file);
  const text = await sendWithProgress("POST", endpoint, body, {}, onProgress);
  const data = JSON.parse(text) as { url?: string };
  if (!data.url) throw new Error("No se pudo guardar el archivo.");
  return data.url;
}
