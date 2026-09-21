import { getPrisma } from "@/lib/db";
import { clearAuthCookies, readAuthCookies, setAuthCookies } from "@/lib/auth/cookies";
import { hashToken, signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "@/lib/auth/tokens";
import { REFRESH_TTL_SECONDS } from "@/lib/auth/config";

export async function getCurrentAdmin() {
  const { accessToken } = await readAuthCookies();
  if (!accessToken) return null;

  try {
    const claims = await verifyAccessToken(accessToken);
    const prisma = await getPrisma();
    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: { id: true, email: true, name: true },
    });
    return user;
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

export async function rotateRefreshSession() {
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

    await issueSession({ id: stored.user.id, email: stored.user.email });
    return { id: stored.user.id, email: stored.user.email, name: stored.user.name };
  } catch {
    await clearAuthCookies();
    return null;
  }
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
