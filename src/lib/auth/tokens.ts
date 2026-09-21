import { createHash, randomUUID } from "crypto";
import { SignJWT, jwtVerify } from "jose";
import {
  ACCESS_TTL_SECONDS,
  REFRESH_TTL_SECONDS,
  getAuthSecret,
  getRefreshSecret,
} from "@/lib/auth/config";

const ISSUER = "pdul.online";
const AUDIENCE = "pdul-admin";

export type AccessClaims = {
  sub: string;
  email: string;
  typ: "access";
};

export type RefreshClaims = {
  sub: string;
  jti: string;
  typ: "refresh";
};

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function signAccessToken(user: { id: string; email: string }) {
  return new SignJWT({ email: user.email, typ: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${ACCESS_TTL_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function signRefreshToken(userId: string) {
  const jti = randomUUID();
  const token = await new SignJWT({ typ: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setJti(jti)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${REFRESH_TTL_SECONDS}s`)
    .sign(getRefreshSecret());
  return { token, jti };
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, getAuthSecret(), {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  if (payload.typ !== "access" || !payload.sub || typeof payload.email !== "string") {
    throw new Error("Access token inválido");
  }
  return payload as unknown as AccessClaims;
}

export async function verifyRefreshToken(token: string) {
  const { payload } = await jwtVerify(token, getRefreshSecret(), {
    issuer: ISSUER,
    audience: AUDIENCE,
  });
  if (payload.typ !== "refresh" || !payload.sub || !payload.jti) {
    throw new Error("Refresh token inválido");
  }
  return payload as unknown as RefreshClaims;
}
