import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  NEWS_VIDEO_MAX_BYTES,
  NEWS_VIDEO_TYPES,
  createNewsVideoUploadUrl,
  isGcsConfigured,
  type NewsVideoContentType,
} from "@/lib/storage/gcs";

const MAX_LABEL = `${NEWS_VIDEO_MAX_BYTES / (1024 * 1024)} MB`;

function isVideoType(value: unknown): value is NewsVideoContentType {
  return typeof value === "string" && value in NEWS_VIDEO_TYPES;
}

function extensionFromMagic(bytes: Buffer) {
  // MP4: caja "ftyp" a partir del byte 4.
  if (bytes.length >= 12 && bytes.toString("ascii", 4, 8) === "ftyp") return "mp4";
  // WebM (EBML): 1A 45 DF A3.
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "webm";
  }
  return null;
}

/**
 * Con Cloud Storage: recibe JSON { contentType, size } y devuelve una URL firmada
 * para subir directo al bucket. Sin Cloud Storage (desarrollo local): recibe el
 * archivo en multipart y lo guarda en public/uploads/news/videos.
 */
export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    let body: { contentType?: unknown; size?: unknown };
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 });
    }
    if (!isVideoType(body.contentType)) {
      return NextResponse.json({ error: "Solo se admiten videos MP4 o WebM." }, { status: 400 });
    }
    if (typeof body.size !== "number" || body.size <= 0 || body.size > NEWS_VIDEO_MAX_BYTES) {
      return NextResponse.json(
        { error: `El video no puede superar ${MAX_LABEL}.` },
        { status: 400 },
      );
    }
    if (!isGcsConfigured()) {
      return NextResponse.json({ mode: "server" });
    }
    try {
      const signed = await createNewsVideoUploadUrl(body.contentType);
      return NextResponse.json({ mode: "direct", ...signed });
    } catch (error) {
      console.error("news video sign failed", error);
      return NextResponse.json(
        { error: "No se pudo preparar la subida del video." },
        { status: 500 },
      );
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
    return NextResponse.json({ error: "Selecciona un video." }, { status: 400 });
  }
  if (file.size > NEWS_VIDEO_MAX_BYTES) {
    return NextResponse.json({ error: `El video no puede superar ${MAX_LABEL}.` }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = extensionFromMagic(buffer);
  if (!extension) {
    return NextResponse.json({ error: "El archivo no es un video MP4 o WebM válido." }, { status: 400 });
  }

  const filename = `${randomBytes(16).toString("hex")}.${extension}`;
  const directory = path.join(process.cwd(), "public", "uploads", "news", "videos");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, filename), buffer);
  return NextResponse.json({ url: `/uploads/news/videos/${filename}` });
}
