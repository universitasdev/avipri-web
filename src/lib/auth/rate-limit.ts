import { getPrisma } from "@/lib/db";
import { LOGIN_LOCK_MINUTES, LOGIN_MAX_FAILURES } from "@/lib/auth/config";
import { getClientIp } from "@/lib/auth/request";

export async function assertLoginAllowed(request: Request) {
  const ip = getClientIp(request);
  const prisma = await getPrisma();
  const row = await prisma.loginAttempt.findUnique({ where: { ip } });

  if (row?.lockedUntil && row.lockedUntil.getTime() > Date.now()) {
    return { allowed: false as const, ip };
  }

  return { allowed: true as const, ip };
}

export async function recordLoginFailure(ip: string) {
  const prisma = await getPrisma();
  const existing = await prisma.loginAttempt.findUnique({ where: { ip } });
  const failedCount = (existing?.failedCount ?? 0) + 1;
  const lockedUntil =
    failedCount >= LOGIN_MAX_FAILURES
      ? new Date(Date.now() + LOGIN_LOCK_MINUTES * 60 * 1000)
      : existing?.lockedUntil && existing.lockedUntil.getTime() > Date.now()
        ? existing.lockedUntil
        : null;

  await prisma.loginAttempt.upsert({
    where: { ip },
    create: { ip, failedCount, lockedUntil },
    update: { failedCount, lockedUntil },
  });
}

export async function recordLoginSuccess(ip: string) {
  const prisma = await getPrisma();
  await prisma.loginAttempt.deleteMany({ where: { ip } });
}
