"use client";

import { useRef, useState } from "react";
import { Film } from "lucide-react";
import { Button } from "@/components/admin/ui/button";
import { uploadDirect } from "@/components/admin/direct-upload";

export const VIDEO_MAX_BYTES = 200 * 1024 * 1024;
const ALLOWED = ["video/mp4", "video/webm"];

function videoContentType(file: File) {
  if (file.type) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".mp4")) return "video/mp4";
  if (name.endsWith(".webm")) return "video/webm";
  return "";
}

/** Sube el video: directo a Cloud Storage con URL firmada, o al servidor en local. */
export function uploadNewsVideo(file: File, onProgress: (percent: number) => void) {
  return uploadDirect("/api/admin/uploads/video", file, videoContentType(file), onProgress);
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
        <p className="text-sm text-brand-muted">
          {file.name} · {(file.size / (1024 * 1024)).toFixed(1)} MB. Se sube al guardar la noticia.
        </p>
      ) : null}
      {localError ? <p className="text-sm text-red-700">{localError}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="lg" onClick={() => inputRef.current?.click()}>
          {preview ? "Cambiar video" : "Subir video"}
        </Button>
        {preview ? (
          <Button variant="ghost"
            size="lg" className="text-red-700" onClick={clearVideo}>
            Quitar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
