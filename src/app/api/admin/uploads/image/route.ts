import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isGcsConfigured, uploadNewsImageToGcs } from "@/lib/storage/gcs";

const MAX_BYTES = 3 * 1024 * 1024;
const ALLOWED = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

function extensionFromMagic(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "png";
  }
  if (
    bytes.length >= 12 &&
    bytes.toString("ascii", 0, 4) === "RIFF" &&
    bytes.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if (!auth.ok) return auth.response;

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Formato no soportado." }, { status: 415 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Selecciona una imagen." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "La imagen no puede superar 3 MB." }, { status: 400 });
  }

  const declaredExt = ALLOWED[file.type as keyof typeof ALLOWED];
  if (file.type && !declaredExt) {
    return NextResponse.json(
      { error: "Solo se admiten JPG, PNG o WebP." },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const magicExt = extensionFromMagic(buffer);
  if (!magicExt || (declaredExt && declaredExt !== magicExt)) {
    return NextResponse.json({ error: "El archivo no es una imagen válida." }, { status: 400 });
  }

  try {
    if (isGcsConfigured()) {
      const url = await uploadNewsImageToGcs(buffer, magicExt);
      return NextResponse.json({ url });
    }

    const filename = `${randomBytes(16).toString("hex")}.${magicExt}`;
    const directory = path.join(process.cwd(), "public", "uploads", "news");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, filename), buffer);
    return NextResponse.json({ url: `/uploads/news/${filename}` });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "No se pudo guardar la imagen. Revisa la configuración de almacenamiento." },
      { status: 500 },
    );
  }
}
