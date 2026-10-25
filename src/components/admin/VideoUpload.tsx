"use client";

import { useRef, useState } from "react";
import { Film } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { adminFetch, readError } from "@/components/admin/admin-fetch";

export const VIDEO_MAX_BYTES = 200 * 1024 * 1024;
const ALLOWED = ["video/mp4", "video/webm"];

function videoContentType(file: File) {
  if (file.type) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".mp4")) return "video/mp4";
  if (name.endsWith(".webm")) return "video/webm";
  return "";
}

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
        let message = "No se pudo subir el video.";
        try {
          message = (JSON.parse(xhr.responseText) as { error?: string }).error || message;
        } catch {}
        reject(new Error(message));
      }
    };
    xhr.onerror = () => reject(new Error("Se cortó la conexión mientras subía el video."));
    xhr.send(body);
  });
}

/** Sube el video: directo a Cloud Storage con URL firmada, o al servidor en local. */
export async function uploadNewsVideo(file: File, onProgress: (percent: number) => void) {
  const contentType = videoContentType(file);
  const response = await adminFetch("/api/admin/uploads/video", {
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
  const text = await sendWithProgress("POST", "/api/admin/uploads/video", body, {}, onProgress);
  const data = JSON.parse(text) as { url?: string };
  if (!data.url) throw new Error("No se pudo guardar el video.");
  return data.url;
}

export function VideoUpload({ currentSrc }: { currentSrc?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [cleared, setCleared] = useState(false);
  const [preview, setPreview] = useState(currentSrc ?? "");
  const [localError, setLocalError] = useState<string | null>(null);

  function revokeIfBlob(url: string) {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  }

  function clearVideo() {
    if (inputRef.current) inputRef.current.value = "";
    revokeIfBlob(preview);
    setFile(null);
    setCleared(true);
    setPreview("");
    setLocalError(null);
  }

  return (
    <div className="space-y-3">
      <input type="hidden" name="videoFileSrc" value={file || cleared ? "" : currentSrc ?? ""} />
      <input
        ref={inputRef}
        type="file"
        name="videoFile"
        accept="video/mp4,video/webm,.mp4,.webm"
        className="hidden"
        onChange={(event) => {
          const next = event.target.files?.[0];
          if (!next) return;
          if (!ALLOWED.includes(videoContentType(next))) {
            setLocalError("Solo se admiten videos MP4 o WebM. Si tu video es .mov, expórtalo como MP4.");
            event.target.value = "";
            return;
          }
          if (next.size > VIDEO_MAX_BYTES) {
            setLocalError("El video no puede superar 200 MB.");
            event.target.value = "";
            return;
          }
          setLocalError(null);
          revokeIfBlob(preview);
          setFile(next);
          setCleared(false);
          setPreview(URL.createObjectURL(next));
        }}
      />
      <div className="overflow-hidden rounded-lg border border-brand-border bg-slate-900">
        {preview ? (
          <video src={preview} controls preload="metadata" className="aspect-video w-full" />
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-slate-50 text-sm text-brand-muted">
            <Film className="h-6 w-6" />
            Todavía no hay video
          </div>
        )}
      </div>
      {file ? (
        <p className="text-xs text-brand-muted">
          {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB. Se sube al guardar la noticia.
        </p>
      ) : null}
      {localError ? <p className="text-xs text-red-700">{localError}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
          {preview ? "Cambiar video" : "Subir video"}
        </Button>
        {preview ? (
          <Button variant="ghost" size="sm" className="text-red-700" onClick={clearVideo}>
            Quitar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
