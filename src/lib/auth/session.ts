import { getPrisma } from "@/lib/db";
import { clearAuthCookies, readAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { hashToken, signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "@/lib/auth/tokens";
import { REFRESH_TTL_SECONDS } from "@/lib/auth/config";
import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  mustChangePassword: boolean;
};

const SESSION_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  mustChangePassword: true,
  active: true,
} as const;

function toSessionUser(user: SessionUser & { active: boolean }): SessionUser | null {
  if (!user.active) return null;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
}

export async function getCurrentAdmin(): Promise<SessionUser | null> {
  const { accessToken } = await readAuthCookies();
  if (!accessToken) return null;

  try {
    const claims = await verifyAccessToken(accessToken);
    const prisma = await getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: SESSION_USER_SELECT,
    });
    return user ? toSessionUser(user) : null;
  } catch {
    return null;
  }
}

export async function issueSession(user: { id: string; email: string }) {
  const accessToken = await signAccessToken(user);
  const refresh = await signRefreshToken(user.id);
  const prisma = await getPrisma();
  await prisma.refreshToken.create({
    data: {
      id: refresh.jti,
      userId: user.id,
      tokenHash: hashToken(refresh.token),
      expiresAt: new Date(Date.now() + REFRESH_TTL_SECONDS * 1000),
    },
  });
  await setAuthCookies(accessToken, refresh.token);
}

export async function rotateRefreshSession(): Promise<SessionUser | null> {
  const { refreshToken } = await readAuthCookies();
  if (!refreshToken) {
    await clearAuthCookies();
    return null;
  }

  try {
    const claims = await verifyRefreshToken(refreshToken);
    const prisma = await getPrisma();
    const stored = await prisma.refreshToken.findUnique({
      where: { id: claims.jti },
      include: { user: true },
    });

    if (!stored || stored.userId !== claims.sub || stored.tokenHash !== hashToken(refreshToken)) {
      await clearAuthCookies();
      return null;
    }

    if (stored.revokedAt) {
      await prisma.refreshToken.updateMany({
        where: { userId: stored.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      await clearAuthCookies();
      return null;
    }

    if (stored.expiresAt.getTime() < Date.now()) {
      await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revokedAt: new Date() },
      });
      await clearAuthCookies();
      return null;
    }

    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const sessionUser = toSessionUser(stored.user);
    if (!sessionUser) {
      await clearAuthCookies();
      return null;
    }

    await issueSession({ id: sessionUser.id, email: sessionUser.email });
    return sessionUser;
  } catch {
    await clearAuthCookies();
    return null;
  }
}

export async function revokeAllSessions(userId: string) {
  const prisma = await getPrisma();
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function revokeCurrentSession() {
  const { refreshToken } = await readAuthCookies();
  if (refreshToken) {
    try {
      const claims = await verifyRefreshToken(refreshToken);
      const prisma = await getPrisma();
      await prisma.refreshToken.updateMany({
        where: { id: claims.jti, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      // Cookie inválida: igual se limpia.
    }
  }
  await clearAuthCookies();
}
