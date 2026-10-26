import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  DIRECT_UPLOADS,
  createSignedUpload,
  isGcsConfigured,
  type DirectUploadKind,
} from "@/lib/storage/gcs";

type DirectUploadRoute = {
  kind: DirectUploadKind;
  /** Extensión real según los primeros bytes, o null si el archivo no es del tipo esperado. */
  detect: (bytes: Buffer) => string | null;
  messages: { type: string; missing: string; invalid: string; tooBig: string };
};

/**
 * Subida de archivos grandes (video, PDF).
 * Con Cloud Storage: recibe JSON { contentType, size } y devuelve una URL firmada
 * para subir directo al bucket. Sin Cloud Storage (desarrollo local): recibe el
 * archivo en multipart y lo guarda en public/uploads/news/<carpeta>.
 */
export async function handleDirectUpload(request: Request, route: DirectUploadRoute) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const config = DIRECT_UPLOADS[route.kind];
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    let body: { contentType?: unknown; size?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
    }
    if (typeof body.contentType !== "string" || !config.types[body.contentType]) {
      return NextResponse.json({ error: route.messages.type }, { status: 400 });
    }
    if (typeof body.size !== "number" || body.size <= 0 || body.size > config.maxBytes) {
      return NextResponse.json({ error: route.messages.tooBig }, { status: 400 });
    }
    if (!isGcsConfigured()) {
      return NextResponse.json({ mode: "server" });
    }
    try {
      const signed = await createSignedUpload(route.kind, body.contentType);
      return NextResponse.json({ mode: "direct", ...signed });
    } catch (error) {
      console.error(`news ${route.kind} sign failed`, error);
      return NextResponse.json({ error: "No se pudo preparar la subida." }, { status: 500 });
    }
  }

  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Formato no soportado." }, { status: 415 });
  }
  if (isGcsConfigured()) {
    // En producción el archivo nunca pasa por el servidor.
    return NextResponse.json({ error: "Usa la subida directa." }, { status: 400 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: route.messages.missing }, { status: 400 });
  }
  if (file.size > config.maxBytes) {
    return NextResponse.json({ error: route.messages.tooBig }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = route.detect(buffer);
  if (!extension) {
    return NextResponse.json({ error: route.messages.invalid }, { status: 400 });
  }

  const filename = `${randomBytes(16).toString("hex")}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads", "news", config.folder);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), buffer);
  return NextResponse.json({ url: `/uploads/news/${config.folder}/${filename}` });
}
