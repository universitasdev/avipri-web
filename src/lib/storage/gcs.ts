import { Storage } from "@google-cloud/storage";
import { randomBytes } from "crypto";

const ALLOWED_EXT = new Set(["jpg", "png", "webp"]);

function getBucketName() {
  return process.env.GCS_BUCKET?.trim() || null;
}

function createStorageClient() {
  const projectId = process.env.GCS_PROJECT_ID?.trim() || undefined;
  const clientEmail = process.env.GCS_CLIENT_EMAIL?.trim();
  const privateKey = process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey) {
    return new Storage({
      projectId,
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });
  }

  return new Storage({ projectId });
}

export function isGcsConfigured() {
  return Boolean(getBucketName());
}

export const NEWS_VIDEO_TYPES = {
  "video/mp4": "mp4",
  "video/webm": "webm",
} as const;

export type NewsVideoContentType = keyof typeof NEWS_VIDEO_TYPES;

export const NEWS_VIDEO_MAX_BYTES = 200 * 1024 * 1024;

/**
 * URL firmada para que el navegador suba el video directo al bucket: los archivos
 * grandes no pasan por las funciones de Netlify, que limitan el tamaño de la petición.
 * El bucket necesita CORS que permita PUT desde el dominio del sitio.
 */
export async function createNewsVideoUploadUrl(contentType: NewsVideoContentType) {
  const bucketName = getBucketName();
  if (!bucketName) {
    throw new Error("GCS_BUCKET no está configurado.");
  }

  const objectPath = `news/videos/${randomBytes(16).toString("hex")}.${NEWS_VIDEO_TYPES[contentType]}`;
  const headers = {
    "Content-Type": contentType,
    "x-goog-content-length-range": `0,${NEWS_VIDEO_MAX_BYTES}`,
  };
  const [uploadUrl] = await createStorageClient()
    .bucket(bucketName)
    .file(objectPath)
    .getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 30 * 60 * 1000,
      contentType,
      extensionHeaders: { "x-goog-content-length-range": headers["x-goog-content-length-range"] },
    });

  return {
    uploadUrl,
    headers,
    url: `https://storage.googleapis.com/${bucketName}/${objectPath}`,
  };
}

export async function uploadNewsImageToGcs(buffer: Buffer, extension: string) {
  const bucketName = getBucketName();
  if (!bucketName) {
    throw new Error("GCS_BUCKET no está configurado.");
  }
  if (!ALLOWED_EXT.has(extension)) {
    throw new Error("Extensión no permitida.");
  }

  const filename = `${randomBytes(16).toString("hex")}.${extension}`;
  const objectPath = `news/${filename}`;
  const storage = createStorageClient();
  const file = storage.bucket(bucketName).file(objectPath);

  await file.save(buffer, {
    resumable: false,
    contentType: extension === "jpg" ? "image/jpeg" : `image/${extension}`,
    metadata: {
      cacheControl: "public, max-age=31536000, immutable",
    },
  });

  return `https://storage.googleapis.com/${bucketName}/${objectPath}`;
}
