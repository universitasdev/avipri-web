export const AUTH_COOKIES = {
  access: "pdul_at",
  refresh: "pdul_rt",
} as const;

export const ACCESS_TTL_SECONDS = 60 * 15;
export const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;
export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_LOCK_MINUTES = 15;

export function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET debe tener al menos 32 caracteres.");
  }
  return new TextEncoder().encode(secret);
}

export function getRefreshSecret() {
  const secret = process.env.AUTH_REFRESH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_REFRESH_SECRET debe tener al menos 32 caracteres.");
  }
  return new TextEncoder().encode(secret);
}
