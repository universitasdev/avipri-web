import type { Role } from "@prisma/client";

type Actor = { id: string; role: Role };

export function isAdminRole(user: { role: Role }) {
  return user.role === "ADMIN";
}

// Los editores solo gestionan lo que crearon; las noticias sin autor (previas a los roles) son del admin.
export function canEditArticle(user: Actor, article: { createdById: string | null }) {
  return isAdminRole(user) || (article.createdById !== null && article.createdById === user.id);
}

// Destacar desmarca la destacada anterior, que puede ser de otro autor.
export function canFeatureArticle(user: { role: Role }) {
  return isAdminRole(user);
}
