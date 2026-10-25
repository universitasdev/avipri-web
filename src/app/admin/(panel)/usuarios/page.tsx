import { redirect } from "next/navigation";
import { UsersManager } from "@/components/admin/UsersManager";
import { getAdminUsers } from "@/lib/admin/users";
import { isAdminRole } from "@/lib/auth/permissions";
import { getCurrentAdmin } from "@/lib/auth/session";

export default async function AdminUsersPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !isAdminRole(admin)) redirect("/admin");

  const rows = await getAdminUsers();
  const users = rows.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    active: user.active,
    mustChangePassword: user.mustChangePassword,
    newsCount: user._count.newsCreated,
  }));

  return <UsersManager users={users} currentUserId={admin.id} />;
}
