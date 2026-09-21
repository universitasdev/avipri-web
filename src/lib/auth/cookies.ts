import { cookies } from "next/headers";
import {
  ACCESS_TTL_SECONDS,
  AUTH_COOKIES,
  REFRESH_TTL_SECONDS,
} from "@/lib/auth/config";

function cookieBase() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies();
  jar.set(AUTH_COOKIES.access, accessToken, {
    ...cookieBase(),
    maxAge: ACCESS_TTL_SECONDS,
  });
  jar.set(AUTH_COOKIES.refresh, refreshToken, {
    ...cookieBase(),
    maxAge: REFRESH_TTL_SECONDS,
  });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.set(AUTH_COOKIES.access, "", { ...cookieBase(), maxAge: 0 });
  jar.set(AUTH_COOKIES.refresh, "", { ...cookieBase(), maxAge: 0 });
}

export async function readAuthCookies() {
  const jar = await cookies();
  return {
    accessToken: jar.get(AUTH_COOKIES.access)?.value ?? null,
    refreshToken: jar.get(AUTH_COOKIES.refresh)?.value ?? null,
  };
}
