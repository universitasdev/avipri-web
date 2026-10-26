import { getPrisma } from "@/lib/db";

export const ADMIN_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  mustChangePassword: true,
  createdAt: true,
  _count: { select: { newsCreated: true } },
} as const;

export async function getAdminUsers() {
  const prisma = await getPrisma();
  return prisma.user.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: ADMIN_USER_SELECT,
  });
}
