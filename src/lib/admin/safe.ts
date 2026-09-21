export function safePublicUrl(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  if (trimmed.startsWith("https://")) return trimmed;
  return null;
}

export function safeNewsImagePath(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\/uploads\/news\/[a-zA-Z0-9_-]+\.(jpe?g|png|webp)$/.test(trimmed)) {
    return trimmed;
  }
  if (/^\/brand\/[a-zA-Z0-9._-]+\.(jpe?g|png|webp)$/.test(trimmed)) {
    return trimmed;
  }
  // Cloud Storage public object URL (path-style)
  if (
    /^https:\/\/storage\.googleapis\.com\/[a-z0-9._-]+\/news\/[a-zA-Z0-9_-]+\.(jpe?g|png|webp)$/i.test(
      trimmed,
    )
  ) {
    return trimmed;
  }
  return null;
}

export async function parseJsonBody(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    throw new Error("UNSUPPORTED");
  }
  return request.json() as Promise<unknown>;
}
