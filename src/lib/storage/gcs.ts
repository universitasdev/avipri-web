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
